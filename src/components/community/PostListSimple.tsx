import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  creator_name?: string;
  creator_role?: string;
}

interface PostListSimpleProps {
  topicId: string;
}

export const PostListSimple = ({ topicId }: PostListSimpleProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (topicId) {
      fetchPosts();
    }
  }, [topicId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (postsError) {
        console.error("Error fetching posts:", postsError);
        setPosts([]);
        return;
      }

      // Fetch creator details
      const postsWithCreators = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("user_id", post.created_by)
            .single();
          
          return {
            ...post,
            creator_name: profileData?.full_name || "Unknown",
            creator_role: profileData?.role || "member"
          };
        })
      );

      setPosts(postsWithCreators);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          topic_id: topicId,
          content: newPost.trim(),
          created_by: user.id,
        });

      if (error) {
        toast.error("Failed to post message");
        console.error("Error creating post:", error);
      } else {
        setNewPost("");
        fetchPosts();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setPosting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "health_specialist":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "parent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "child":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case "health_specialist":
        return "Health Specialist";
      case "parent":
        return "Parent";
      case "child":
        return "Student";
      case "admin":
        return "Admin";
      default:
        return "Member";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion
        </CardTitle>
        <CardDescription>
          {posts.length} {posts.length === 1 ? "message" : "messages"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {posts.map((post) => (
            <div key={post.id} className="space-y-2">
               <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{post.creator_name || "Unknown"}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(post.creator_role || "")}`}>
                  {formatRole(post.creator_role || "")}
                </span>
                <span className="text-muted-foreground">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                {post.content}
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs">Be the first to start the conversation!</p>
            </div>
          )}
        </div>
        
        {user && (
          <form onSubmit={handleCreatePost} className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreatePost(e);
                }
              }}
            />
            <Button type="submit" disabled={posting || !newPost.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
        
        {!user && (
          <div className="text-center text-muted-foreground text-sm py-4 border-t">
            Sign in to join the conversation
          </div>
        )}
      </CardContent>
    </Card>
  );
};