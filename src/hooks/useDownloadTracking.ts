import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Resource } from './useResources';

export const useTrackDownload = () => {
  return useMutation({
    mutationFn: async (resourceId: string) => {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert download record
      const { error: insertError } = await supabase
        .from('resource_downloads')
        .insert({
          resource_id: resourceId,
          user_id: user?.id || null,
        });

      if (insertError) {
        console.error('Error tracking download:', insertError);
      }

      // Increment the download count using RPC
      const { error: rpcError } = await supabase.rpc('increment_download_count', {
        resource_id: resourceId,
      });

      if (rpcError) {
        console.error('Error incrementing download count:', rpcError);
        throw rpcError;
      }
    },
  });
};

export const usePopularResources = (limit: number = 6) => {
  return useQuery({
    queryKey: ['popular-resources', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('download_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Resource[];
    },
  });
};

export const useTrendingResources = (limit: number = 6, daysBack: number = 7) => {
  return useQuery({
    queryKey: ['trending-resources', limit, daysBack],
    queryFn: async () => {
      // For trending, we'll use resources with recent activity
      // Since we can't aggregate downloads by date without admin access,
      // we'll use recently created resources with high download counts
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('download_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Resource[];
    },
  });
};
