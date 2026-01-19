import { BookOpen, Clock, Target, Flame } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}

const StatCard = ({ icon, label, value, trend }: StatCardProps) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-soft animate-fade-in">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    </div>
    {trend && (
      <span className="text-sm font-medium text-secondary">{trend}</span>
    )}
  </div>
);

const StudyStats = () => {
  const stats = [
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      label: "Study Time",
      value: "2h 45m",
      trend: "+15%",
    },
    {
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      label: "Cards Reviewed",
      value: "48",
      trend: "+8",
    },
    {
      icon: <Target className="w-5 h-5 text-primary" />,
      label: "Accuracy",
      value: "87%",
      trend: "+3%",
    },
    {
      icon: <Flame className="w-5 h-5 text-secondary" />,
      label: "Day Streak",
      value: "7",
      trend: "🔥",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={stat.label} style={{ animationDelay: `${index * 100}ms` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default StudyStats;