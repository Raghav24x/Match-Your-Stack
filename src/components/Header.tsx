import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80">
            <img src="/src/assets/logo.png" alt="Match Your Stack Logo" className="h-8 w-8" />
            <span>Match Your Stack</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/directory" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Directory
          </Link>
          {user && (
            <Link to="/brief/new" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Post Brief
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="cta" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;