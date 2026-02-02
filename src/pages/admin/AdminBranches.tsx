import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { 
  useAllBranches, 
  useCreateBranch, 
  useUpdateBranch, 
  useDeleteBranch,
  Branch 
} from '@/hooks/useBranchManagement';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';

const AdminBranches = () => {
  const { data: branches, isLoading } = useAllBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' });
    setEditingBranch(null);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Name and code are required');
      return;
    }

    try {
      await createBranch.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
      });
      toast.success('Branch created successfully');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create branch');
    }
  };

  const handleUpdate = async () => {
    if (!editingBranch) return;

    try {
      await updateBranch.mutateAsync({
        id: editingBranch.id,
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description || null,
      });
      toast.success('Branch updated successfully');
      setEditingBranch(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to update branch');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will affect all resources in this branch.')) return;

    try {
      await deleteBranch.mutateAsync(id);
      toast.success('Branch deleted');
    } catch (error) {
      toast.error('Failed to delete branch. It may have associated resources.');
    }
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      description: branch.description || '',
    });
  };

  return (
    <AdminLayout
      title="Branch Management"
      subtitle="Add and manage engineering branches"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Branch Name *</Label>
                <Input
                  placeholder="e.g., Computer Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Branch Code *</Label>
                <Input
                  placeholder="e.g., CE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of the branch..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreate}
                disabled={createBranch.isPending}
              >
                {createBranch.isPending ? 'Creating...' : 'Create Branch'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats Card */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FolderTree className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{branches?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Branches</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading...</p>
          ) : branches && branches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{branch.code}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {branch.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.is_active ? 'default' : 'outline'}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(branch)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(branch.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No branches yet. Add your first one!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingBranch} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Branch Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Branch Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUpdate}
              disabled={updateBranch.isPending}
            >
              {updateBranch.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBranches;
