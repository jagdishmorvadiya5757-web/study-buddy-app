import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuickLink {
  label: string;
  url: string;
}

export interface AboutSettings {
  title: string;
  tagline: string;
  description: string;
  contact_email: string;
  contact_location: string;
  quick_links: QuickLink[];
  logo_url?: string;
}

const defaultAboutSettings: AboutSettings = {
  title: 'GTU-VERSE',
  tagline: 'Engineering Resources Portal',
  description: 'A comprehensive platform for GTU engineering students to access study materials, previous year papers, solutions, and more.',
  contact_email: 'support@gtuverse.com',
  contact_location: 'Gujarat, India',
  quick_links: [
    { label: 'Home', url: '/' },
    { label: 'Resources', url: '/resources' },
    { label: 'Branches', url: '/branches' },
    { label: 'Login', url: '/auth' },
  ],
};

export const useAboutSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'about')
        .single();

      if (error) {
        console.error('Error fetching about settings:', error);
        return defaultAboutSettings;
      }

      return (data?.setting_value as unknown as AboutSettings) || defaultAboutSettings;
    },
  });
};

export const useUpdateAboutSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: AboutSettings) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: JSON.parse(JSON.stringify(settings)),
          updated_at: new Date().toISOString(),
          updated_by: user.user?.id,
        })
        .eq('setting_key', 'about');

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'about'] });
      toast({
        title: 'Settings Updated',
        description: 'About section has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
