import logo from "@/assets/logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { Crown, Vote } from "lucide-react";

interface HeroSectionProps {
  onVoteClick: () => void;
}

const HeroSection = ({ onVoteClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
        <div className="mb-6 flex justify-center">
          <img
            src={logo}
            alt="YIBS Logo"
            className="w-28 h-28 md:w-36 md:h-36 animate-float drop-shadow-2xl"
          />
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-gold" />
          <span className="text-gold font-body text-sm md:text-base font-semibold tracking-[0.3em] uppercase">
            Yaoundé International Business School
          </span>
          <Crown className="w-6 h-6 text-gold" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-4 leading-tight">
          Miss & Mister{" "}
          <span className="text-gradient-gold">YIBS 2026</span>
        </h1>

        <p className="text-primary-foreground/80 font-body text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Cast your vote for the next Miss and Mister Yaoundé International
          Business School. Every vote counts!
        </p>

        <button
          onClick={onVoteClick}
          className="group inline-flex items-center gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-body font-bold text-lg px-10 py-4 rounded-full shadow-gold transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <Vote className="w-5 h-5 group-hover:animate-bounce" />
          Vote Now
        </button>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 40L60 36C120 32 240 24 360 28C480 32 600 48 720 52C840 56 960 48 1080 40C1200 32 1320 24 1380 20L1440 16V80H0V40Z"
            fill="hsl(220, 20%, 97%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
