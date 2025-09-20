import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-secondary/30">
      <div className="absolute inset-0 opacity-10">
        <img 
          src={heroImage} 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
          A place for <br />
          <span className="text-accent">writers</span> to <br />
          share their ideas
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Start your newsletter, build your audience, and connect with readers who care about your work. 
          Simple, powerful, and designed for writers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="cta" size="lg" className="text-lg px-8 py-6">
            Start writing today
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            Explore stories
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-6">
          Join thousands of writers sharing their stories
        </p>
      </div>
    </section>
  );
};

export default Hero;