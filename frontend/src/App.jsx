import { useState } from 'react'

function App() {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted URL:", url);
    // We'll connect this to the backend later
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
    </div>
  );
}

export default App;
