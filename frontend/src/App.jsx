import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [modules, setModules] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log("Backend response:", data);
      alert("URL received by backend!");

      setTranscript(data.transcript || "No transcript found.");
      setSummary(data.summary || "No summary generated.");
      const flashcardMatches =
        (data.summary || "").match(/Q:.*?\nA:.*?(?=\nQ:|\n\n|$)/gs) || [];
      const parsedCards = flashcardMatches.map((entry) => {
        const qMatch = entry.match(/Q:\s*(.*)/);
        const aMatch = entry.match(/A:\s*(.*)/);
        return {
          question: qMatch ? qMatch[1].trim() : "Unknown question",
          answer: aMatch ? aMatch[1].trim() : "No answer provided",
        };
      });
      setFlashcards(parsedCards);
      const parsed = data.summary
        .split(/Module\s+\d+:/i)
        .slice(1)
        .map((block) => {
          const titleMatch = block.match(/^(.*)/)?.[0]?.trim();
          const objectiveMatch = block
            .match(/Learning Objective: (.*)/i)?.[1]
            ?.trim();
          const descriptionMatch = block
            .match(/Description: (.*)/i)?.[1]
            ?.trim();

          return {
            title: titleMatch || "Untitled Module",
            objective: objectiveMatch || "No objective found",
            description: descriptionMatch || "No description found",
          };
        });

      setModules(parsed);
    } catch (error) {
      console.error("Error sending to backend:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">SkillMate</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <label className="block mb-2 text-lg font-medium text-gray-700">
          Paste a YouTube Link
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
        />

        <button
          type="submit"
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Generate Course
        </button>
      </form>
      {summary && (
        <div className="mt-10 w-full max-w-2xl bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            Course Summary
          </h2>
          <pre className="whitespace-pre-wrap text-gray-800">{summary}</pre>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
        {flashcards.slice(0, 4).map((card, idx) => {
          const isFlipped = flippedIndex === idx;

          return (
            <div
              key={idx}
              className="perspective cursor-pointer"
              onClick={() => setFlippedIndex(isFlipped ? null : idx)}
            >
              <div
                className={`relative w-60 h-70 transition-transform duration-500 transform-style preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white border border-gray-300 rounded-xl p-4 shadow-md flex items-center justify-center text-center">
                  <p className="text-gray-800 font-medium">
                    Q: {card.question}
                  </p>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden bg-blue-50 border border-gray-300 rounded-xl p-4 shadow-md rotate-y-180 flex items-center justify-center text-center">
                  <p className="text-gray-700">A: {card.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modules.length > 0 && (
        <div className="mt-10 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Modules</h2>
          <div className="space-y-6">
            {modules.map((mod, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-blue-600">
                  Module {idx + 1}: {mod.title}
                </h3>
                <p className="mt-2 text-gray-700">
                  <strong>Objective:</strong> {mod.objective}
                </p>
                <p className="mt-1 text-gray-600">
                  <strong>Description:</strong> {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {transcript && (
        <div className="mt-6 w-full max-w-2xl bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-3 text-gray-600">
            Transcript Preview
          </h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-600">
            {transcript}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
