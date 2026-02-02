import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubAdmin {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export const useSubAdminManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all sub-admins
  const { data: subAdmins = [], isLoading } = useQuery({
    queryKey: ['sub-admins'],
    queryFn: async () => {
      // Get all users with sub_admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, created_at')
        .eq('role', 'sub_admin');

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];

      // Get profile info for each sub-admin
      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine data
      return roles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          email: profile?.email || 'Unknown',
          full_name: profile?.full_name,
          created_at: role.created_at,
        };
      });
    },
  });

  // Add sub-admin by email
  const addSubAdmin = useMutation({
    mutationFn: async (email: string) => {
      // Find user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        throw new Error('No user found with this email. They must sign up first.');
      }

      // Check if already has admin or sub_admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .in('role', ['admin', 'sub_admin'])
        .maybeSingle();

      if (existingRole) {
        throw new Error(`User already has ${existingRole.role} role.`);
      }

      // Add sub_admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.user_id,
          role: 'sub_admin',
        });

      if (insertError) throw insertError;

      return profile;
    },
    onSuccess: (profile) => {
      toast({
        title: 'Sub-admin added',
        description: `${profile.full_name || profile.email} is now a sub-admin.`,
      });
      queryClient.invalidateQueries({ queryKey: ['sub-admins'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add sub-admin',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove sub-admin
  const removeSubAdmin = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Sub-admin removed',
        description: 'The sub-admin role has been revoked.',
      });
      queryClient.invalidateQueries({ queryKey: ['sub-admins'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove sub-admin',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    subAdmins,
    isLoading,
    addSubAdmin,
    removeSubAdmin,
  };
};
