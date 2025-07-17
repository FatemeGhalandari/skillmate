import { useState } from "react";

const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="w-60 h-72 bg-[#0D2344] text-white rounded-2xl shadow-xl cursor-pointer transform transition-transform duration-500 hover:scale-105 perspective"
    >
      <div
        className={`relative w-full h-full text-center p-6 flex items-center justify-center text-lg font-medium transition-transform duration-500 ${
          flipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className={`absolute w-full h-full backface-hidden flex items-center justify-center px-4 ${
            flipped ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="break-words leading-tight text-white">{question}</p>
        </div>

        <div
          className={`absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center px-4 ${
            flipped ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="break-words leading-tight text-white">{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
