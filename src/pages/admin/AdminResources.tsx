import { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useResources, useCreateResource, useDeleteResource, ResourceType } from '@/hooks/useResources';
import { useBranches } from '@/hooks/useBranches';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Search, ExternalLink, Upload, File } from 'lucide-react';

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: 'playlist', label: 'Video Playlist' },
  { value: 'gtu_paper', label: 'GTU Paper' },
  { value: 'paper_solution', label: 'Paper Solution' },
  { value: 'imp', label: 'IMP Questions' },
  { value: 'book', label: 'Book' },
  { value: 'lab_manual', label: 'Lab Manual' },
  { value: 'handwritten_notes', label: 'Handwritten Notes' },
];

const resourceTypeLabels: Record<ResourceType, string> = {
  playlist: 'Playlist',
  gtu_paper: 'GTU Paper',
  paper_solution: 'Solution',
  imp: 'IMP',
  book: 'Book',
  lab_manual: 'Lab Manual',
  handwritten_notes: 'Notes',
};

const AdminResources = () => {
  const { user } = useAuth();
  const { data: resources, isLoading } = useResources();
  const { data: branches } = useBranches();
  const createResource = useCreateResource();
  const deleteResource = useDeleteResource();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: '' as ResourceType | '',
    branch_id: '',
    semester: '',
    subject_name: '',
    external_url: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: '',
      branch_id: '',
      semester: '',
      subject_name: '',
      external_url: '',
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and Word documents are allowed');
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload file');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.resource_type || !formData.branch_id || 
        !formData.semester || !formData.subject_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Require either file upload or external URL
    if (!selectedFile && !formData.external_url) {
      toast.error('Please upload a file or provide an external URL');
      return;
    }

    try {
      setIsUploading(true);
      let fileUrl: string | null = null;

      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }

      await createResource.mutateAsync({
        title: formData.title,
        description: formData.description || null,
        resource_type: formData.resource_type as ResourceType,
        branch_id: formData.branch_id,
        semester: parseInt(formData.semester),
        subject_name: formData.subject_name,
        external_url: formData.external_url || null,
        file_url: fileUrl,
        thumbnail_url: null,
        is_active: true,
        uploaded_by: user?.id || null,
      });
      toast.success('Resource created successfully');
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create resource');
    } finally {
      setIsUploading(false);
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

  const filteredResources = resources?.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const branchMap = new Map(branches?.map(b => [b.id, b.name]) || []);

  return (
    <AdminLayout
      title="Resource Management"
      subtitle="Add and manage study materials"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
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
                      <SelectValue placeholder="Select sem" />
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

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Upload File (PDF/Document)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <File className="w-8 h-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer py-4"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 50MB)</p>
                    </label>
                  )}
                </div>
              </div>

              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                <Label>External URL (PDF/Video Link)</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                  disabled={!!selectedFile}
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Remove the uploaded file to use an external URL instead
                  </p>
                )}
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
                className="w-full" 
                onClick={handleCreate}
                disabled={createResource.isPending || isUploading}
              >
                {isUploading ? 'Uploading...' : createResource.isPending ? 'Creating...' : 'Create Resource'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resources?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Resources</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Resources</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading...</p>
          ) : filteredResources && filteredResources.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Sem</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {resource.title}
                      </TableCell>
                      <TableCell>{resource.subject_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {resourceTypeLabels[resource.resource_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {branchMap.get(resource.branch_id) || '-'}
                      </TableCell>
                      <TableCell>{resource.semester}</TableCell>
                      <TableCell className="font-semibold">
                        {resource.download_count}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {resource.external_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(resource.id)}
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
              {searchQuery ? 'No resources match your search.' : 'No resources yet. Add your first one!'}
            </p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminResources;
