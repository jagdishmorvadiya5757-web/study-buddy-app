import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAboutSettings, useUpdateAboutSettings, AboutSettings, QuickLink } from '@/hooks/useSiteSettings';
import { Save, Plus, Trash2, GripVertical, Loader2, Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import gtuVerseLogo from '@/assets/gtu-verse-logo.jpeg';

const AdminAbout = () => {
  const { data: settings, isLoading } = useAboutSettings();
  const updateSettings = useUpdateAboutSettings();
  
  const [formData, setFormData] = useState<AboutSettings>({
    title: '',
    tagline: '',
    description: '',
    contact_email: '',
    contact_location: '',
    quick_links: [],
    logo_url: '',
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (field: keyof AboutSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkChange = (index: number, field: keyof QuickLink, value: string) => {
    setFormData((prev) => ({
      ...prev,
      quick_links: prev.quick_links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  const addQuickLink = () => {
    setFormData((prev) => ({
      ...prev,
      quick_links: [...prev.quick_links, { label: '', url: '' }],
    }));
  };

  const removeQuickLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quick_links: prev.quick_links.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded! Click Save to apply changes.');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="About Section" subtitle="Manage website about content">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="About Section"
      subtitle="Manage website about content and footer"
      actions={
        <Button onClick={handleSave} disabled={updateSettings.isPending} className="gap-2">
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      }
    >
      <div className="grid gap-6 max-w-4xl">
        {/* Logo Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Logo Management
            </CardTitle>
            <CardDescription>
              Upload a custom logo for your website (displayed in header, footer, and login page)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={formData.logo_url || gtuVerseLogo}
                  alt="Current Logo"
                  className="h-20 w-20 rounded-full object-cover border-2 border-border"
                />
                {formData.logo_url && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    Custom
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="gap-2"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Upload New Logo
                  </Button>
                  {formData.logo_url && (
                    <Button
                      variant="ghost"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image (1:1), max 2MB. PNG or JPG format.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Information */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>
              Update your website title and tagline displayed in the header and footer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Website Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="GTU-VERSE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Engineering Resources Portal"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="A comprehensive platform for GTU engineering students..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Update contact details displayed in the footer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email Address</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="support@gtuverse.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_location">Location</Label>
                <Input
                  id="contact_location"
                  value={formData.contact_location}
                  onChange={(e) => handleInputChange('contact_location', e.target.value)}
                  placeholder="Gujarat, India"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>
                Manage footer navigation links
              </CardDescription>
            </div>
            <Button onClick={addQuickLink} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          </CardHeader>
          <CardContent>
            {formData.quick_links.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No quick links added yet. Click "Add Link" to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.quick_links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 grid gap-3 sm:grid-cols-2">
                      <Input
                        value={link.label}
                        onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                        placeholder="Link Label"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                        placeholder="/page-url or https://..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuickLink(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAbout;
