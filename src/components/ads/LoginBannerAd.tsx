import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdSettings } from '@/hooks/useAdSettings';
import { Capacitor } from '@capacitor/core';

const LoginBannerAd = () => {
  const { data: adSettings } = useAdSettings();
  const [dismissed, setDismissed] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Check if user just logged in (session storage flag)
    const justLoggedIn = sessionStorage.getItem('just_logged_in');
    if (justLoggedIn && adSettings?.ads_enabled && adSettings?.show_login_banner) {
      setShowAd(true);
      sessionStorage.removeItem('just_logged_in');
    }
  }, [adSettings]);

  if (!showAd || dismissed || !adSettings?.ads_enabled || !adSettings?.show_login_banner) {
    return null;
  }

  // For native, the AdMob banner is handled separately
  // This component is for web AdSense
  if (isNative) {
    return null;
  }

  // Web AdSense Banner
  if (!adSettings.adsense_publisher_id || !adSettings.adsense_banner_slot) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-in slide-in-from-bottom duration-300">
      <div className="relative bg-card border border-border rounded-lg shadow-lg p-2 max-w-md mx-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
        
        {/* AdSense Ad Container */}
        <div className="min-h-[50px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '50px' }}
            data-ad-client={adSettings.adsense_publisher_id}
            data-ad-slot={adSettings.adsense_banner_slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          <script>
            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
          </script>
        </div>
      </div>
    </div>
  );
};

export default LoginBannerAd;
