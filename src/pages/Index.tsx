import Header from "@/components/Header";
import StudyStats from "@/components/StudyStats";
import PomodoroTimer from "@/components/PomodoroTimer";
import FlashcardDeck from "@/components/FlashcardDeck";
import QuickActions from "@/components/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8 mx-auto max-w-6xl">
        {/* Welcome Section */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">
            Good afternoon, Student! 👋
          </h2>
          <p className="text-muted-foreground">
            Ready to learn something new today? You're on a 7-day streak!
          </p>
        </section>

        {/* Stats Section */}
        <section className="mb-8">
          <StudyStats />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Timer Section */}
          <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Focus Timer
            </h3>
            <PomodoroTimer />
          </section>

          {/* Flashcards Section */}
          <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Today's Flashcards
            </h3>
            <div className="p-6 rounded-2xl bg-card shadow-card">
              <FlashcardDeck />
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <QuickActions />
        </section>
      </main>
    </div>
  );
};

export default Index;