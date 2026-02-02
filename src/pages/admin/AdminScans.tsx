import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  usePendingScans, 
  useAllSharedScans,
  useAllUserScans,
  useApproveScan, 
  useRejectScan, 
  useDeleteScan,
  UserScan 
} from '@/hooks/useScanReview';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  ScanLine, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Loader2
} from 'lucide-react';
import PdfViewer from '@/components/admin/PdfViewer';

const AdminScans = () => {
  const { user } = useAuth();
  const { data: pendingScans, isLoading: pendingLoading } = usePendingScans();
  const { data: allScans, isLoading: allLoading } = useAllUserScans();
  const approveScan = useApproveScan();
  const rejectScan = useRejectScan();
  const deleteScan = useDeleteScan();

  const [previewScan, setPreviewScan] = useState<UserScan | null>(null);
  const [rejectingScan, setRejectingScan] = useState<UserScan | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<{ code: number; message: string } | null>(null);

  // Load PDF when preview scan changes
  useEffect(() => {
    if (!previewScan?.file_url) {
      setPdfBlobUrl(null);
      return;
    }

    const loadPdf = async () => {
      setIsLoadingPdf(true);
      setPdfError(null);
      setPdfBlobUrl(null);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          setPdfError({ code: 401, message: 'Not logged in. Please sign in to view PDFs.' });
          return;
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const proxyUrl = `${supabaseUrl}/functions/v1/scan-file-proxy?scanId=${encodeURIComponent(previewScan.id)}`;

        const response = await fetch(proxyUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          setPdfError(getErrorMessage(response.status, errorText));
          return;
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setPdfError({
            code: 0,
            message: 'Network error. The request may be blocked by your browser/extension. Try disabling ad blockers.',
          });
        } else {
          setPdfError({ code: 0, message: error instanceof Error ? error.message : 'Failed to load PDF.' });
        }
      } finally {
        setIsLoadingPdf(false);
      }
    };

    loadPdf();

    // Cleanup blob URL on unmount or when scan changes
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [previewScan?.id, previewScan?.file_url]);

  const getErrorMessage = (status: number, responseText: string): { code: number; message: string } => {
    switch (status) {
      case 401:
        return { code: 401, message: 'Session expired. Please log in again.' };
      case 403:
        return { code: 403, message: 'Access denied. Admin privileges required.' };
      case 404:
        return { code: 404, message: 'Scan not found or file was deleted.' };
      case 400:
        return { code: 400, message: responseText || 'Invalid request.' };
      case 500:
        return { code: 500, message: 'Server error. Please try again later.' };
      default:
        return { code: status, message: responseText || 'Failed to load PDF.' };
    }
  };

  const handleRetryPdf = () => {
    setPdfError(null);
    setPdfBlobUrl(null);
    // Trigger re-fetch by toggling previewScan
    if (previewScan) {
      const scan = previewScan;
      setPreviewScan(null);
      setTimeout(() => setPreviewScan(scan), 0);
    }
  };

  const handleApprove = async (scan: UserScan) => {
    if (!user) return;
    
    try {
      await approveScan.mutateAsync({ scanId: scan.id, adminId: user.id });
      toast.success('Scan approved and now visible to public');
    } catch (error) {
      toast.error('Failed to approve scan');
    }
  };

  const handleReject = async () => {
    if (!user || !rejectingScan) return;
    
    try {
      await rejectScan.mutateAsync({ 
        scanId: rejectingScan.id, 
        adminId: user.id,
        reason: rejectionReason || undefined,
      });
      toast.success('Scan rejected');
      setRejectingScan(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject scan');
    }
  };

  const handleDelete = async (scan: UserScan) => {
    if (!user) return;
    if (!confirm('Are you sure you want to permanently delete this scan?')) return;
    
    try {
      await deleteScan.mutateAsync({ scanId: scan.id, adminId: user.id });
      toast.success('Scan deleted');
    } catch (error) {
      toast.error('Failed to delete scan');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      case 'private':
        return <Badge variant="secondary" className="gap-1">Private</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPending = pendingScans?.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAll = allScans?.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout
      title="Scan Review"
      subtitle="Review and approve user-submitted scans"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingScans?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {allScans?.filter(s => s.share_status === 'approved').length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ScanLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allScans?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs defaultValue="pending">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingScans?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <ScanLine className="w-4 h-4" />
                  All Submissions
                </TabsTrigger>
              </TabsList>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search scans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="pending" className="mt-0">
              {pendingLoading ? (
                <p className="text-muted-foreground py-8 text-center">Loading...</p>
              ) : filteredPending && filteredPending.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Pages</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPending.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium">{scan.title}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {scan.user_name || scan.user_email || 'Unknown'}
                          </TableCell>
                          <TableCell>{scan.page_count || 1}</TableCell>
                          <TableCell>{formatFileSize(scan.file_size_bytes)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(scan.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPreviewScan(scan)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-500 hover:text-green-600"
                                onClick={() => handleApprove(scan)}
                                disabled={approveScan.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setRejectingScan(scan)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No pending scans to review 🎉
                </p>
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              {allLoading ? (
                <p className="text-muted-foreground py-8 text-center">Loading...</p>
              ) : filteredAll && filteredAll.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAll.map((scan) => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium">{scan.title}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {scan.user_name || scan.user_email || 'Unknown'}
                          </TableCell>
                          <TableCell>{getStatusBadge(scan.share_status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(scan.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPreviewScan(scan)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(scan)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  No submissions yet.
                </p>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewScan} onOpenChange={(open) => { if (!open) { setPreviewScan(null); setPdfError(null); setPdfBlobUrl(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewScan?.title}</DialogTitle>
          </DialogHeader>
          {previewScan && (
            <div className="flex flex-col flex-1 min-h-0 gap-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Submitted by:</span>{' '}
                  <span className="font-medium">{previewScan.user_name || previewScan.user_email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pages:</span>{' '}
                  <span className="font-medium">{previewScan.page_count || 1}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>{' '}
                  <span className="font-medium">{formatFileSize(previewScan.file_size_bytes)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{' '}
                  {getStatusBadge(previewScan.share_status)}
                </div>
              </div>
              
              <div className="flex-1 min-h-[400px] bg-muted rounded-lg overflow-hidden">
                {isLoadingPdf ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading PDF...</p>
                  </div>
                ) : pdfError ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                    <XCircle className="w-16 h-16 text-destructive" />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-destructive">
                        {pdfError.code > 0 ? `Error ${pdfError.code}` : 'Error'}
                      </p>
                      <p className="text-sm text-muted-foreground px-4">
                        {pdfError.message}
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleRetryPdf}>
                      <Eye className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : pdfBlobUrl ? (
                  <PdfViewer 
                    pdfUrl={pdfBlobUrl} 
                    title={previewScan.title}
                    onError={() => setPdfError({ code: 0, message: 'Failed to render PDF.' })}
                  />
                ) : !previewScan.file_url ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Preview not available
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectingScan} onOpenChange={(open) => !open && setRejectingScan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Scan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Optionally provide a reason for rejection:
            </p>
            <Textarea
              placeholder="e.g., Image quality is too low, content is irrelevant..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingScan(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={rejectScan.isPending}
            >
              {rejectScan.isPending ? 'Rejecting...' : 'Reject Scan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminScans;
