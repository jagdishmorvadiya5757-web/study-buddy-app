import { cn } from '@/lib/utils';

interface SemesterFilterProps {
  selectedSemester: number | null;
  onSelectSemester: (semester: number | null) => void;
}

const SemesterFilter = ({ selectedSemester, onSelectSemester }: SemesterFilterProps) => {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectSemester(null)}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
          selectedSemester === null
            ? 'gradient-primary text-primary-foreground shadow-soft'
            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        All Semesters
      </button>
      {semesters.map((sem) => (
        <button
          key={sem}
          onClick={() => onSelectSemester(sem)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[48px]',
            selectedSemester === sem
              ? 'gradient-primary text-primary-foreground shadow-soft'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          Sem {sem}
        </button>
      ))}
    </div>
  );
};

export default SemesterFilter;