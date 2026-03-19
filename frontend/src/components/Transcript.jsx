import { useState } from "react";

function Transcript({ transcript }) {
  const [expanded, setExpanded] = useState(false);

  if (!transcript) return null;

  const preview =
    transcript.length > 900 ? `${transcript.slice(0, 900)}...` : transcript;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-[#0D2344]">Transcript</h3>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {expanded ? "Show less" : "Show full transcript"}
        </button>
      </div>

      <p className="whitespace-pre-wrap leading-8 text-slate-700">
        {expanded ? transcript : preview}
      </p>
    </section>
  );
}

export default Transcript;
