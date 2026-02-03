import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MessageSquare, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSupportRequests, useUpdateSupportRequest, SupportRequest } from '@/hooks/useSupportSettings';
import { format } from 'date-fns';

const AdminSupport = () => {
  const { data: requests, isLoading } = useSupportRequests();
  const updateRequest = useUpdateSupportRequest();
  
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleOpenRequest = (request: SupportRequest) => {
    setSelectedRequest(request);
    setResponse(request.admin_response || '');
    setNewStatus(request.status);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;
    
    await updateRequest.mutateAsync({
      id: selectedRequest.id,
      status: newStatus,
      admin_response: response,
    });
    
    setSelectedRequest(null);
    setResponse('');
    setNewStatus('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="gap-1"><MessageSquare className="w-3 h-3" /> In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="gap-1 text-primary border-primary"><CheckCircle className="w-3 h-3" /> Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="gap-1"><XCircle className="w-3 h-3" /> Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;

  return (
    <AdminLayout
      title="Support Requests"
      subtitle={`${pendingCount} pending requests`}
    >
      <div className="bg-card rounded-xl shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : requests?.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No support requests yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.user_email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{request.subject}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleOpenRequest(request)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Support Request</DialogTitle>
            <DialogDescription>
              From: {selectedRequest?.user_email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subject</p>
              <p className="font-medium">{selectedRequest?.subject}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Message</p>
              <p className="bg-muted p-3 rounded-lg text-sm">{selectedRequest?.message}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Admin Response</p>
              <Textarea
                placeholder="Write your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleUpdateRequest}
              disabled={updateRequest.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {updateRequest.isPending ? 'Saving...' : 'Save Response'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSupport;
