import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
  Wand2
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

interface ScannedPage {
  id: string;
  imageData: string;
  filter: 'original' | 'bw' | 'magic';
}

const SmartScanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [currentPage, setCurrentPage] = useState<ScannedPage | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
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

  const captureImage = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image.base64String) {
        const newPage: ScannedPage = {
          id: crypto.randomUUID(),
          imageData: `data:image/${image.format};base64,${image.base64String}`,
          filter: 'original',
        };
        setCurrentPage(newPage);
        setIsReviewing(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      // Fallback for web: use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const newPage: ScannedPage = {
              id: crypto.randomUUID(),
              imageData: reader.result as string,
              filter: 'original',
            };
            setCurrentPage(newPage);
            setIsReviewing(true);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
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
      setIsReviewing(false);
    }
  };

  const retakePage = () => {
    setCurrentPage(null);
    setIsReviewing(false);
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

      // Upload to Supabase Storage
      const filePath = `${user.id}/${fileName}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('user-scans')
        .upload(filePath, pdfFile);

      if (uploadError) throw uploadError;

      // Get the URL
      const { data: urlData } = supabase.storage
        .from('user-scans')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_scans')
        .insert({
          user_id: user.id,
          title: fileName,
          file_url: urlData.publicUrl,
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

  // Review Screen
  if (isReviewing && currentPage) {
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

  // Main Scanner View
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
      <div className="flex-1 bg-muted flex flex-col">
        {pages.length > 0 ? (
          <div className="flex-1 p-4 overflow-auto">
            <div className="grid grid-cols-2 gap-3">
              {pages.map((page, index) => (
                <div key={page.id} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-card shadow-md">
                  <img 
                    src={page.imageData} 
                    alt={`Page ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => removePage(page.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {/* Add more button */}
              <button
                onClick={captureImage}
                className="aspect-[3/4] rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm">Add Page</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CameraIcon className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Start Scanning</h2>
            <p className="text-muted-foreground mb-6">
              Capture documents and convert them to PDF
            </p>
            <Button size="lg" onClick={captureImage}>
              <CameraIcon className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {pages.length > 0 && (
        <div className="p-4 border-t bg-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {pages.length} page{pages.length !== 1 ? 's' : ''} scanned
            </span>
            <Button variant="outline" size="sm" onClick={captureImage}>
              <Plus className="w-4 h-4 mr-1" />
              Add More
            </Button>
          </div>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => setShowSaveDialog(true)}
          >
            <FileText className="w-5 h-5 mr-2" />
            Save as PDF
          </Button>
        </div>
      )}

      {/* Floating Capture Button (when pages exist) */}
      {pages.length === 0 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={captureImage}
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
