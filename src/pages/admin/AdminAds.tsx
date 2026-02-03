import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAdSettings, useUpdateAdSettings, AdSettings } from '@/hooks/useAdSettings';
import { 
  Megaphone, 
  Smartphone, 
  Globe, 
  Save, 
  Loader2,
  DollarSign,
  Eye,
  Download,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminAds = () => {
  const { data: adSettings, isLoading } = useAdSettings();
  const updateSettings = useUpdateAdSettings();
  const [formData, setFormData] = useState<AdSettings | null>(null);

  useEffect(() => {
    if (adSettings) {
      setFormData(adSettings);
    }
  }, [adSettings]);

  const handleSave = () => {
    if (formData) {
      updateSettings.mutate(formData);
    }
  };

  const updateField = (field: keyof AdSettings, value: string | number | boolean) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (isLoading || !formData) {
    return (
      <AdminLayout title="Ad Management" subtitle="Configure ads for your app">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Ad Management" 
      subtitle="Configure ads for your app"
      actions={
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Master Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monetization Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable Ads</p>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all ads across the app
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={formData.ads_enabled ? "default" : "secondary"}>
                  {formData.ads_enabled ? "Active" : "Disabled"}
                </Badge>
                <Switch
                  checked={formData.ads_enabled}
                  onCheckedChange={(checked) => updateField('ads_enabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ad Types */}
        <Card>
          <CardHeader>
            <CardTitle>Ad Placements</CardTitle>
            <CardDescription>Choose where to show ads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Login Banner Ad</p>
                  <p className="text-sm text-muted-foreground">
                    Small dismissible ad shown after login
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.show_login_banner}
                onCheckedChange={(checked) => updateField('show_login_banner', checked)}
                disabled={!formData.ads_enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Download/View Rewarded Ad</p>
                  <p className="text-sm text-muted-foreground">
                    User watches ad before downloading or viewing
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.show_download_rewarded}
                onCheckedChange={(checked) => updateField('show_download_rewarded', checked)}
                disabled={!formData.ads_enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Ad Duration (seconds)</p>
                  <p className="text-sm text-muted-foreground">
                    How long users must wait before closing
                  </p>
                </div>
              </div>
              <Input
                type="number"
                min={3}
                max={30}
                value={formData.rewarded_ad_duration}
                onChange={(e) => updateField('rewarded_ad_duration', parseInt(e.target.value) || 5)}
                className="w-20"
                disabled={!formData.ads_enabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* AdMob Settings (Mobile) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              AdMob Settings (Mobile App)
            </CardTitle>
            <CardDescription>
              Configure Google AdMob for Android and iOS apps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Android App ID</Label>
                <Input
                  placeholder="ca-app-pub-XXXXXXXX~XXXXXXXXXX"
                  value={formData.admob_android_app_id}
                  onChange={(e) => updateField('admob_android_app_id', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>iOS App ID</Label>
                <Input
                  placeholder="ca-app-pub-XXXXXXXX~XXXXXXXXXX"
                  value={formData.admob_ios_app_id}
                  onChange={(e) => updateField('admob_ios_app_id', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Banner Ad Units</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Android Banner ID</Label>
                  <Input
                    placeholder="ca-app-pub-XXXXX/XXXXX"
                    value={formData.admob_android_banner_id}
                    onChange={(e) => updateField('admob_android_banner_id', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>iOS Banner ID</Label>
                  <Input
                    placeholder="ca-app-pub-XXXXX/XXXXX"
                    value={formData.admob_ios_banner_id}
                    onChange={(e) => updateField('admob_ios_banner_id', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Rewarded Ad Units</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Android Rewarded ID</Label>
                  <Input
                    placeholder="ca-app-pub-XXXXX/XXXXX"
                    value={formData.admob_android_rewarded_id}
                    onChange={(e) => updateField('admob_android_rewarded_id', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>iOS Rewarded ID</Label>
                  <Input
                    placeholder="ca-app-pub-XXXXX/XXXXX"
                    value={formData.admob_ios_rewarded_id}
                    onChange={(e) => updateField('admob_ios_rewarded_id', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AdSense Settings (Web) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              AdSense Settings (Website)
            </CardTitle>
            <CardDescription>
              Configure Google AdSense for the web version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Publisher ID</Label>
              <Input
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={formData.adsense_publisher_id}
                onChange={(e) => updateField('adsense_publisher_id', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in your AdSense account under Account → Account Information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Banner Ad Slot</Label>
                <Input
                  placeholder="1234567890"
                  value={formData.adsense_banner_slot}
                  onChange={(e) => updateField('adsense_banner_slot', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rewarded Ad Slot</Label>
                <Input
                  placeholder="1234567890"
                  value={formData.adsense_rewarded_slot}
                  onChange={(e) => updateField('adsense_rewarded_slot', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary">Quick Setup Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground space-y-2">
            <p><strong>For Mobile (AdMob):</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create AdMob account at admob.google.com</li>
              <li>Add your app (Android & iOS)</li>
              <li>Create Banner & Rewarded Interstitial ad units</li>
              <li>Copy the IDs above</li>
            </ol>
            <p className="mt-3"><strong>For Web (AdSense):</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create AdSense account at adsense.google.com</li>
              <li>Wait for site approval (1-2 weeks)</li>
              <li>Create display ad units</li>
              <li>Copy Publisher ID and Slot IDs above</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAds;
