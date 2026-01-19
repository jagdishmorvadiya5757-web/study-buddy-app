import Header from '@/components/gtu/Header';
import Footer from '@/components/gtu/Footer';
import BranchCard from '@/components/gtu/BranchCard';
import { useBranches } from '@/hooks/useBranches';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap } from 'lucide-react';

const Branches = () => {
  const { data: branches, isLoading } = useBranches();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/50 py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Engineering Branches
                </h1>
                <p className="text-muted-foreground">
                  Browse study materials by your branch
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Branches Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches?.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Branches;