import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { format } from 'date-fns';
import { ClipboardList } from 'lucide-react';

const actionLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  approve_scan: { label: 'Approved Scan', variant: 'default' },
  reject_scan: { label: 'Rejected Scan', variant: 'destructive' },
  delete_scan: { label: 'Deleted Scan', variant: 'destructive' },
  create_resource: { label: 'Created Resource', variant: 'default' },
  delete_resource: { label: 'Deleted Resource', variant: 'destructive' },
  create_branch: { label: 'Created Branch', variant: 'default' },
  update_branch: { label: 'Updated Branch', variant: 'secondary' },
  delete_branch: { label: 'Deleted Branch', variant: 'destructive' },
};

const AdminAudit = () => {
  const { data: logs, isLoading } = useAuditLogs(100);

  return (
    <AdminLayout
      title="Audit Logs"
      subtitle="Track admin actions and changes"
    >
      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Log Entries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading...</p>
          ) : logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const actionInfo = actionLabels[log.action] || { 
                      label: log.action.replace(/_/g, ' '), 
                      variant: 'outline' as const 
                    };

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.admin_name || log.admin_email || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionInfo.variant}>
                            {actionInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {log.entity_type.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No audit logs yet. Actions will be tracked here.
            </p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAudit;
