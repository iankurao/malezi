import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Calendar, BookOpen, Trash2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CreateChannelDialog } from "@/components/community/CreateChannelDialog";
import { CreateResourceDialog } from "@/components/resources/CreateResourceDialog";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminStats {
  totalChannels: number;
  totalEvents: number;
  totalResources: number;
  totalUsers: number;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  public: boolean;
  color: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  event_type: string;
  current_participants: number;
  max_participants: number;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  file_type: string;
  download_count: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({ totalChannels: 0, totalEvents: 0, totalResources: 0, totalUsers: 0 });
  const [channels, setChannels] = useState<Channel[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [channelsData, eventsData, resourcesData, profilesData] = await Promise.all([
        supabase.from('channels').select('id'),
        supabase.from('events' as any).select('id'),
        supabase.from('resources').select('id'),
        supabase.from('profiles').select('id')
      ]);

      setStats({
        totalChannels: channelsData.data?.length || 0,
        totalEvents: eventsData.data?.length || 0,
        totalResources: resourcesData.data?.length || 0,
        totalUsers: profilesData.data?.length || 0,
      });

      // Fetch detailed data
      const [channelsResult, eventsResult, resourcesResult] = await Promise.all([
        supabase.from('channels').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('events' as any).select('*').order('start_date', { ascending: false }).limit(10),
        supabase.from('resources').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      if (channelsResult.data) setChannels(channelsResult.data);
      if (eventsResult.data) setEvents(eventsResult.data as unknown as Event[]);
      if (resourcesResult.data) setResources(resourcesResult.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      setChannels(channels.filter(c => c.id !== channelId));
      setStats(prev => ({ ...prev, totalChannels: prev.totalChannels - 1 }));
      
      toast({
        title: "Success",
        description: "Channel deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Error",
        description: "Failed to delete channel.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Please sign in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your E-Aware Parenting community</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          <Settings className="h-4 w-4 mr-1" />
          Administrator
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChannels}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResources}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Channels</h2>
            <CreateChannelDialog 
              onChannelCreated={() => fetchDashboardData()}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: channel.color }}
                      />
                      <CardTitle className="text-lg">{channel.name}</CardTitle>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteChannel(channel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant={channel.public ? "default" : "secondary"}>
                    {channel.public ? "Public" : "Private"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Events</h2>
            <CreateEventDialog 
              onEventCreated={() => fetchDashboardData()}
            />
          </div>
          
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{event.title}</CardTitle>
                    <Badge className="bg-purple-100 text-purple-800">
                      {event.event_type}
                    </Badge>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                    <span>👥 {event.current_participants}/{event.max_participants} registered</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manage Resources</h2>
            <Button onClick={() => setShowCreateResource(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Resource
            </Button>
          </div>
          
          <div className="space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{resource.title}</CardTitle>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>📁 {resource.file_type}</span>
                    <span>📥 {resource.download_count} downloads</span>
                    <span>📅 {new Date(resource.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateResourceDialog 
        open={showCreateResource} 
        onOpenChange={setShowCreateResource}
        onResourceCreated={() => {
          setShowCreateResource(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
}