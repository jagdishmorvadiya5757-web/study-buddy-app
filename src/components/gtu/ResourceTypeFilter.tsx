import { cn } from '@/lib/utils';
import { ResourceType } from '@/hooks/useResources';
import { 
  PlayCircle, 
  FileText, 
  CheckCircle, 
  Star, 
  BookOpen, 
  FlaskConical, 
  PenTool 
} from 'lucide-react';

interface ResourceTypeFilterProps {
  selectedType: ResourceType | null;
  onSelectType: (type: ResourceType | null) => void;
}

const resourceTypes: { type: ResourceType; label: string; icon: React.ElementType }[] = [
  { type: 'playlist', label: 'Playlists', icon: PlayCircle },
  { type: 'gtu_paper', label: 'GTU Papers', icon: FileText },
  { type: 'paper_solution', label: 'Solutions', icon: CheckCircle },
  { type: 'imp', label: 'IMPs', icon: Star },
  { type: 'book', label: 'Books', icon: BookOpen },
  { type: 'lab_manual', label: 'Lab Manuals', icon: FlaskConical },
  { type: 'handwritten_notes', label: 'Notes', icon: PenTool },
];

const ResourceTypeFilter = ({ selectedType, onSelectType }: ResourceTypeFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectType(null)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          selectedType === null
            ? 'gradient-primary text-primary-foreground shadow-soft'
            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        All Types
      </button>
      {resourceTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            selectedType === type
              ? 'gradient-primary text-primary-foreground shadow-soft'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ResourceTypeFilter;