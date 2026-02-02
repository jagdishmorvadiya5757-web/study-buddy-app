import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserScan {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  thumbnail_url: string | null;
  page_count: number | null;
  file_size_bytes: number | null;
  is_shared: boolean;
  share_status: 'private' | 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
}

export const usePendingScans = () => {
  return useQuery({
    queryKey: ['pending-scans'],
    queryFn: async () => {
      // Get pending scans
      const { data: scans, error } = await supabase
        .from('user_scans')
        .select('*')
        .eq('share_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!scans || scans.length === 0) return [];

      // Get user profiles for these scans
      const userIds = [...new Set(scans.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return scans.map((scan) => ({
        ...scan,
        user_email: profileMap.get(scan.user_id)?.email,
        user_name: profileMap.get(scan.user_id)?.full_name,
      })) as UserScan[];
    },
  });
};

export const useAllSharedScans = () => {
  return useQuery({
    queryKey: ['all-shared-scans'],
    queryFn: async () => {
      const { data: scans, error } = await supabase
        .from('user_scans')
        .select('*')
        .neq('share_status', 'private')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!scans || scans.length === 0) return [];

      const userIds = [...new Set(scans.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return scans.map((scan) => ({
        ...scan,
        user_email: profileMap.get(scan.user_id)?.email,
        user_name: profileMap.get(scan.user_id)?.full_name,
      })) as UserScan[];
    },
  });
};

// Get ALL user scans for admin view (including private)
export const useAllUserScans = () => {
  return useQuery({
    queryKey: ['all-user-scans'],
    queryFn: async () => {
      const { data: scans, error } = await supabase
        .from('user_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!scans || scans.length === 0) return [];

      const userIds = [...new Set(scans.map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return scans.map((scan) => ({
        ...scan,
        user_email: profileMap.get(scan.user_id)?.email,
        user_name: profileMap.get(scan.user_id)?.full_name,
      })) as UserScan[];
    },
  });
};

export const useApproveScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scanId, adminId }: { scanId: string; adminId: string }) => {
      const { error } = await supabase
        .from('user_scans')
        .update({
          share_status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
        })
        .eq('id', scanId);

      if (error) throw error;

      // Log audit action
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        action: 'approve_scan',
        entity_type: 'user_scans',
        entity_id: scanId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-scans'] });
      queryClient.invalidateQueries({ queryKey: ['all-shared-scans'] });
    },
  });
};

export const useRejectScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      scanId, 
      adminId, 
      reason 
    }: { 
      scanId: string; 
      adminId: string; 
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('user_scans')
        .update({
          share_status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId,
          rejection_reason: reason || null,
        })
        .eq('id', scanId);

      if (error) throw error;

      // Log audit action
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        action: 'reject_scan',
        entity_type: 'user_scans',
        entity_id: scanId,
        details: { reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-scans'] });
      queryClient.invalidateQueries({ queryKey: ['all-shared-scans'] });
    },
  });
};

export const useDeleteScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scanId, adminId }: { scanId: string; adminId: string }) => {
      const { error } = await supabase
        .from('user_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      // Log audit action
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminId,
        action: 'delete_scan',
        entity_type: 'user_scans',
        entity_id: scanId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-scans'] });
      queryClient.invalidateQueries({ queryKey: ['all-shared-scans'] });
    },
  });
};
