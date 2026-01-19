import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Branch {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
}

export const useBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as Branch[];
    },
  });
};