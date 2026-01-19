import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = isBreak
    ? ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100
    : ((WORK_TIME - timeLeft) / WORK_TIME) * 100;

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(isBreak ? BREAK_TIME : WORK_TIME);
  }, [isBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const switchMode = () => {
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? WORK_TIME : BREAK_TIME);
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        setSessions((prev) => prev + 1);
      }
      switchMode();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isBreak]);

  return (
    <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-card shadow-card">
      <div className="absolute top-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Coffee className="w-4 h-4" />
        <span>{sessions} sessions</span>
      </div>

      <p className="text-sm font-medium text-muted-foreground mb-2">
        {isBreak ? "Break Time" : "Focus Time"}
      </p>

      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={553}
            strokeDashoffset={553 - (553 * progress) / 100}
            strokeLinecap="round"
            className={isBreak ? "text-secondary transition-all duration-1000" : "text-primary transition-all duration-1000"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-display font-bold text-foreground">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="rounded-full w-12 h-12"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          onClick={toggleTimer}
          size="lg"
          className="rounded-full w-16 h-16 gradient-primary"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={switchMode}
          className="rounded-full w-12 h-12"
        >
          <Coffee className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default PomodoroTimer;