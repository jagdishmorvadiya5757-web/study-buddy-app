import { BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">
            StudyFlow
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Flashcards
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Notes
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Progress
          </a>
        </nav>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;