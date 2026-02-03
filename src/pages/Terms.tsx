import Header from '@/components/gtu/Header';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTermsPrivacySettings } from '@/hooks/useSupportSettings';

const Terms = () => {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useTermsPrivacySettings();

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for headings and lists
    return text.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-foreground">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-foreground">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 text-muted-foreground">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return (
        <p key={index} className="text-muted-foreground mb-2">
          {line}
        </p>
      );
    });
  };

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
              <h1 className="font-display text-xl font-bold text-foreground">Terms & Privacy</h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            ) : (
              <Tabs defaultValue="terms" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="terms" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Terms of Service
                  </TabsTrigger>
                  <TabsTrigger value="privacy" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="terms">
                  <div className="bg-card rounded-xl shadow-soft p-6">
                    {settings?.terms_of_service && renderMarkdown(settings.terms_of_service)}
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy">
                  <div className="bg-card rounded-xl shadow-soft p-6">
                    {settings?.privacy_policy && renderMarkdown(settings.privacy_policy)}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Terms;
