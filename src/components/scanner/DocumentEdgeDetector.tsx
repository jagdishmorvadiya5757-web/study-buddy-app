import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, Flashlight, FlashlightOff } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DocumentEdgeDetectorProps {
  onCapture: (imageData: string, corners: Point[]) => void;
  onCancel: () => void;
}

const DocumentEdgeDetector = ({ onCapture, onCancel }: DocumentEdgeDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [detectedCorners, setDetectedCorners] = useState<Point[]>([]);
  const [isReady, setIsReady] = useState(false);
  const animationRef = useRef<number>();

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setIsReady(true);
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setHasCamera(false);
    }
  }, [facingMode, stream]);

  useEffect(() => {
    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [facingMode]);

  // Edge detection and overlay drawing
  useEffect(() => {
    if (!isReady || !videoRef.current || !overlayRef.current) return;

    const video = videoRef.current;
    const overlay = overlayRef.current;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    const detectEdges = () => {
      // Set overlay dimensions to match video
      overlay.width = video.videoWidth || video.clientWidth;
      overlay.height = video.videoHeight || video.clientHeight;

      // Clear overlay
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Simple document detection based on video dimensions
      // In a real app, you'd use computer vision here
      const padding = 0.1;
      const corners: Point[] = [
        { x: overlay.width * padding, y: overlay.height * padding },
        { x: overlay.width * (1 - padding), y: overlay.height * padding },
        { x: overlay.width * (1 - padding), y: overlay.height * (1 - padding) },
        { x: overlay.width * padding, y: overlay.height * (1 - padding) },
      ];

      // Draw detection guide
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      corners.forEach((corner, i) => {
        const next = corners[(i + 1) % corners.length];
        ctx.lineTo(next.x, next.y);
      });
      ctx.closePath();
      ctx.stroke();

      // Draw corner circles
      ctx.setLineDash([]);
      corners.forEach(corner => {
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#4ade80';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw center guide text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Position document within the frame', overlay.width / 2, 40);

      setDetectedCorners(corners);
      animationRef.current = requestAnimationFrame(detectEdges);
    };

    detectEdges();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isReady]);

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      
      if (capabilities.torch) {
        const newFlashState = !flashEnabled;
        await track.applyConstraints({
          advanced: [{ torch: newFlashState } as MediaTrackConstraintSet],
        });
        setFlashEnabled(newFlashState);
      }
    }
  }, [stream, flashEnabled]);

  // Switch camera
  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    onCapture(imageData, detectedCorners);
  }, [detectedCorners, onCapture]);

  // Fallback file input for devices without camera
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const corners: Point[] = [
            { x: 0, y: 0 },
            { x: img.width, y: 0 },
            { x: img.width, y: img.height },
            { x: 0, y: img.height },
          ];
          onCapture(reader.result as string, corners);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [onCapture]);

  if (!hasCamera) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
        <div className="text-white text-center mb-6">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Camera Not Available</h2>
          <p className="text-white/70">Please allow camera access or select an image from your device</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <label>
            <Button asChild>
              <span>
                <Camera className="w-4 h-4 mr-2" />
                Select Image
              </span>
            </Button>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <span className="text-white font-medium">Scan Document</span>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFlash}
            className={`text-white ${flashEnabled ? 'text-yellow-400' : ''}`}
          >
            {flashEnabled ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={switchCamera} className="text-white">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-center">
          <button
            onClick={captureImage}
            className="w-20 h-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center active:scale-95 transition-transform border-4 border-white"
          >
            <div className="w-16 h-16 rounded-full bg-white border-4 border-green-500 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </button>
        </div>
        <p className="text-white/70 text-center text-sm mt-4">
          Tap to capture when document is aligned
        </p>
      </div>
    </div>
  );
};

export default DocumentEdgeDetector;
