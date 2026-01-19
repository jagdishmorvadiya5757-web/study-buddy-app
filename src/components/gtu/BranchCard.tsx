import { Link } from 'react-router-dom';
import { Branch } from '@/hooks/useBranches';
import { 
  Monitor, 
  Database, 
  Brain, 
  Cpu, 
  Wifi, 
  Building2, 
  Cog, 
  Zap, 
  Radio,
  FlaskConical,
  GraduationCap
} from 'lucide-react';

const branchIcons: Record<string, React.ElementType> = {
  CE: Monitor,
  IT: Database,
  AIDS: Brain,
  CSE: Cpu,
  ICT: Wifi,
  CIVIL: Building2,
  MECH: Cog,
  EE: Zap,
  EC: Radio,
  CHEM: FlaskConical,
};

interface BranchCardProps {
  branch: Branch;
}

const BranchCard = ({ branch }: BranchCardProps) => {
  const Icon = branchIcons[branch.code] || GraduationCap;

  return (
    <Link
      to={`/resources?branch=${branch.id}`}
      className="group block p-6 rounded-2xl bg-card shadow-soft hover:shadow-elevated transition-all duration-300 border border-border hover:border-primary/20"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
            {branch.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {branch.description || `Resources for ${branch.name}`}
          </p>
          <span className="inline-block mt-2 text-xs font-medium text-primary bg-accent px-2 py-1 rounded">
            {branch.code}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BranchCard;