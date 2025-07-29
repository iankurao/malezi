import { useState } from "react";
import { ChannelListSimple } from "@/components/community/ChannelListSimple";
import { TopicListSimple } from "@/components/community/TopicListSimple";
import { PostListSimple } from "@/components/community/PostListSimple";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Community = () => {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const { user, profile, signOut, loading } = useAuth();

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    setSelectedTopicId(null); // Reset topic selection
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">Malezi Community</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {profile?.full_name || user.email}!
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm" onClick={() => setShowAuth(true)}>
                Join Community
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {showAuth && !user ? (
          <div className="max-w-md mx-auto">
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Join Our Community</CardTitle>
                <CardDescription>
                  Connect with fellow educators, parents, and specialists working to make education more inclusive in Kenya.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowAuth(true)} className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Channels */}
            <div className="lg:col-span-1">
              <ChannelListSimple 
                onChannelSelect={handleChannelSelect}
                selectedChannelId={selectedChannelId}
              />
            </div>

            {/* Topics */}
            <div className="lg:col-span-1">
              {selectedChannelId ? (
                <TopicListSimple 
                  channelId={selectedChannelId}
                  onTopicSelect={handleTopicSelect}
                  selectedTopicId={selectedTopicId}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Select a Channel</CardTitle>
                    <CardDescription>
                      Choose a channel from the left to view discussions
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>

            {/* Posts */}
            <div className="lg:col-span-1">
              {selectedTopicId ? (
                <PostListSimple topicId={selectedTopicId} />
              ) : selectedChannelId ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Select a Topic</CardTitle>
                    <CardDescription>
                      Choose a topic to view and participate in the discussion
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Community Discussion</CardTitle>
                    <CardDescription>
                      Select a channel and topic to join the conversation
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;