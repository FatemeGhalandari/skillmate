import { useState } from "react";
import FlashcardList from "./components/FlashcardList";
import Summary from "./components/Summary";
import Transcript from "./components/Transcript";

function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [modules, setModules] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setTranscript("");
    setSummary("");
    setModules([]);
    setFlashcards([]);

    try {
      const response = await fetch(
        "https://skillmate-backend.onrender.com/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Backend request failed.");
      }

      const transcriptText = data.transcript || "";
      const fullSummary = data.summary || "";

      const flashcardSection =
        fullSummary.split("Flashcards:")[1]?.trim() || "";
      const summaryOnly = fullSummary.split("Flashcards:")[0].trim();

      const moduleBlocks = fullSummary.split(/Module\s+\d+:/i).slice(1);
      const parsedModules = moduleBlocks.map((block) => {
        const title = block.match(/^(.*)/)?.[1]?.trim() || "Untitled Module";
        const objective =
          block.match(/Learning Objective:\s*(.*)/i)?.[1]?.trim() ||
          "No objective found.";
        const description =
          block.match(/Description:\s*(.*)/i)?.[1]?.trim() ||
          "No description found.";
        return { title, objective, description };
      });

      const flashcardMatches =
        flashcardSection.match(
          /\d+\.\s*Q:\s*.*?\n\s*A:\s*.*?(?=\n\d+\.|$)/gs,
        ) || [];

      const parsedCards = flashcardMatches.map((entry) => {
        const question = entry.match(/Q:\s*(.*)/)?.[1]?.trim() || "";
        const answer = entry.match(/A:\s*(.*)/)?.[1]?.trim() || "";
        return { question, answer };
      });

      setTranscript(transcriptText);
      setModules(parsedModules);
      setSummary(summaryOnly);
      setFlashcards(parsedCards);
    } catch (err) {
      console.error("Error sending to backend:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-[#0D2344] text-white font-semibold py-3 rounded-lg"
        >
          {loading ? "Generating..." : "Generate Course"}
        </button>
      </form>

      {error && (
        <div className="mt-6 w-full max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {flashcards.length > 0 && <FlashcardList flashcards={flashcards} />}
      {summary && <Summary summary={summary} />}
      {transcript && <Transcript transcript={transcript} />}
    </div>
  );
}

export default App;
