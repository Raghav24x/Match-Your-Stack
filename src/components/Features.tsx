import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      title: "Simple publishing",
      description: "Write and publish in minutes. No complex setup, no technical hurdles. Just you and your words.",
      icon: "✍️"
    },
    {
      title: "Built-in audience",
      description: "Reach readers who are actively looking for great content. No need to start from zero.",
      icon: "👥"
    },
    {
      title: "Subscriber management",
      description: "Easy tools to grow and engage your subscriber base. Email newsletters that actually get read.",
      icon: "📧"
    },
    {
      title: "Beautiful design",
      description: "Your writing deserves to look great. Clean, readable layouts that put your content first.",
      icon: "🎨"
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Everything you need to publish
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From your first post to building a thriving community, we've got the tools to help you succeed.
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
            Get started for free
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Features;