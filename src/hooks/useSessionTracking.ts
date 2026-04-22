import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSessionTracking = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  useEffect(() => {
    // RLS requires an authenticated user — skip tracking for anonymous visitors.
    if (!user?.id) return;

    const startSession = async () => {
      sessionStartRef.current = new Date();

      // Create session record
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_start: sessionStartRef.current.toISOString(),
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          },
        })
        .select('id')
        .single();

      if (data && !error) {
        sessionIdRef.current = data.id;
      }
    };

    const endSession = async () => {
      if (sessionIdRef.current && sessionStartRef.current) {
        const duration = Math.round(
          (new Date().getTime() - sessionStartRef.current.getTime()) / 1000
        );

        await supabase
          .from('user_sessions')
          .update({
            session_end: new Date().toISOString(),
            duration_seconds: duration,
          })
          .eq('id', sessionIdRef.current);
      }
    };

    startSession();

    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      } else if (document.visibilityState === 'visible' && !sessionIdRef.current) {
        startSession();
      }
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      endSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [user?.id]);
};

export const useInstallTracking = () => {
  const { user } = useAuth();
  useEffect(() => {
    // RLS requires an authenticated user — wait until the user is signed in.
    if (!user?.id) return;

    const trackInstall = async () => {
      // Check if we've already tracked this install
      const installTracked = localStorage.getItem('gtu_install_tracked');
      if (installTracked) return;

      // Determine platform
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      let platform = 'web';
      if (isStandalone) {
        platform = isIOS ? 'ios' : isAndroid ? 'android' : 'pwa';
      }

      // Record the install
      await supabase
        .from('app_installs')
        .insert({
          user_id: user.id,
          device_id: getDeviceId(),
          platform,
          app_version: '1.0.0',
        });

      localStorage.setItem('gtu_install_tracked', 'true');
    };

    trackInstall();
  }, [user?.id]);
};

// Generate or retrieve a unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('gtu_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('gtu_device_id', deviceId);
  }
  return deviceId;
};
