import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, FileText, Shield } from 'lucide-react';
import { useTermsPrivacySettings, useUpdateTermsPrivacySettings } from '@/hooks/useSupportSettings';

const AdminTerms = () => {
  const { data: settings, isLoading } = useTermsPrivacySettings();
  const updateSettings = useUpdateTermsPrivacySettings();
  
  const [termsOfService, setTermsOfService] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');

  useEffect(() => {
    if (settings) {
      setTermsOfService(settings.terms_of_service);
      setPrivacyPolicy(settings.privacy_policy);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      terms_of_service: termsOfService,
      privacy_policy: privacyPolicy,
    });
  };

  const hasChanges =
    settings?.terms_of_service !== termsOfService ||
    settings?.privacy_policy !== privacyPolicy;

  return (
    <AdminLayout
      title="Terms & Privacy"
      subtitle="Edit terms of service and privacy policy"
      actions={
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateSettings.isPending}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      {isLoading ? (
        <div className="bg-card rounded-xl shadow-soft p-8 text-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-soft p-6">
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
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Markdown Supported:</p>
                  <p>Use ## for headings, ### for subheadings, and - for bullet points</p>
                </div>
                <Textarea
                  value={termsOfService}
                  onChange={(e) => setTermsOfService(e.target.value)}
                  placeholder="Enter terms of service..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="privacy">
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Markdown Supported:</p>
                  <p>Use ## for headings, ### for subheadings, and - for bullet points</p>
                </div>
                <Textarea
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  placeholder="Enter privacy policy..."
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTerms;
