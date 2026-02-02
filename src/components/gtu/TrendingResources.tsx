import { usePopularResources } from '@/hooks/useDownloadTracking';
import ResourceCard from './ResourceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const TrendingResources = () => {
  const { data: resources, isLoading } = usePopularResources(6);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Trending Resources
              </h2>
              <p className="text-muted-foreground">Most downloaded study materials</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-trending flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Trending Resources
              </h2>
              <p className="text-muted-foreground">Most downloaded study materials</p>
            </div>
          </div>
          <Button variant="outline" asChild className="hidden md:inline-flex">
            <Link to="/resources" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, index) => (
            <div key={resource.id} className="relative">
              {index < 3 && (
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full gradient-trending flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {index + 1}
                </div>
              )}
              <ResourceCard resource={resource} />
            </div>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/resources" className="gap-2">
              View All Resources <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingResources;
