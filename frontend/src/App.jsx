import { useState } from "react";
import FlashcardList from "./components/FlashcardList";
// import { mockData } from "./mockData";

import Summary from "./components/Summary";
import Transcript from "./components/Transcript";

function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [modules, setModules] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  // const [flippedIndex, setFlippedIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate backend delay
    // setTimeout(() => {
    //   setSummary(mockData.summary);
    //   setTranscript(mockData.transcript);
    //   setFlashcards(mockData.flashcards);
    // }, 300); // optional small delay

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
      // alert("URL received by backend!");

      // 🟩 Extract transcript
      const transcript = data.transcript || "No transcript found.";

      // Store full summary for parsing
      const fullSummary = data.summary || "";
      // 🟢 Step 1: Split full summary into parts
      const flashcardSection =
        fullSummary.split("Flashcards:")[1]?.trim() || "";
      console.log("Flashcard raw section:", flashcardSection);

      const summaryOnly = fullSummary.split("Flashcards:")[0].trim();

      // 🟩 Extract course modules
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

      // 🟢 Step 2: Parse flashcards from only Flashcards section
      const flashcardMatches =
        flashcardSection.match(
          /\d+\.\s*Q:\s*.*?\n\s*A:\s*.*?(?=\n\d+\.|$)/gs
        ) || [];
      const parsedCards = flashcardMatches.map((entry) => {
        const question = entry.match(/Q:\s*(.*)/)?.[1]?.trim() || "";
        const answer = entry.match(/A:\s*(.*)/)?.[1]?.trim() || "";
        return { question, answer };
      });

      // ✅ Now set states in order
      setTranscript(transcript);
      setModules(parsedModules);
      setSummary(summaryOnly);
      setFlashcards(parsedCards);
    } catch (error) {
      console.error("Error sending to backend:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <img src="/logo2.png" alt="SkillMate Logo" className="mb-2 h-10 w-14" />
        <h1 className="text-4xl font-bold text-[#0D2344] mb-6 ">SkillMate</h1>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <label className="block mb-2 text-lg font-medium text-gray-700 ">
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
          className="mt-4 w-full bg-[#0D2344] text-white font-semibold py-3 rounded-lg hover:bg-[#153a73] transition"
        >
          Generate Course
        </button>
      </form>

      {flashcards.length > 0 && <FlashcardList flashcards={flashcards} />}
      {summary && <Summary summary={summary} />}
      {transcript && <Transcript transcript={transcript} />}
    </div>
  );
}

export default App;
