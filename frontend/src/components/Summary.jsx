function Summary({ summary }) {
  if (!summary) return null;

  const paragraphs = summary
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-4 text-2xl font-bold text-[#0D2344]">Overview</h3>

      <div className="space-y-4 text-slate-700">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="leading-8">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export default Summary;
