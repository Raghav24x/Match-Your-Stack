import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      title: "Smart Matching",
      description: "Our algorithm matches companies with creators based on role type, niches, and budget fit.",
      icon: "🎯"
    },
    {
      title: "Quality Creators",
      description: "Access verified Substack creators with proven track records and engaged audiences.",
      icon: "✨"
    },
    {
      title: "Simple Workflow",
      description: "Post a brief, review matches, shortlist favorites, and start collaborating in minutes.",
      icon: "⚡"
    },
    {
      title: "Built-in Messaging",
      description: "Connect directly with creators through our integrated messaging system.",
      icon: "💬"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            How Match Your Stack Works
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            Simple, effective creator matching in three easy steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-border/50 hover:border-primary/20 transition-all duration-200 hover:shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl text-foreground tracking-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button variant="cta" size="lg" className="rounded-2xl px-8 py-4 font-medium shadow-lg">
            Get started today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;