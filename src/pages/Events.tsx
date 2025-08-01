import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  event_type: string;
  max_participants: number;
  current_participants: number;
  is_featured: boolean;
  image_url?: string;
}

interface EventRegistration {
  event_id: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events' as any)
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents((data as unknown as Event[]) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_registrations' as any)
        .select('event_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setRegistrations((data as unknown as EventRegistration[]) || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register for events.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations' as any)
        .insert([{ event_id: eventId, user_id: user.id }]);

      if (error) throw error;

      setRegistrations([...registrations, { event_id: eventId }]);
      toast({
        title: "Success",
        description: "Successfully registered for the event!",
      });
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_registrations' as any)
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      setRegistrations(registrations.filter(reg => reg.event_id !== eventId));
      toast({
        title: "Success",
        description: "Successfully unregistered from the event.",
      });
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast({
        title: "Error",
        description: "Failed to unregister from event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some(reg => reg.event_id === eventId);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'webinar': return 'bg-green-100 text-green-800';
      case 'fair': return 'bg-purple-100 text-purple-800';
      case 'meetup': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Community Events</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join our workshops, webinars, and community gatherings focused on digital parenting and child development.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className={`relative ${event.is_featured ? 'ring-2 ring-primary' : ''}`}>
            {event.is_featured && (
              <Badge className="absolute -top-2 left-4 bg-primary">Featured</Badge>
            )}
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge className={getEventTypeColor(event.event_type)}>
                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                </Badge>
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription className="text-sm">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(event.start_date), 'MMM d, yyyy')}
                    {event.start_date !== event.end_date && 
                      ` - ${format(new Date(event.end_date), 'MMM d, yyyy')}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(event.start_date), 'h:mm a')} - 
                    {format(new Date(event.end_date), 'h:mm a')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.max_participants && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event.current_participants} / {event.max_participants} participants</span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                {isRegistered(event.id) ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleUnregister(event.id)}
                  >
                    Unregister
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleRegister(event.id)}
                    disabled={event.max_participants && event.current_participants >= event.max_participants}
                  >
                    {event.max_participants && event.current_participants >= event.max_participants
                      ? 'Event Full'
                      : 'Register Now'
                    }
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events available at the moment.</p>
        </div>
      )}
    </div>
  );
}