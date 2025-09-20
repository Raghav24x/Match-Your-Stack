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
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            How Match Your Stack Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, effective creator matching in three easy steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-border/50 hover:border-cta/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button variant="cta" size="lg">
            Get started today
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;