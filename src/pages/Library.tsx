import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Share } from '@capacitor/share';
import Header from '@/components/gtu/Header';
import Footer from '@/components/gtu/Footer';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import PdfViewer from '@/components/admin/PdfViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  Edit2, 
  Share2, 
  Trash2,
  ScanLine,
  Download,
  FolderOpen,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

type TabType = 'scans' | 'downloads';

interface UserScan {
  id: string;
  title: string;
  file_url: string;
  thumbnail_url: string | null;
  page_count: number;
  file_size_bytes: number | null;
  created_at: string;
}

interface UserDownload {
  id: string;
  downloaded_at: string;
  resource: {
    id: string;
    title: string;
    subject_name: string;
    resource_type: string;
    file_url: string | null;
    external_url: string | null;
    thumbnail_url: string | null;
  };
}

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('scans');
  const [searchQuery, setSearchQuery] = useState('');
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; scan: UserScan | null }>({ open: false, scan: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; scan: UserScan | null }>({ open: false, scan: null });
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; scan: UserScan | null }>({ open: false, scan: null });
  const [newTitle, setNewTitle] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);

  // Fetch PDF blob when preview dialog opens (using signed URL for private bucket)
  useEffect(() => {
    if (previewDialog.open && previewDialog.scan?.file_url) {
      const fetchPdf = async () => {
        setIsLoadingPdf(true);
        setPdfBlobUrl(null);
        try {
          // Extract storage path from the file_url
          const match = previewDialog.scan!.file_url.match(
            /\/storage\/v1\/object\/(?:public|sign)\/user-scans\/(.+?)(?:\?|$)/
          );
          const storagePath = match?.[1];
          if (!storagePath) throw new Error('Invalid file URL');

          const { data, error } = await supabase.storage
            .from('user-scans')
            .createSignedUrl(decodeURIComponent(storagePath), 3600);
          if (error || !data?.signedUrl) throw error || new Error('Failed to get signed URL');

          const response = await fetch(data.signedUrl);
          if (!response.ok) throw new Error('Failed to fetch PDF');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
        } catch (error) {
          console.error('Error fetching PDF:', error);
          toast.error('Failed to load PDF');
        } finally {
          setIsLoadingPdf(false);
        }
      };
      fetchPdf();
    } else {
      // Cleanup blob URL when dialog closes
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewDialog.open, previewDialog.scan?.file_url]);

  // Fetch user scans
  const { data: scans, isLoading: scansLoading } = useQuery({
    queryKey: ['user-scans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as UserScan[];
    },
    enabled: !!user,
  });

  // Fetch user downloads
  const { data: downloads, isLoading: downloadsLoading } = useQuery({
    queryKey: ['user-downloads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_downloads')
        .select(`
          id,
          downloaded_at,
          resource:resources (
            id,
            title,
            subject_name,
            resource_type,
            file_url,
            external_url,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id)
        .eq('is_saved', true)
        .order('downloaded_at', { ascending: false });
      if (error) throw error;
      return data as unknown as UserDownload[];
    },
    enabled: !!user,
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from('user_scans')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-scans'] });
      toast.success('Renamed successfully');
      setRenameDialog({ open: false, scan: null });
    },
    onError: () => {
      toast.error('Failed to rename');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (scan: UserScan) => {
      // Delete from storage first
      const fileName = scan.file_url.split('/').pop();
      if (fileName && user) {
        await supabase.storage
          .from('user-scans')
          .remove([`${user.id}/${fileName}`]);
      }
      // Delete from database
      const { error } = await supabase
        .from('user_scans')
        .delete()
        .eq('id', scan.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-scans'] });
      toast.success('Deleted successfully');
      setDeleteDialog({ open: false, scan: null });
    },
    onError: () => {
      toast.error('Failed to delete');
    },
  });

  const handleShare = async (url: string, title: string) => {
    try {
      await Share.share({
        title: title,
        url: url,
        dialogTitle: 'Share with friends',
      });
    } catch (error) {
      // Fallback for web
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    }
  };

  const filteredScans = scans?.filter(scan =>
    scan.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDownloads = downloads?.filter(download =>
    download.resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    download.resource.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Helper to get a fresh signed URL from a stored file_url
  const getSignedUrl = async (fileUrl: string): Promise<string | null> => {
    const match = fileUrl.match(
      /\/storage\/v1\/object\/(?:public|sign)\/user-scans\/(.+?)(?:\?|$)/
    );
    const storagePath = match?.[1];
    if (!storagePath) return null;
    const { data, error } = await supabase.storage
      .from('user-scans')
      .createSignedUrl(decodeURIComponent(storagePath), 3600);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to access your library</h2>
            <p className="text-muted-foreground mb-4">Your scans and downloads will appear here</p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/50 py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              My Library
            </h1>
            
            {/* Segmented Control */}
            <div className="flex bg-muted rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab('scans')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'scans' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground'
                }`}
              >
                My Scans
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'downloads' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground'
                }`}
              >
                Downloaded Materials
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            {activeTab === 'scans' ? (
              scansLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                  ))}
                </div>
              ) : filteredScans && filteredScans.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredScans.map((scan) => (
                    <div 
                      key={scan.id} 
                      className="bg-card rounded-xl shadow-soft overflow-hidden group"
                    >
                      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                        {scan.thumbnail_url ? (
                          <img 
                            src={scan.thumbnail_url} 
                            alt={scan.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="w-12 h-12 text-muted-foreground/30" />
                        )}
                        <div className="absolute top-2 right-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 text-white hover:bg-black/70">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setPreviewDialog({ open: true, scan })}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                const url = await getSignedUrl(scan.file_url);
                                if (url) window.open(url, '_blank');
                                else toast.error('Failed to open file');
                              }}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open in New Tab
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setNewTitle(scan.title);
                                setRenameDialog({ open: true, scan });
                              }}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                const url = await getSignedUrl(scan.file_url);
                                if (url) handleShare(url, scan.title);
                                else toast.error('Failed to share file');
                              }}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ open: true, scan })}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-1">{scan.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {scan.page_count} page{scan.page_count !== 1 ? 's' : ''} • {formatFileSize(scan.file_size_bytes)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(scan.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <ScanLine className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No Scans Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start scanning documents to build your library
                  </p>
                  <Button asChild>
                    <Link to="/scanner">
                      <ScanLine className="w-4 h-4 mr-2" />
                      Start Your First Scan
                    </Link>
                  </Button>
                </div>
              )
            ) : (
              downloadsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                  ))}
                </div>
              ) : filteredDownloads && filteredDownloads.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredDownloads.map((download) => (
                    <div 
                      key={download.id} 
                      className="bg-card rounded-xl shadow-soft overflow-hidden cursor-pointer hover:shadow-card transition-shadow"
                      onClick={() => {
                        const url = download.resource.external_url || download.resource.file_url;
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <div className="aspect-[3/4] bg-muted flex items-center justify-center relative overflow-hidden">
                        {download.resource.thumbnail_url ? (
                          <img 
                            src={download.resource.thumbnail_url} 
                            alt={download.resource.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Download className="w-12 h-12 text-muted-foreground/30" />
                        )}
                        <div className="absolute bottom-2 left-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                            {download.resource.resource_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-1">{download.resource.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {download.resource.subject_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(download.downloaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Download className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    No Downloads Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Browse resources and save them to your library
                  </p>
                  <Button asChild>
                    <Link to="/resources">Browse Resources</Link>
                  </Button>
                </div>
              )
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, scan: renameDialog.scan })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, scan: null })}>
              Cancel
            </Button>
            <Button 
              onClick={() => renameDialog.scan && renameMutation.mutate({ id: renameDialog.scan.id, title: newTitle })}
              disabled={!newTitle.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, scan: deleteDialog.scan })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.scan?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteDialog.scan && deleteMutation.mutate(deleteDialog.scan)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onOpenChange={(open) => setPreviewDialog({ open, scan: open ? previewDialog.scan : null })}
      >
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b">
            <DialogTitle className="text-lg font-semibold line-clamp-1">
              {previewDialog.scan?.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {previewDialog.scan?.page_count} page{previewDialog.scan?.page_count !== 1 ? 's' : ''} • {formatFileSize(previewDialog.scan?.file_size_bytes || null)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-[calc(85vh-80px)] overflow-hidden">
            {isLoadingPdf ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : pdfBlobUrl ? (
              <PdfViewer
                pdfUrl={pdfBlobUrl}
                title={previewDialog.scan?.title}
                onError={(error) => {
                  console.error('PDF viewer error:', error);
                  toast.error('Failed to display PDF');
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No PDF to display
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;
