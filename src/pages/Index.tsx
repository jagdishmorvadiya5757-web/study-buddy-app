import Header from '@/components/gtu/Header';
import HeroSection from '@/components/gtu/HeroSection';
import BranchCard from '@/components/gtu/BranchCard';
import TrendingResources from '@/components/gtu/TrendingResources';
import Footer from '@/components/gtu/Footer';
import { useBranches } from '@/hooks/useBranches';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, FileText, Video } from 'lucide-react';

const Index = () => {
  const { data: branches, isLoading } = useBranches();

  const features = [
    {
      icon: FileText,
      title: 'GTU Papers & Solutions',
      description: 'Access previous year question papers with detailed solutions for all subjects.',
    },
    {
      icon: Video,
      title: 'Video Playlists',
      description: 'Curated video lectures from top educators covering the entire syllabus.',
    },
    {
      icon: BookOpen,
      title: 'Books & Notes',
      description: 'Reference books, lab manuals, and handwritten notes from toppers.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Trending Resources */}
      <TrendingResources />

      {/* Browse by Branch */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Browse by Branch
              </h2>
              <p className="text-muted-foreground">
                Select your engineering branch to find relevant study materials
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:inline-flex">
              <Link to="/branches" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches?.slice(0, 6).map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/branches" className="gap-2">
                View All Branches <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive study resources designed specifically for GTU engineering students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="text-center p-8 rounded-2xl bg-card shadow-soft hover:shadow-card transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-6">
                  <Icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of GTU students who are already using our platform to excel in their exams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link to="/resources">Browse Resources</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link to="/auth?mode=signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;