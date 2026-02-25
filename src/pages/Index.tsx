import { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import VotingSection from "@/components/VotingSection";
import Footer from "@/components/Footer";

const Index = () => {
  const votingRef = useRef<HTMLDivElement>(null!);

  const scrollToVoting = () => {
    votingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onVoteClick={scrollToVoting} />
      <VotingSection sectionRef={votingRef} />
      <Footer />
    </div>
  );
};

export default Index;
