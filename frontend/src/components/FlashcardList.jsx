import { useState } from "react";

function FlashcardList({ flashcards }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!flashcards.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-[#0D2344]">Flashcards</h3>
        <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
          Click to reveal
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {flashcards.map((card, index) => {
          const isOpen = openIndex === index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="rounded-3xl bg-[#0D2344] p-6 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                Card {index + 1}
              </p>

              <p className="text-xl font-semibold leading-8">{card.question}</p>

              {isOpen && (
                <div className="mt-5 border-t border-blue-900 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                    Answer
                  </p>
                  <p className="leading-7 text-blue-50">{card.answer}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default FlashcardList;
