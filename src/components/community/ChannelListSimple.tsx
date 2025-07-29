import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Hash } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

interface ChannelListSimpleProps {
  onChannelSelect: (channelId: string) => void;
  selectedChannelId: string | null;
}

export const ChannelListSimple = ({ onChannelSelect, selectedChannelId }: ChannelListSimpleProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        setChannels(data || []);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Channels
        </CardTitle>
        <CardDescription>
          Explore different topics and discussions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={selectedChannelId === channel.id ? "secondary" : "ghost"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onChannelSelect(channel.id)}
            >
              <div className="flex items-start space-x-3 w-full">
                <div 
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: channel.color }}
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-sm truncate">
                    {channel.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {channel.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
          
          {channels.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No channels available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};