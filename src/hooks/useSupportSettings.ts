import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQSettings {
  faqs: FAQ[];
}

export interface TermsPrivacySettings {
  terms_of_service: string;
  privacy_policy: string;
}

export interface SupportRequest {
  id: string;
  user_id: string;
  user_email: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

const defaultFAQs: FAQSettings = {
  faqs: [
    {
      question: 'How do I download study materials?',
      answer: 'Navigate to the Resources section, select your branch and semester, then click the download button on any resource.',
    },
    {
      question: 'How do I scan documents?',
      answer: 'Tap the Scan button in the bottom navigation. Position your document within the frame, capture the image, and save as PDF.',
    },
  ],
};

const defaultTermsPrivacy: TermsPrivacySettings = {
  terms_of_service: '## Terms of Service\n\nWelcome to GTU Study Mates.',
  privacy_policy: '## Privacy Policy\n\nYour privacy is important to us.',
};

export const useFAQSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'faqs')
        .single();

      if (error) {
        console.error('Error fetching FAQ settings:', error);
        return defaultFAQs;
      }

      return (data?.setting_value as unknown as FAQSettings) || defaultFAQs;
    },
  });
};

export const useUpdateFAQSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: FAQSettings) => {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: JSON.parse(JSON.stringify(settings)),
          updated_at: new Date().toISOString(),
          updated_by: user.user?.id,
        })
        .eq('setting_key', 'faqs');

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'faqs'] });
      toast({
        title: 'FAQs Updated',
        description: 'FAQ section has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to update FAQs. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useTermsPrivacySettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'terms_privacy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'terms_privacy')
        .single();

      if (error) {
        console.error('Error fetching terms/privacy settings:', error);
        return defaultTermsPrivacy;
      }

      return (data?.setting_value as unknown as TermsPrivacySettings) || defaultTermsPrivacy;
    },
  });
};

export const useUpdateTermsPrivacySettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: TermsPrivacySettings) => {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: JSON.parse(JSON.stringify(settings)),
          updated_at: new Date().toISOString(),
          updated_by: user.user?.id,
        })
        .eq('setting_key', 'terms_privacy');

      if (error) throw error;
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'terms_privacy'] });
      toast({
        title: 'Terms & Privacy Updated',
        description: 'Terms and Privacy Policy has been updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Error updating terms/privacy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useSupportRequests = () => {
  return useQuery({
    queryKey: ['support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupportRequest[];
    },
  });
};

export const useCreateSupportRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: { subject: string; message: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error } = await supabase.from('support_requests').insert({
        user_id: user.user.id,
        user_email: user.user.email || '',
        subject: request.subject,
        message: request.message,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast({
        title: 'Request Submitted',
        description: 'Your support request has been submitted. We will respond soon.',
      });
    },
    onError: (error) => {
      console.error('Error creating support request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSupportRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      admin_response,
    }: {
      id: string;
      status: string;
      admin_response?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('support_requests')
        .update({
          status,
          admin_response,
          responded_by: user.user?.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast({
        title: 'Request Updated',
        description: 'Support request has been updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating support request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request.',
        variant: 'destructive',
      });
    },
  });
};
