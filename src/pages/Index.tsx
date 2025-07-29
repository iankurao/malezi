import { CommunityHero } from "@/components/CommunityHero";
import { CommunityFeatures } from "@/components/CommunityFeatures";
import { CommunityFooter } from "@/components/CommunityFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <CommunityHero />
      <CommunityFeatures />
      <CommunityFooter />
    </div>
  );
};

export default Index;
