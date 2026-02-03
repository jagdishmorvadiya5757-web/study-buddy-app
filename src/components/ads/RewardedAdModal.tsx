import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Clock } from 'lucide-react';
import { useAdSettings } from '@/hooks/useAdSettings';
import { Capacitor } from '@capacitor/core';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  title?: string;
}

const RewardedAdModal = ({ isOpen, onClose, onComplete, title = "Loading your content..." }: RewardedAdModalProps) => {
  const { data: adSettings } = useAdSettings();
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const adDuration = adSettings?.rewarded_ad_duration || 5;

  useEffect(() => {
    if (!isOpen) {
      setCountdown(adDuration);
      setCanClose(false);
      return;
    }

    // Start countdown
    setCountdown(adDuration);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, adDuration]);

  const handleClose = () => {
    if (canClose) {
      onComplete();
      onClose();
    }
  };

  if (!adSettings?.ads_enabled || !adSettings?.show_download_rewarded) {
    // If ads disabled, immediately complete
    if (isOpen) {
      onComplete();
      onClose();
    }
    return null;
  }

  // For native, AdMob handles the rewarded interstitial
  if (isNative) {
    if (isOpen) {
      onComplete();
      onClose();
    }
    return null;
  }

  const progress = ((adDuration - countdown) / adDuration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Ad Container */}
          <div className="bg-muted rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
            {adSettings.adsense_publisher_id && adSettings.adsense_rewarded_slot ? (
              <>
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', width: '100%', height: '200px' }}
                  data-ad-client={adSettings.adsense_publisher_id}
                  data-ad-slot={adSettings.adsense_rewarded_slot}
                  data-ad-format="auto"
                />
                <script>
                  {`(adsbygoogle = window.adsbygoogle || []).push({});`}
                </script>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Preparing your download...</p>
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {canClose ? 'Ready!' : `Please wait ${countdown} seconds...`}
              </span>
              <span className="font-medium text-primary">
                {countdown}s
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleClose} 
            disabled={!canClose}
            className="gap-2"
          >
            {canClose ? (
              <>
                <X className="h-4 w-4" />
                Close & Continue
              </>
            ) : (
              `Wait ${countdown}s...`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardedAdModal;
