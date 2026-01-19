import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/gtu/Header';
import Footer from '@/components/gtu/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBranches } from '@/hooks/useBranches';
import { useResources, useCreateResource, useDeleteResource, ResourceType } from '@/hooks/useResources';
import { toast } from 'sonner';
import { Shield, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: 'playlist', label: 'Video Playlist' },
  { value: 'gtu_paper', label: 'GTU Paper' },
  { value: 'paper_solution', label: 'Paper Solution' },
  { value: 'imp', label: 'IMP Questions' },
  { value: 'book', label: 'Book' },
  { value: 'lab_manual', label: 'Lab Manual' },
  { value: 'handwritten_notes', label: 'Handwritten Notes' },
];

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: branches } = useBranches();
  const { data: resources, isLoading: resourcesLoading } = useResources();
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: '' as ResourceType | '',
    branch_id: '',
    semester: '',
    subject_name: '',
    external_url: '',
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
      toast.error('Access denied. Admin privileges required.');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.resource_type || !formData.branch_id || !formData.semester || !formData.subject_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createResource.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        resource_type: formData.resource_type as ResourceType,
        branch_id: formData.branch_id,
        semester: parseInt(formData.semester),
        subject_name: formData.subject_name,
        external_url: formData.external_url || null,
        file_url: null,
        thumbnail_url: null,
        is_active: true,
        uploaded_by: user?.id || null,
      });

      toast.success('Resource created successfully!');
      setFormData({
        title: '',
        description: '',
        resource_type: '',
        branch_id: '',
        semester: '',
        subject_name: '',
        external_url: '',
      });
    } catch (error) {
      toast.error('Failed to create resource');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await deleteResource.mutateAsync(id);
      toast.success('Resource deleted');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage study resources
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Resource Form */}
            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add New Resource
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="e.g., Data Structures GTU Paper 2023"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Resource Type *</Label>
                    <Select
                      value={formData.resource_type}
                      onValueChange={(value) => setFormData({ ...formData, resource_type: value as ResourceType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {resourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Semester *</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select
                    value={formData.branch_id}
                    onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject Name *</Label>
                  <Input
                    placeholder="e.g., Data Structures"
                    value={formData.subject_name}
                    onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>External URL</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Add a description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={createResource.isPending}
                >
                  {createResource.isPending ? 'Creating...' : 'Create Resource'}
                </Button>
              </form>
            </div>

            {/* Resources List */}
            <div className="bg-card p-6 rounded-2xl shadow-soft border border-border">
              <h2 className="font-display text-xl font-semibold mb-6">
                Recent Resources ({resources?.length || 0})
              </h2>

              {resourcesLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : resources && resources.length > 0 ? (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {resource.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {resource.subject_name} · Sem {resource.semester}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No resources yet. Add your first one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;