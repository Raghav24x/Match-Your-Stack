import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50 mt-auto relative">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-secondary/[0.02] opacity-60"></div>
      
      <div className="relative container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Match Your Stack</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Connecting companies with talented Substack creators to build exceptional content strategies.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Platform</h4>
            <div className="space-y-3">
              <Link to="/directory" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                📁 Creator Directory
              </Link>
              <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                📝 Post a Brief
              </Link>
              <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                ✨ Join as Creator
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Company</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Legal</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Match Your Stack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;