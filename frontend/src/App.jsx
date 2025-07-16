import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

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
