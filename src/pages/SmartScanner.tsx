import { useState, useRef, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Camera as CameraIcon, 
  FlashlightOff, 
  Flashlight, 
  RotateCcw, 
  Check, 
  Plus, 
  FileText,
  X,
  Download,
  Trash2,
  Wand2,
  ScanLine
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import DocumentEdgeDetector from '@/components/scanner/DocumentEdgeDetector';
import PerspectiveCorrector from '@/components/scanner/PerspectiveCorrector';

interface Point {
  x: number;
  y: number;
}

interface ScannedPage {
  id: string;
  imageData: string;
  filter: 'original' | 'bw' | 'magic';
}

type ScannerStep = 'idle' | 'capturing' | 'adjusting' | 'reviewing';

const SmartScanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [currentPage, setCurrentPage] = useState<ScannedPage | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedCorners, setCapturedCorners] = useState<Point[]>([]);
  const [scannerStep, setScannerStep] = useState<ScannerStep>('idle');
  const [flashOn, setFlashOn] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const now = new Date();
    const defaultName = `Scan_${now.toISOString().slice(0, 10)}_${now.toTimeString().slice(0, 5).replace(':', '')}`;
    setFileName(defaultName);
  }, []);

  // Start camera capture
  const startCapture = () => {
    setScannerStep('capturing');
  };

  // Handle image captured from edge detector
  const handleImageCaptured = useCallback((imageData: string, corners: Point[]) => {
    setCapturedImage(imageData);
    setCapturedCorners(corners);
    setScannerStep('adjusting');
  }, []);

  // Handle perspective correction complete
  const handleCorrectionComplete = useCallback((correctedImage: string) => {
    const newPage: ScannedPage = {
      id: crypto.randomUUID(),
      imageData: correctedImage,
      filter: 'original',
    };
    setCurrentPage(newPage);
    setCapturedImage(null);
    setCapturedCorners([]);
    setScannerStep('reviewing');
  }, []);

  // Cancel capture
  const handleCancelCapture = () => {
    setCapturedImage(null);
    setCapturedCorners([]);
    setScannerStep('idle');
  };

  // Retake from adjustment step
  const handleRetakeFromAdjust = () => {
    setCapturedImage(null);
    setCapturedCorners([]);
    setScannerStep('capturing');
  };

  const applyFilter = (filter: 'original' | 'bw' | 'magic') => {
    if (currentPage) {
      setCurrentPage({ ...currentPage, filter });
    }
  };

  const processImage = useCallback((imageData: string, filter: 'original' | 'bw' | 'magic'): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve(imageData);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageData);
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (filter === 'bw') {
          const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageDataObj.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const threshold = gray > 128 ? 255 : 0;
            data[i] = threshold;
            data[i + 1] = threshold;
            data[i + 2] = threshold;
          }
          ctx.putImageData(imageDataObj, 0, 0);
        } else if (filter === 'magic') {
          const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageDataObj.data;
          for (let i = 0; i < data.length; i += 4) {
            // Increase contrast and sharpen
            data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.5 + 128));
            data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.5 + 128));
            data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.5 + 128));
          }
          ctx.putImageData(imageDataObj, 0, 0);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = imageData;
    });
  }, []);

  const confirmPage = async () => {
    if (currentPage) {
      const processedImage = await processImage(currentPage.imageData, currentPage.filter);
      setPages([...pages, { ...currentPage, imageData: processedImage }]);
      setCurrentPage(null);
      setScannerStep('idle');
    }
  };

  const retakePage = () => {
    setCurrentPage(null);
    setScannerStep('capturing');
  };

  const removePage = (id: string) => {
    setPages(pages.filter(p => p.id !== id));
  };

  const generatePDF = async (): Promise<Blob> => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();

      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = pages[i].imageData;
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = img.width / img.height;
      const pageRatio = pageWidth / pageHeight;

      let finalWidth = pageWidth;
      let finalHeight = pageHeight;

      if (imgRatio > pageRatio) {
        finalHeight = pageWidth / imgRatio;
      } else {
        finalWidth = pageHeight * imgRatio;
      }

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(pages[i].imageData, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'MEDIUM');
    }

    return pdf.output('blob');
  };

  const savePDF = async () => {
    if (!user) {
      toast.error('Please sign in to save scans');
      return;
    }

    if (pages.length === 0) {
      toast.error('No pages to save');
      return;
    }

    setIsSaving(true);
    try {
      const pdfBlob = await generatePDF();
      const pdfFile = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });

      // Upload PDF to Supabase Storage
      const filePath = `${user.id}/${fileName}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('user-scans')
        .upload(filePath, pdfFile);

      if (uploadError) throw uploadError;

      // Get a signed URL (bucket is private)
      const { data: urlData, error: signedUrlError } = await supabase.storage
        .from('user-scans')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year for storage in DB
      if (signedUrlError || !urlData?.signedUrl) throw signedUrlError || new Error('Failed to get signed URL');

      // Generate and upload thumbnail from first page
      let thumbnailUrl: string | null = null;
      if (pages.length > 0) {
        try {
          // Convert first page to thumbnail (resized JPEG)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = pages[0].imageData;
          });
          
          // Create thumbnail at 200x280 (roughly A4 ratio)
          const thumbWidth = 200;
          const thumbHeight = Math.round((img.height / img.width) * thumbWidth);
          canvas.width = thumbWidth;
          canvas.height = thumbHeight;
          
          ctx?.drawImage(img, 0, 0, thumbWidth, thumbHeight);
          
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          const thumbnailBlob = await fetch(thumbnailDataUrl).then(r => r.blob());
          const thumbnailFile = new File([thumbnailBlob], `${fileName}_thumb.jpg`, { type: 'image/jpeg' });
          
          const thumbPath = `${user.id}/${fileName}_thumb_${Date.now()}.jpg`;
          const { error: thumbUploadError } = await supabase.storage
            .from('user-scans')
            .upload(thumbPath, thumbnailFile);
          
          if (!thumbUploadError) {
            const { data: thumbUrlData } = await supabase.storage
              .from('user-scans')
              .createSignedUrl(thumbPath, 60 * 60 * 24 * 365);
            thumbnailUrl = thumbUrlData?.signedUrl || null;
          }
        } catch (thumbError) {
          console.error('Thumbnail generation error:', thumbError);
          // Continue without thumbnail
        }
      }

      // Save to database with thumbnail
      const { error: dbError } = await supabase
        .from('user_scans')
        .insert({
          user_id: user.id,
          title: fileName,
          file_url: urlData.signedUrl,
          thumbnail_url: thumbnailUrl,
          page_count: pages.length,
          file_size_bytes: pdfBlob.size,
        });

      if (dbError) throw dbError;

      toast.success('Scan saved successfully!');
      setShowSaveDialog(false);
      navigate('/library');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save scan');
    } finally {
      setIsSaving(false);
    }
  };

  // Edge Detection Camera View
  if (scannerStep === 'capturing') {
    return (
      <DocumentEdgeDetector
        onCapture={handleImageCaptured}
        onCancel={handleCancelCapture}
      />
    );
  }

  // Perspective Correction View
  if (scannerStep === 'adjusting' && capturedImage) {
    return (
      <PerspectiveCorrector
        imageData={capturedImage}
        initialCorners={capturedCorners}
        onConfirm={handleCorrectionComplete}
        onRetake={handleRetakeFromAdjust}
        onCancel={handleCancelCapture}
      />
    );
  }

  // Review Screen with Filters
  if (scannerStep === 'reviewing' && currentPage) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/80">
          <Button variant="ghost" size="icon" onClick={retakePage} className="text-white">
            <X className="w-6 h-6" />
          </Button>
          <span className="text-white font-medium">Review Scan</span>
          <Button variant="ghost" size="icon" onClick={confirmPage} className="text-green-400">
            <Check className="w-6 h-6" />
          </Button>
        </div>

        {/* Image Preview */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={currentPage.imageData}
            alt="Scanned page"
            className={`max-w-full max-h-full object-contain rounded-lg ${
              currentPage.filter === 'bw' ? 'grayscale contrast-200' : 
              currentPage.filter === 'magic' ? 'contrast-125 saturate-110' : ''
            }`}
          />
        </div>

        {/* Filter Options */}
        <div className="p-4 bg-black/80">
          <p className="text-white/70 text-sm text-center mb-3">Apply Filter</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => applyFilter('original')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentPage.filter === 'original' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => applyFilter('bw')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentPage.filter === 'bw' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white'
              }`}
            >
              B&W
            </button>
            <button
              onClick={() => applyFilter('magic')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                currentPage.filter === 'magic' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Magic
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-black/80 flex gap-4">
          <Button variant="outline" className="flex-1" onClick={retakePage}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
          <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={confirmPage}>
            <Check className="w-4 h-4 mr-2" />
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  // Main Scanner View (idle state)
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="w-6 h-6" />
        </Button>
        <span className="font-semibold">Smart Scanner</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setFlashOn(!flashOn)}
          className={flashOn ? 'text-yellow-500' : ''}
        >
          {flashOn ? <Flashlight className="w-6 h-6" /> : <FlashlightOff className="w-6 h-6" />}
        </Button>
      </div>

      {/* Camera/Preview Area */}
      <div className="flex-1 bg-muted flex flex-col overflow-hidden">
        {pages.length > 0 ? (
          <div className="flex-1 p-3 overflow-auto">
            {/* Smaller thumbnails in 3 columns */}
            <div className="grid grid-cols-3 gap-2">
              {pages.map((page, index) => (
                <div key={page.id} className="relative aspect-[3/4] rounded-md overflow-hidden bg-card shadow-sm">
                  <img 
                    src={page.imageData} 
                    alt={`Page ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => removePage(page.id)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              {/* Compact Add Page button */}
              <button
                onClick={startCapture}
                className="aspect-[3/4] rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-medium">Add</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <ScanLine className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start Scanning</h2>
            <p className="text-muted-foreground mb-6">
              Capture documents with edge detection and perspective correction
            </p>
            <Button size="lg" onClick={startCapture}>
              <CameraIcon className="w-5 h-5 mr-2" />
              Scan Document
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Actions - Always visible when pages exist */}
      {pages.length > 0 && (
        <div className="p-3 border-t bg-card safe-area-bottom">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {pages.length} page{pages.length !== 1 ? 's' : ''}
            </span>
            <Button variant="outline" size="sm" onClick={startCapture} className="flex-shrink-0">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={() => setShowSaveDialog(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Save PDF
            </Button>
          </div>
        </div>
      )}

      {/* Floating Capture Button (when no pages exist) */}
      {pages.length === 0 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={startCapture}
            className="w-20 h-20 rounded-full bg-destructive shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 rounded-full border-4 border-white" />
          </button>
        </div>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Scan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Filename</label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter filename"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Tip: Use subject codes for easy searching (e.g., 3110004_MidSem_2025)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={savePDF} disabled={isSaving || !fileName.trim()}>
              {isSaving ? 'Saving...' : 'Save PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartScanner;
