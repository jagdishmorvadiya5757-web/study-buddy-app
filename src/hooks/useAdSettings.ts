import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdSettings {
  ads_enabled: boolean;
  show_login_banner: boolean;
  show_download_rewarded: boolean;
  rewarded_ad_duration: number; // seconds
  // AdMob IDs
  admob_android_app_id: string;
  admob_ios_app_id: string;
  admob_android_banner_id: string;
  admob_ios_banner_id: string;
  admob_android_rewarded_id: string;
  admob_ios_rewarded_id: string;
  // AdSense for Web
  adsense_publisher_id: string;
  adsense_banner_slot: string;
  adsense_rewarded_slot: string;
}

const defaultAdSettings: AdSettings = {
  ads_enabled: false,
  show_login_banner: true,
  show_download_rewarded: true,
  rewarded_ad_duration: 5,
  admob_android_app_id: '',
  admob_ios_app_id: '',
  admob_android_banner_id: '',
  admob_ios_banner_id: '',
  admob_android_rewarded_id: '',
  admob_ios_rewarded_id: '',
  adsense_publisher_id: '',
  adsense_banner_slot: '',
  adsense_rewarded_slot: '',
};

export const useAdSettings = () => {
  return useQuery({
    queryKey: ['ad-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'ad_settings')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.setting_value) {
        return { ...defaultAdSettings, ...(data.setting_value as object) } as AdSettings;
      }
      
      return defaultAdSettings;
    },
  });
};

export const useUpdateAdSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: AdSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'ad_settings')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            setting_value: JSON.parse(JSON.stringify(settings)),
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', 'ad_settings');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            setting_key: 'ad_settings',
            setting_value: JSON.parse(JSON.stringify(settings)),
            updated_by: user?.id,
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-settings'] });
      toast({
        title: 'Ad settings saved',
        description: 'Your ad configuration has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save ad settings.',
        variant: 'destructive',
      });
      console.error('Error saving ad settings:', error);
    },
  });
};
