import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import HeroGraphic from "@/components/HeroGraphic";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[80vh] bg-background">
      {/* Subtle radial spotlight background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight tracking-tight">
              Match Your <br />
              <span className="text-primary">Stack</span>
            </h1>
            
            <p className="text-lg text-foreground/80 max-w-3xl leading-relaxed">
              Connect companies with top Substack creators. Post a brief, get matched with 3-5 perfect creators, 
              and start building your content strategy today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user ? "/onboard/company" : "/auth"}>
                <Button variant="cta" size="lg" className="text-base px-8 py-4 rounded-2xl font-medium shadow-lg">
                  Post a Brief
                </Button>
              </Link>
              <Link to={user ? "/onboard/creator" : "/auth"}>
                <Button variant="outline" size="lg" className="text-base px-8 py-4 rounded-2xl font-medium border-secondary/20 text-secondary hover:bg-secondary hover:text-background">
                  Join as Creator
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Join hundreds of companies and creators building great content together
            </p>
          </div>
          
          {/* Right column - Hero Graphic */}
          <div className="flex items-center justify-center lg:justify-end order-first lg:order-last">
            <HeroGraphic />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;