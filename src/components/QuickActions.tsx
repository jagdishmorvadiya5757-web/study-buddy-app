import { Plus, Brain, FileText, Calendar } from "lucide-react";

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
}

const QuickAction = ({ icon, label, description }: QuickActionProps) => (
  <button className="flex items-center gap-4 w-full p-4 rounded-xl bg-card shadow-soft hover:shadow-card transition-all duration-300 group text-left">
    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted group-hover:gradient-primary transition-all duration-300">
      <div className="text-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
    </div>
    <div>
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </button>
);

const QuickActions = () => {
  const actions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: "Create Deck",
      description: "Add new flashcards",
    },
    {
      icon: <Brain className="w-5 h-5" />,
      label: "Quick Quiz",
      description: "Test your knowledge",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "New Note",
      description: "Capture your thoughts",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "Schedule",
      description: "Plan study sessions",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <QuickAction key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;