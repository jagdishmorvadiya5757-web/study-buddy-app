import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, RotateCcw, Move } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface PerspectiveCorrectorProps {
  imageData: string;
  initialCorners: Point[];
  onConfirm: (correctedImageData: string) => void;
  onRetake: () => void;
  onCancel: () => void;
}

const PerspectiveCorrector = ({
  imageData,
  initialCorners,
  onConfirm,
  onRetake,
  onCancel,
}: PerspectiveCorrectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [corners, setCorners] = useState<Point[]>([]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [displayRatio, setDisplayRatio] = useState(1);

  // Load image and initialize corners
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      // Calculate display ratio
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32;
        const containerHeight = containerRef.current.clientHeight - 32;
        const ratio = Math.min(
          containerWidth / img.width,
          containerHeight / img.height
        );
        setDisplayRatio(ratio);
        
        // Scale corners to display size
        if (initialCorners.length === 4) {
          setCorners(initialCorners.map(c => ({
            x: c.x * ratio,
            y: c.y * ratio,
          })));
        } else {
          // Default corners if none provided
          const padding = 0.1;
          setCorners([
            { x: img.width * padding * ratio, y: img.height * padding * ratio },
            { x: img.width * (1 - padding) * ratio, y: img.height * padding * ratio },
            { x: img.width * (1 - padding) * ratio, y: img.height * (1 - padding) * ratio },
            { x: img.width * padding * ratio, y: img.height * (1 - padding) * ratio },
          ]);
        }
      }
    };
    img.src = imageData;
  }, [imageData, initialCorners]);

  // Draw overlay with corners
  useEffect(() => {
    if (!canvasRef.current || corners.length !== 4) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageSize.width * displayRatio;
    canvas.height = imageSize.height * displayRatio;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay outside selection
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out the selected area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach((corner, i) => {
      const next = corners[(i + 1) % corners.length];
      ctx.lineTo(next.x, next.y);
    });
    ctx.closePath();
    ctx.fill();

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Draw selection border
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    corners.forEach((corner, i) => {
      const next = corners[(i + 1) % corners.length];
      ctx.lineTo(next.x, next.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw corner handles
    corners.forEach((corner, i) => {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = activeCorner === i ? '#22c55e' : '#4ade80';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Add move icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⋮⋮', corner.x, corner.y);
    });
  }, [corners, activeCorner, imageSize, displayRatio]);

  // Handle corner dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if we clicked on a corner
    const cornerIndex = corners.findIndex(
      corner => Math.hypot(corner.x - x, corner.y - y) < 25
    );

    if (cornerIndex !== -1) {
      setActiveCorner(cornerIndex);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeCorner === null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(e.clientX - rect.left, imageSize.width * displayRatio));
    const y = Math.max(0, Math.min(e.clientY - rect.top, imageSize.height * displayRatio));

    setCorners(prev => {
      const updated = [...prev];
      updated[activeCorner] = { x, y };
      return updated;
    });
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  // Apply perspective correction
  const applyCorrection = useCallback(() => {
    if (!outputCanvasRef.current || corners.length !== 4) return;

    const canvas = outputCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate the dimensions of the corrected image
      // Using the maximum width and height from the corners
      const scaledCorners = corners.map(c => ({
        x: c.x / displayRatio,
        y: c.y / displayRatio,
      }));

      const width = Math.max(
        Math.hypot(scaledCorners[1].x - scaledCorners[0].x, scaledCorners[1].y - scaledCorners[0].y),
        Math.hypot(scaledCorners[2].x - scaledCorners[3].x, scaledCorners[2].y - scaledCorners[3].y)
      );
      const height = Math.max(
        Math.hypot(scaledCorners[3].x - scaledCorners[0].x, scaledCorners[3].y - scaledCorners[0].y),
        Math.hypot(scaledCorners[2].x - scaledCorners[1].x, scaledCorners[2].y - scaledCorners[1].y)
      );

      canvas.width = width;
      canvas.height = height;

      // Simple crop and scale (for a full perspective transform, you'd need a matrix library)
      // This is a simplified version that works well for minor adjustments
      const minX = Math.min(...scaledCorners.map(c => c.x));
      const minY = Math.min(...scaledCorners.map(c => c.y));
      const maxX = Math.max(...scaledCorners.map(c => c.x));
      const maxY = Math.max(...scaledCorners.map(c => c.y));

      ctx.drawImage(
        img,
        minX, minY, maxX - minX, maxY - minY,
        0, 0, width, height
      );

      onConfirm(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = imageData;
  }, [corners, displayRatio, imageData, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <canvas ref={outputCanvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <Button variant="ghost" size="icon" onClick={onCancel} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <span className="text-white font-medium">Adjust Corners</span>
        <Button variant="ghost" size="icon" onClick={applyCorrection} className="text-green-400">
          <Check className="w-6 h-6" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-black/60 px-4 py-2">
        <p className="text-white/80 text-sm text-center flex items-center justify-center gap-2">
          <Move className="w-4 h-4" />
          Drag corners to adjust document edges
        </p>
      </div>

      {/* Image with corner adjustments */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="relative">
          <img
            src={imageData}
            alt="Captured document"
            className="max-w-full max-h-full object-contain"
            style={{
              width: imageSize.width * displayRatio,
              height: imageSize.height * displayRatio,
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-black/80 flex gap-4">
        <Button variant="outline" className="flex-1" onClick={onRetake}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake
        </Button>
        <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={applyCorrection}>
          <Check className="w-4 h-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
};

export default PerspectiveCorrector;
