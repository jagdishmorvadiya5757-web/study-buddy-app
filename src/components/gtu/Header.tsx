import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const GTU_LOGO = 'https://www.gtu.ac.in/img/gtu_logo.png';

const Header = () => {
  const { user, isAdmin, isSubAdmin, canAccessAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={GTU_LOGO}
            alt="GTU Logo"
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">
              GTU Study Mates
            </h1>
            <p className="text-xs text-muted-foreground">Engineering Resources Portal</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/resources"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Resources
          </Link>
          <Link
            to="/branches"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Branches
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {(isAdmin || isSubAdmin) ? <Shield className="w-4 h-4 text-primary" /> : <User className="w-4 h-4" />}
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canAccessAdmin && (
                  <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin' : '/admin/resources')}>
                    <Shield className="w-4 h-4 mr-2" />
                    {isAdmin ? 'Admin Panel' : 'Sub-Admin Panel'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Login</Link>
              </Button>
              <Button size="sm" className="gradient-primary" asChild>
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;