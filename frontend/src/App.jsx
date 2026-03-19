import { useState } from "react";
import FlashcardList from "./components/FlashcardList";
import Summary from "./components/Summary";
import Transcript from "./components/Transcript";

function cleanText(text = "") {
  return text
    .replace(/\*\*/g, "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractCourseTitle(text = "") {
  const match = cleanText(text).match(/Mini Course:\s*(.*)/i);
  return match?.[1]?.trim() || "Your Mini Course";
}

function extractOverview(text = "") {
  const beforeModules = text.split(/Module\s+\d+:/i)[0] || "";
  return cleanText(beforeModules.replace(/Mini Course:\s*.*/i, ""));
}

function parseModules(text = "") {
  const sections =
    text.match(/Module\s+\d+:\s*[\s\S]*?(?=Module\s+\d+:|Flashcards:|$)/gi) ||
    [];

  return sections.map((section, index) => {
    const cleanedSection = cleanText(section);
    const withoutHeader = cleanedSection
      .replace(/^Module\s+\d+:\s*/i, "")
      .trim();

    const firstLine = withoutHeader.split("\n")[0]?.trim();
    const title = firstLine || `Module ${index + 1}`;

    const objectivesMatch = withoutHeader.match(
      /Learning Objectives?:([\s\S]*?)(?=Description:|$)/i,
    );

    const objectives = objectivesMatch
      ? objectivesMatch[1]
          .split("\n")
          .map((line) => line.replace(/^[-•]\s*/, "").trim())
          .filter(Boolean)
      : [];

    const descriptionMatch = withoutHeader.match(/Description:\s*([\s\S]*)/i);

    const description = descriptionMatch
      ? cleanText(descriptionMatch[1]).replace(/\n+/g, " ")
      : "No description found.";

    return {
      title: cleanText(title),
      objectives,
      description,
    };
  });
}

function parseFlashcards(text = "") {
  const flashcardSection = text.split(/Flashcards:/i)[1]?.trim() || "";

  const matches =
    flashcardSection.match(/\d+\.\s*Q:\s*.*?\n\s*A:\s*.*?(?=\n\d+\.|$)/gis) ||
    [];

  return matches
    .map((entry) => {
      const question = cleanText(entry.match(/Q:\s*(.*)/i)?.[1] || "");
      const answer = cleanText(entry.match(/A:\s*([\s\S]*)/i)?.[1] || "");

      return { question, answer };
    })
    .filter((card) => card.question && card.answer);
}

function App() {
  const [url, setUrl] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [overview, setOverview] = useState("");
  const [transcript, setTranscript] = useState("");
  const [modules, setModules] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Local:
  const BACKEND_URL = "http://127.0.0.1:8000/generate";

  // Hosted:
  // const BACKEND_URL = "https://skillmate-backend.onrender.com/generate";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setCourseTitle("");
    setOverview("");
    setTranscript("");
    setModules([]);
    setFlashcards([]);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (!response.ok || data.error) {
        throw new Error(data.error || "Backend request failed.");
      }

      const fullSummary = data.summary || "";
      const parsedModules = parseModules(fullSummary);
      const parsedFlashcards = parseFlashcards(fullSummary);

      setCourseTitle(extractCourseTitle(fullSummary));
      setOverview(extractOverview(fullSummary));
      setTranscript(cleanText(data.transcript || ""));
      setModules(parsedModules);
      setFlashcards(parsedFlashcards);
    } catch (err) {
      console.error("Error sending to backend:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6 md:p-10">
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo2.png"
              alt="SkillMate Logo"
              className="mb-3 h-14 w-auto"
            />
            <h1 className="text-4xl font-bold text-[#0D2344]">SkillMate</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Turn any YouTube video into a mini course with modules,
              flashcards, and a transcript.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-2xl">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Paste a YouTube link
            </label>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-sm outline-none focus:border-[#0D2344] focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#0D2344] px-6 py-3 font-semibold text-white transition hover:bg-[#153a73] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Course"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
              {error}
            </div>
          )}
        </div>

        {(courseTitle ||
          modules.length > 0 ||
          flashcards.length > 0 ||
          transcript) && (
          <div className="mt-10 space-y-8">
            {courseTitle && (
              <div className="rounded-3xl bg-[#0D2344] px-6 py-7 text-white shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
                  Generated course
                </p>
                <h2 className="mt-2 text-3xl font-bold">{courseTitle}</h2>
              </div>
            )}

            {modules.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#0D2344]">Modules</h3>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                    {modules.length} modules
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {modules.map((module, index) => (
                    <div
                      key={index}
                      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-[#0D2344]">
                          {index + 1}
                        </div>
                        <h4 className="text-xl font-semibold text-slate-900">
                          {module.title}
                        </h4>
                      </div>

                      {module.objectives.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Learning objectives
                          </p>
                          <ul className="space-y-2 text-slate-700">
                            {module.objectives.map((objective, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="mt-2 h-2 w-2 rounded-full bg-[#0D2344]" />
                                <span>{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                          Description
                        </p>
                        <p className="leading-7 text-slate-700">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {flashcards.length > 0 && <FlashcardList flashcards={flashcards} />}

            {overview && <Summary summary={overview} />}

            {transcript && <Transcript transcript={transcript} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
