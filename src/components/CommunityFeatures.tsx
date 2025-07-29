import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Calendar, BookOpen, Users, Award, Lightbulb } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Discussion Forums",
    description: "Engage in meaningful conversations about inclusive education practices and challenges.",
    color: "text-blue-600"
  },
  {
    icon: Calendar,
    title: "Community Events",
    description: "Join workshops, webinars, and local meetups to connect with fellow educators.",
    color: "text-green-600"
  },
  {
    icon: BookOpen,
    title: "Resource Library",
    description: "Access curated educational materials, tools, and best practices for inclusive learning.",
    color: "text-purple-600"
  },
  {
    icon: Users,
    title: "Mentorship Program",
    description: "Connect with experienced educators or share your expertise with newcomers.",
    color: "text-orange-600"
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "Earn badges and recognition for your contributions to the community.",
    color: "text-yellow-600"
  },
  {
    icon: Lightbulb,
    title: "Innovation Hub",
    description: "Share innovative teaching methods and learn from creative educators.",
    color: "text-pink-600"
  }
];

export const CommunityFeatures = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Community Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the tools and resources that make our community a powerful platform for inclusive education
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg bg-muted ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};