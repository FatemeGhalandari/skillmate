export default function Summary({ summary }) {
  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2 text-[#0D2344]">Summary</h2>
      <p className="text-gray-700 bg-white p-4 rounded shadow-sm whitespace-pre-wrap">
        {summary}
      </p>
    </div>
  );
}
