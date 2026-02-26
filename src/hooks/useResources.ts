import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { resourceSchema } from '@/lib/validation';

export type ResourceType = 
  | 'playlist'
  | 'gtu_paper'
  | 'paper_solution'
  | 'imp'
  | 'book'
  | 'lab_manual'
  | 'handwritten_notes';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  branch_id: string;
  semester: number;
  subject_name: string;
  file_url: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  download_count: number;
  is_active: boolean;
  uploaded_by: string | null;
  created_at: string;
}

interface ResourceFilters {
  branchId?: string;
  semester?: number;
  resourceType?: ResourceType;
  searchQuery?: string;
}

export const useResources = (filters: ResourceFilters = {}) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }

      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }

      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,subject_name.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Resource[];
    },
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resource: Omit<Resource, 'id' | 'created_at' | 'download_count'>) => {
      resourceSchema.parse(resource);
      const { data, error } = await supabase
        .from('resources')
        .insert(resource)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Resource> & { id: string }) => {
      resourceSchema.partial().parse(updates);
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};