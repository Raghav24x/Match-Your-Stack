import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo.png";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-foreground hover:text-primary transition-colors">
            <img src={logoImage} alt="Match Your Stack Logo" className="h-10 w-10" />
            <span className="text-xl tracking-tight">Match Your Stack</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/directory" className="text-base font-medium text-foreground hover:text-primary transition-colors">
            📁 Directory
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <DarkModeToggle />
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to={"/auth"}>
                <Button variant="cta" size="sm" className="rounded-2xl">
                  Post a Brief
                </Button>
              </Link>
              <Link to={"/auth"}>
                <Button variant="outline" size="sm" className="rounded-2xl">
                  Join as Creator
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;