export default function Transcript({ transcript }) {
  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h2 className="text-lg font-semibold mb-2 text-[#0D2344]">Transcript</h2>
      <p className="text-gray-700 bg-gray-50 p-4 rounded shadow-sm whitespace-pre-wrap">
        {transcript}
      </p>
    </div>
  );
}
