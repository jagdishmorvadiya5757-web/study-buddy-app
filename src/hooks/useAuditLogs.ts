import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  admin_email?: string;
  admin_name?: string;
}

export const useAuditLogs = (limit: number = 50) => {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select(`
          *,
          profiles:admin_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data.map((log: any) => ({
        ...log,
        admin_email: log.profiles?.email,
        admin_name: log.profiles?.full_name,
      })) as AuditLog[];
    },
  });
};

export const logAdminAction = async (
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) => {
  await supabase.from('admin_audit_logs').insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    details: details || null,
  });
};
