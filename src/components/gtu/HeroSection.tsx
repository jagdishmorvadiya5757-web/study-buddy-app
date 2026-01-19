import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, GraduationCap, Users } from 'lucide-react';

const HeroSection = () => {
  const stats = [
    { icon: BookOpen, value: '500+', label: 'Study Materials' },
    { icon: Download, value: '10K+', label: 'Downloads' },
    { icon: GraduationCap, value: '10', label: 'Branches' },
    { icon: Users, value: '2K+', label: 'Students' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20 lg:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Gujarat Technological University
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your Complete
            <span className="block text-secondary">GTU Study Resource</span>
          </h1>

          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Access previous year papers, solutions, lab manuals, books, and handwritten notes 
            for all GTU engineering branches and semesters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8"
              asChild
            >
              <Link to="/resources">Browse Resources</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8"
              asChild
            >
              <Link to="/branches">Explore Branches</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm mb-3">
                  <Icon className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-2xl font-display font-bold text-white">{value}</p>
                <p className="text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;