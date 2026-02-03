import { useState, useEffect, useCallback } from 'react';
import { useAdSettings } from './useAdSettings';
import { Capacitor } from '@capacitor/core';

// Check if we're on native platform
const isNative = Capacitor.isNativePlatform();

// Dynamic import for AdMob (only on native)
let AdMob: any = null;
let BannerAdSize: any = null;
let BannerAdPosition: any = null;

if (isNative) {
  import('@capacitor-community/admob').then((module) => {
    AdMob = module.AdMob;
    BannerAdSize = module.BannerAdSize;
    BannerAdPosition = module.BannerAdPosition;
  });
}

export const useInitializeAds = () => {
  const { data: adSettings } = useAdSettings();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAds = async () => {
      if (!adSettings?.ads_enabled || initialized) return;

      if (isNative && AdMob) {
        try {
          await AdMob.initialize({
            initializeForTesting: false,
          });
          setInitialized(true);
          console.log('AdMob initialized');
        } catch (error) {
          console.error('AdMob initialization failed:', error);
        }
      } else if (!isNative && adSettings.adsense_publisher_id) {
        // Load AdSense script for web
        const existingScript = document.querySelector('script[src*="adsbygoogle"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSettings.adsense_publisher_id}`;
          script.async = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
          setInitialized(true);
        }
      }
    };

    initAds();
  }, [adSettings, initialized]);

  return initialized;
};

export const useBannerAd = () => {
  const { data: adSettings } = useAdSettings();
  const [isShowing, setIsShowing] = useState(false);

  const showBanner = useCallback(async () => {
    if (!adSettings?.ads_enabled || !adSettings?.show_login_banner) return;

    if (isNative && AdMob) {
      try {
        const platform = Capacitor.getPlatform();
        const adId = platform === 'ios' 
          ? adSettings.admob_ios_banner_id 
          : adSettings.admob_android_banner_id;

        if (!adId) return;

        await AdMob.showBanner({
          adId,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 60, // Above bottom nav
        });
        setIsShowing(true);
      } catch (error) {
        console.error('Failed to show banner:', error);
      }
    }
  }, [adSettings]);

  const hideBanner = useCallback(async () => {
    if (isNative && AdMob && isShowing) {
      try {
        await AdMob.removeBanner();
        setIsShowing(false);
      } catch (error) {
        console.error('Failed to hide banner:', error);
      }
    }
  }, [isShowing]);

  return { showBanner, hideBanner, isShowing };
};

export const useRewardedAd = () => {
  const { data: adSettings } = useAdSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const prepareRewardedAd = useCallback(async () => {
    if (!adSettings?.ads_enabled || !adSettings?.show_download_rewarded) {
      setIsReady(true); // Skip ads if disabled
      return true;
    }

    if (isNative && AdMob) {
      try {
        setIsLoading(true);
        const platform = Capacitor.getPlatform();
        const adId = platform === 'ios'
          ? adSettings.admob_ios_rewarded_id
          : adSettings.admob_android_rewarded_id;

        if (!adId) {
          setIsReady(true);
          return true;
        }

        await AdMob.prepareRewardedInterstitialAd({ adId });
        setIsReady(true);
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error('Failed to prepare rewarded ad:', error);
        setIsReady(true); // Allow download even if ad fails
        setIsLoading(false);
        return true;
      }
    }
    
    setIsReady(true);
    return true;
  }, [adSettings]);

  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    if (!adSettings?.ads_enabled || !adSettings?.show_download_rewarded) {
      return true; // Skip if disabled
    }

    if (isNative && AdMob && isReady) {
      try {
        const result = await AdMob.showRewardedInterstitialAd();
        return true;
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
        return true; // Allow action even if ad fails
      }
    }

    return true;
  }, [adSettings, isReady]);

  return { 
    prepareRewardedAd, 
    showRewardedAd, 
    isLoading, 
    isReady,
    adDuration: adSettings?.rewarded_ad_duration || 5,
    adsEnabled: adSettings?.ads_enabled && adSettings?.show_download_rewarded,
  };
};
