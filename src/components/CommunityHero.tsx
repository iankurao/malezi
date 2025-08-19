import { Button } from "@/components/ui/button";
import { Users, BookOpen, Globe, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const CommunityHero = () => {
  const { profile, user } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-primary via-community to-hero">
      {/* Navigation Header */}
      <div className="relative z-10 container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-white font-bold text-xl">
            E-Aware Parenting
          </Link>
          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/admin">
                  <Settings className="mr-1 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
            {user && (
              <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/profile">
                  <User className="mr-1 h-4 w-4" />
                  Profile
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Malezi
            </span>
            {" "}Community
          </h1>

          <p className="text-xl md:text-2xl leading-relaxed opacity-95 max-w-3xl mx-auto">
            Enlightening Parenting in the Digital Age and Understanding the Digital Uproar and Strengthening Parent-Child Communication.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-4">
              <Link to="/community">
                <Users className="mr-2 h-5 w-5" />
                Join Community
              </Link>
            </Button>
            <Button asChild variant="community" size="lg" className="text-lg px-8 py-4">
              <Link to="/resources">
                <BookOpen className="mr-2 h-5 w-5" />
                Resource Library
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Link to="/signup">
                <Globe className="mr-2 h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-90">Educators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-90">Resources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-sm opacity-90">Counties</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};