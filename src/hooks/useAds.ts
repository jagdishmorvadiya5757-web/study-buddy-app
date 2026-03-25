import { useState, useEffect, useCallback } from 'react';
import { useAdSettings } from './useAdSettings';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

type AdMobModule = {
  AdMob: any;
  BannerAdSize: any;
  BannerAdPosition: any;
};

let admobModulePromise: Promise<AdMobModule | null> | null = null;

const loadAdMobModule = async (): Promise<AdMobModule | null> => {
  if (!isNative || !Capacitor.isPluginAvailable('AdMob')) return null;

  if (!admobModulePromise) {
    admobModulePromise = import('@capacitor-community/admob')
      .then((module) => ({
        AdMob: module.AdMob,
        BannerAdSize: module.BannerAdSize,
        BannerAdPosition: module.BannerAdPosition,
      }))
      .catch((error) => {
        console.error('Failed to load AdMob plugin:', error);
        return null;
      });
  }

  return admobModulePromise;
};

const hasConfiguredNativeAppId = (adSettings: {
  admob_android_app_id?: string;
  admob_ios_app_id?: string;
}) => {
  const platform = Capacitor.getPlatform();
  const appId = platform === 'ios' ? adSettings.admob_ios_app_id : adSettings.admob_android_app_id;
  return Boolean(appId?.trim());
};

export const useInitializeAds = () => {
  const { data: adSettings } = useAdSettings();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAds = async () => {
      if (!adSettings?.ads_enabled || initialized) return;

      if (isNative) {
        if (!hasConfiguredNativeAppId(adSettings)) {
          console.warn('AdMob skipped: native app id is missing in ad settings.');
          return;
        }

        const module = await loadAdMobModule();
        if (!module) return;

        try {
          await module.AdMob.initialize({
            initializeForTesting: false,
          });
          setInitialized(true);
          console.log('AdMob initialized');
        } catch (error) {
          console.error('AdMob initialization failed:', error);
        }
      } else if (adSettings.adsense_publisher_id) {
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

    if (isNative) {
      const module = await loadAdMobModule();
      if (!module) return;

      try {
        const platform = Capacitor.getPlatform();
        const adId = platform === 'ios' ? adSettings.admob_ios_banner_id : adSettings.admob_android_banner_id;

        if (!adId) return;

        await module.AdMob.showBanner({
          adId,
          adSize: module.BannerAdSize.ADAPTIVE_BANNER,
          position: module.BannerAdPosition.BOTTOM_CENTER,
          margin: 60,
        });
        setIsShowing(true);
      } catch (error) {
        console.error('Failed to show banner:', error);
      }
    }
  }, [adSettings]);

  const hideBanner = useCallback(async () => {
    if (!isNative || !isShowing) return;

    const module = await loadAdMobModule();
    if (!module) return;

    try {
      await module.AdMob.removeBanner();
      setIsShowing(false);
    } catch (error) {
      console.error('Failed to hide banner:', error);
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
      setIsReady(true);
      return true;
    }

    if (isNative) {
      const module = await loadAdMobModule();
      if (!module) {
        setIsReady(true);
        return true;
      }

      try {
        setIsLoading(true);
        const platform = Capacitor.getPlatform();
        const adId = platform === 'ios' ? adSettings.admob_ios_rewarded_id : adSettings.admob_android_rewarded_id;

        if (!adId) {
          setIsReady(true);
          setIsLoading(false);
          return true;
        }

        await module.AdMob.prepareRewardedInterstitialAd({ adId });
        setIsReady(true);
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error('Failed to prepare rewarded ad:', error);
        setIsReady(true);
        setIsLoading(false);
        return true;
      }
    }

    setIsReady(true);
    return true;
  }, [adSettings]);

  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    if (!adSettings?.ads_enabled || !adSettings?.show_download_rewarded) {
      return true;
    }

    if (isNative && isReady) {
      const module = await loadAdMobModule();
      if (!module) return true;

      try {
        await module.AdMob.showRewardedInterstitialAd();
        return true;
      } catch (error) {
        console.error('Failed to show rewarded ad:', error);
        return true;
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
