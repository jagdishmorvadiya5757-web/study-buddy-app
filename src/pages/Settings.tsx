import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/gtu/Header';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Download, 
  Share2, 
  Bell,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleShareApp = async () => {
    const shareData = {
      title: 'GTU Study Mates',
      text: 'Check out GTU Study Mates - Your complete engineering resources portal!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: 'Link Copied',
          description: 'App link has been copied to clipboard.',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/50 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
            </div>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Appearance
            </h2>
            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="dark-mode" className="font-medium cursor-pointer">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Quick Actions
            </h2>
            <div className="bg-card rounded-xl shadow-soft overflow-hidden space-y-0">
              <Link
                to="/library"
                className="flex items-center gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors"
              >
                <Download className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">My Downloads</p>
                  <p className="text-sm text-muted-foreground">View your downloaded materials</p>
                </div>
              </Link>
              <button
                onClick={handleShareApp}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
              >
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Share App</p>
                  <p className="text-sm text-muted-foreground">Share GTU Study Mates with friends</p>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Account Info */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Account
            </h2>
            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">Signed in account</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Settings;
