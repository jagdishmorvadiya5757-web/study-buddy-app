import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/gtu/Header';
import Footer from '@/components/gtu/Footer';
import BottomNavigation from '@/components/gtu/BottomNavigation';
import SemesterFilter from '@/components/gtu/SemesterFilter';
import ResourceCard from '@/components/gtu/ResourceCard';
import { useResources, ResourceType } from '@/hooks/useResources';
import { useBranches } from '@/hooks/useBranches';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  ArrowLeft,
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Star, 
  BookOpen, 
  FlaskConical, 
  PenTool,
  Clock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SectionType = 'playlists' | 'gtu-papers' | 'solutions' | 'imps' | 'books' | 'lab-manuals' | 'notes';

const sectionConfig: Record<SectionType, {
  title: string;
  description: string;
  resourceType: ResourceType;
  icon: React.ElementType;
  color: string;
}> = {
  'playlists': {
    title: 'Video Playlists',
    description: 'Curated video lectures from top educators covering the entire syllabus',
    resourceType: 'playlist',
    icon: PlayCircle,
    color: 'text-red-500 bg-red-50 dark:bg-red-950'
  },
  'gtu-papers': {
    title: 'GTU Papers',
    description: 'Previous year question papers for exam preparation',
    resourceType: 'gtu_paper',
    icon: FileText,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950'
  },
  'solutions': {
    title: 'Paper Solutions',
    description: 'Detailed solutions for GTU question papers',
    resourceType: 'paper_solution',
    icon: CheckCircle,
    color: 'text-green-500 bg-green-50 dark:bg-green-950'
  },
  'imps': {
    title: 'Important Questions',
    description: 'Most important questions for quick revision',
    resourceType: 'imp',
    icon: Star,
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950'
  },
  'books': {
    title: 'Books',
    description: 'Reference books and study materials',
    resourceType: 'book',
    icon: BookOpen,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950'
  },
  'lab-manuals': {
    title: 'Lab Manuals',
    description: 'Practical lab manuals with experiments',
    resourceType: 'lab_manual',
    icon: FlaskConical,
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950'
  },
  'notes': {
    title: 'Handwritten Notes',
    description: 'Quality handwritten notes from toppers',
    resourceType: 'handwritten_notes',
    icon: PenTool,
    color: 'text-pink-500 bg-pink-50 dark:bg-pink-950'
  },
};

const ResourceSection = () => {
  const { type } = useParams<{ type: SectionType }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const config = type ? sectionConfig[type as SectionType] : null;

  const { data: branches, isLoading: branchesLoading } = useBranches();
  const { data: resources, isLoading: resourcesLoading } = useResources({
    branchId: selectedBranch || undefined,
    semester: selectedSemester || undefined,
    resourceType: config?.resourceType,
    searchQuery: searchQuery || undefined,
  });

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Section not found</h2>
            <Button className="mt-4" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNavigation />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <Header />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4 -ml-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {config.title}
                </h1>
                <p className="text-muted-foreground">
                  {config.description}
                </p>
              </div>
            </div>

            {/* Search & Branch Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={`Search ${config.title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full sm:w-64">
                <Select
                  value={selectedBranch || 'all'}
                  onValueChange={(value) => setSelectedBranch(value === 'all' ? null : value)}
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

        {/* Semester Filter */}
        <section className="py-6 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Semester</h3>
            <SemesterFilter
              selectedSemester={selectedSemester}
              onSelectSemester={setSelectedSemester}
            />
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
                  Found {resources.length} {config.title.toLowerCase()}{resources.length !== 1 ? '' : ''}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${config.color} mb-6`}>
                  <Clock className="w-10 h-10" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground mb-3">
                  Coming Soon
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {searchQuery || selectedBranch || selectedSemester
                    ? `No ${config.title.toLowerCase()} found for your filters. Try adjusting your search criteria.`
                    : `${config.title} are being prepared and will be available soon. Check back later!`}
                </p>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Browse Other Resources
                </Button>
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

export default ResourceSection;
