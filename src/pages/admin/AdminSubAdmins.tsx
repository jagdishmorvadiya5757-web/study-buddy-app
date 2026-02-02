import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubAdminManagement } from '@/hooks/useSubAdminManagement';
import { UserPlus, Trash2, Shield, Loader2, Mail, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

const AdminSubAdmins = () => {
  const [email, setEmail] = useState('');
  const { subAdmins, isLoading, addSubAdmin, removeSubAdmin } = useSubAdminManagement();

  const handleAddSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    await addSubAdmin.mutateAsync(email);
    setEmail('');
  };

  return (
    <AdminLayout
      title="Sub-Admin Management"
      subtitle="Add or remove sub-admins who can manage resources"
    >
      <div className="space-y-6">
        {/* Add Sub-Admin Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Sub-Admin
            </CardTitle>
            <CardDescription>
              Enter the email of a registered user to grant them sub-admin access. 
              Sub-admins can only add and manage resources (PDFs, papers, etc.).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSubAdmin} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter user's email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!email.trim() || addSubAdmin.isPending}
              >
                {addSubAdmin.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Add Sub-Admin
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Permissions Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Sub-Admin Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600 dark:text-green-400 mb-2">✓ Can Do:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Add new resources (PDFs, papers, notes)</li>
                  <li>• Edit existing resources</li>
                  <li>• View resource list</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400 mb-2">✗ Cannot Do:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Access dashboard analytics</li>
                  <li>• Manage branches</li>
                  <li>• Review user scans</li>
                  <li>• View audit logs</li>
                  <li>• Manage other sub-admins</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Admins List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Sub-Admins</CardTitle>
            <CardDescription>
              {subAdmins.length} sub-admin{subAdmins.length !== 1 ? 's' : ''} with resource management access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subAdmins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No sub-admins yet</p>
                <p className="text-sm">Add a sub-admin using the form above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subAdmins.map((subAdmin) => (
                  <div
                    key={subAdmin.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {subAdmin.full_name || 'No name set'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {subAdmin.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        Added {format(new Date(subAdmin.created_at), 'MMM d, yyyy')}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Sub-Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {subAdmin.full_name || subAdmin.email} as a sub-admin? 
                              They will lose access to resource management.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeSubAdmin.mutate(subAdmin.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubAdmins;
