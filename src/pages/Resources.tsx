import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/gtu/Header';
import Footer from '@/components/gtu/Footer';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import SemesterFilter from '@/components/gtu/SemesterFilter';
import ResourceTypeFilter from '@/components/gtu/ResourceTypeFilter';
import ResourceCard from '@/components/gtu/ResourceCard';
import { useResources, ResourceType } from '@/hooks/useResources';
import { useBranches } from '@/hooks/useBranches';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search, Filter, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Resources = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);

  const branchFromUrl = searchParams.get('branch');
  const [selectedBranch, setSelectedBranch] = useState<string | null>(branchFromUrl);

  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: resources, isLoading: resourcesLoading } = useResources({
    branchId: selectedBranch || undefined,
    semester: selectedSemester || undefined,
    resourceType: selectedType || undefined,
    searchQuery: searchQuery || undefined,
  });

  const handleBranchChange = (value: string) => {
    const newBranch = value === 'all' ? null : value;
    setSelectedBranch(newBranch);
    if (newBranch) {
      setSearchParams({ branch: newBranch });
    } else {
      setSearchParams({});
    }
  };

  const selectedBranchName = branches?.find(b => b.id === selectedBranch)?.name;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Study Resources
                </h1>
                <p className="text-muted-foreground">
                  {selectedBranchName 
                    ? `Showing resources for ${selectedBranchName}`
                    : 'Browse all GTU engineering study materials'}
                </p>
              </div>
            </div>

            {/* Search & Branch Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-64">
                <Select
                  value={selectedBranch || 'all'}
                  onValueChange={handleBranchChange}
                >
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 border-b border-border bg-card">
          <div className="container mx-auto px-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Semester</h3>
              <SemesterFilter
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Resource Type</h3>
              <ResourceTypeFilter
                selectedType={selectedType}
                onSelectType={setSelectedType}
              />
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {resourcesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : resources && resources.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Found {resources.length} resource{resources.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No Resources Found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery || selectedBranch || selectedSemester || selectedType
                    ? 'Try adjusting your filters or search query'
                    : 'Resources will appear here once they are uploaded by administrators'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Resources;