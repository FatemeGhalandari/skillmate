import Flashcard from "./Flashcard";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // You can also use Heroicons or others

const FlashcardList = ({ flashcards }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 320; // Adjust based on card width + gap

    if (container) {
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full max-w-5xl my-12 relative">
      <h2 className="text-2xl font-semibold mb-4 text-center text-[#0D2344]">
        Flashcards
      </h2>

      {/* Scroll Buttons */}
      <button
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full shadow p-2 z-10"
        onClick={() => scroll("left")}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full shadow p-2 z-10"
        onClick={() => scroll("right")}
      >
        <ChevronRight size={24} />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-6 px-10 py-4 scrollbar-hide scroll-smooth"
      >
        {flashcards.map((card, index) => (
          <div key={index} className="flex-shrink-0 w-80">
            <Flashcard question={card.question} answer={card.answer} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardList;
