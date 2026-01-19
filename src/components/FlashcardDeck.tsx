import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

const sampleCards: Flashcard[] = [
  { id: 1, question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
  { id: 2, question: "What is the capital of France?", answer: "Paris" },
  { id: 3, question: "What year did World War II end?", answer: "1945" },
  { id: 4, question: "What is the chemical symbol for gold?", answer: "Au" },
  { id: 5, question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
];

const FlashcardDeck = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState<number[]>([]);

  const currentCard = sampleCards[currentIndex];
  const progress = ((currentIndex + 1) / sampleCards.length) * 100;

  const handleNext = () => {
    if (currentIndex < sampleCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMaster = () => {
    if (!mastered.includes(currentCard.id)) {
      setMastered([...mastered, currentCard.id]);
    }
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMastered([]);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          Card {currentIndex + 1} of {sampleCards.length}
        </span>
        <span className="text-sm font-medium text-secondary">
          {mastered.length} mastered
        </span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="h-full gradient-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        onClick={handleFlip}
        className="relative w-full aspect-[3/2] cursor-pointer perspective-1000 mb-6"
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl bg-card shadow-card backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xl font-medium text-center text-foreground">
              {currentCard.question}
            </p>
            <span className="absolute bottom-4 text-sm text-muted-foreground">
              Tap to reveal
            </span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-2xl gradient-accent shadow-card [transform:rotateY(180deg)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-2xl font-display font-bold text-center text-accent-foreground">
              {currentCard.answer}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleMaster}
          className="flex-1 gradient-primary"
          disabled={currentIndex === sampleCards.length - 1 && mastered.includes(currentCard.id)}
        >
          {mastered.includes(currentCard.id) ? "Mastered ✓" : "Got it!"}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === sampleCards.length - 1}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="rounded-full"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardDeck;