import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/gtu/Header';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Shield, 
  LogOut, 
  ChevronRight,
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-20">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <User className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view profile</h2>
            <p className="text-muted-foreground mb-4">Access your account and settings</p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  const menuItems = [
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
    { icon: FileText, label: 'Terms & Privacy', href: '/terms' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header />
      
      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-muted/50 py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  {user.user_metadata?.full_name || 'GTU Student'}
                </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary capitalize">
                    {userRole || 'Student'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Link */}
        {userRole === 'admin' && (
          <section className="py-4 border-b border-border">
            <div className="container mx-auto px-4">
              <Link
                to="/admin"
                className="flex items-center justify-between p-4 bg-primary/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Admin Dashboard</p>
                    <p className="text-sm text-muted-foreground">Manage resources and analytics</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
          </section>
        )}

        {/* Menu Items */}
        <section className="py-4">
          <div className="container mx-auto px-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between p-4 bg-card rounded-xl shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* Sign Out */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
