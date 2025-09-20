import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-secondary/30">
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
          Match Your <br />
          <span className="text-accent">Stack</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Connect companies with top Substack creators. Post a brief, get matched with 3-5 perfect creators, 
          and start building your content strategy today.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to={user ? "/onboard/company" : "/auth"}>
            <Button variant="cta" size="lg" className="text-lg px-8 py-6">
              Post a Brief (Company)
            </Button>
          </Link>
          <Link to={user ? "/onboard/creator" : "/auth"}>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Join as Creator
            </Button>
          </Link>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          Join hundreds of companies and creators building great content together
        </p>
      </div>
    </section>
  );
};

export default Hero;