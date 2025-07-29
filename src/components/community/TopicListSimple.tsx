import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Topic {
  id: string;
  title: string;
  description: string;
  created_at: string;
  created_by: string;
  creator_name?: string;
}

interface TopicListSimpleProps {
  channelId: string;
  onTopicSelect: (topicId: string) => void;
  selectedTopicId: string | null;
}

export const TopicListSimple = ({ channelId, onTopicSelect, selectedTopicId }: TopicListSimpleProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (channelId) {
      fetchTopics();
    }
  }, [channelId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: false });

      if (topicsError) {
        console.error("Error fetching topics:", topicsError);
        setTopics([]);
        return;
      }

      // Fetch creator names
      const topicsWithCreators = await Promise.all(
        (topicsData || []).map(async (topic) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", topic.created_by)
            .single();
          
          return {
            ...topic,
            creator_name: profileData?.full_name || "Unknown"
          };
        })
      );

      setTopics(topicsWithCreators);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTopicTitle.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from("topics")
        .insert({
          channel_id: channelId,
          title: newTopicTitle.trim(),
          description: newTopicDescription.trim(),
          created_by: user.id,
        });

      if (error) {
        toast.error("Failed to create topic");
        console.error("Error creating topic:", error);
      } else {
        toast.success("Topic created successfully!");
        setNewTopicTitle("");
        setNewTopicDescription("");
        setShowNewTopic(false);
        fetchTopics();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Topics
            </CardTitle>
            <CardDescription>
              Join conversations and start discussions
            </CardDescription>
          </div>
          {user && (
            <Button
              size="sm"
              onClick={() => setShowNewTopic(!showNewTopic)}
              variant={showNewTopic ? "secondary" : "outline"}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showNewTopic && user && (
          <form onSubmit={handleCreateTopic} className="space-y-3 mb-4 p-3 border rounded-lg">
            <Input
              placeholder="Topic title"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Topic description (optional)"
              value={newTopicDescription}
              onChange={(e) => setNewTopicDescription(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNewTopic(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        
        <div className="space-y-2">
          {topics.map((topic) => (
            <Button
              key={topic.id}
              variant={selectedTopicId === topic.id ? "secondary" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onTopicSelect(topic.id)}
            >
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-sm truncate">
                  {topic.title}
                </div>
                {topic.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {topic.description}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  by {topic.creator_name || "Unknown"} • {new Date(topic.created_at).toLocaleDateString()}
                </div>
              </div>
            </Button>
          ))}
          
          {topics.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No topics yet</p>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowNewTopic(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Start a discussion
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};