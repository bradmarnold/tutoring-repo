"use client";
export default function QuestionCard({ q, index, value, onChange }) {
  const opts = Array.isArray(q.options) ? q.options : q.options?.options || [];
  return (
    <div className="border rounded-xl p-4 space-y-3">
      <p className="font-medium">{index + 1}. {q.prompt}</p>
      <div className="space-y-2">
        {opts.map((opt, i) => (
          <label key={i} className="flex items-center gap-2">
            <input type="radio" name={`q-${q.id}`} checked={value === i} onChange={() => onChange(i)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
