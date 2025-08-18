"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuizTimer from "@/components/QuizTimer";
import QuestionCard from "@/components/QuestionCard";

export default function QuizPage({ params }) {
  const search = useSearchParams();
  const token = search.get("token");
  const quizId = params.quizId;
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function go() {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId, token })
        });
        if (!res.ok) throw new Error("Invalid or expired link");
        const data = await res.json();
        setAttempt(data.attempt);
        setQuiz(data.quiz);
        setQuestions(data.questions);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    go();
  }, [quizId, token]);

  const endTime = useMemo(() => attempt?.ends_at, [attempt]);

  if (loading) return <p>Loading…</p>;
  if (err) return <p className="text-red-600">{err}</p>;
  if (result) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Score: {result.score} / {result.totalPoints}</h2>
        <div className="space-y-4">
          {result.details.map((d, i) => (
            <div key={i} className="border rounded-xl p-4">
              <p className="font-medium">{i + 1}. {d.prompt}</p>
              <p className="text-sm text-slate-700 mt-1">Your answer: {d.selectedText} {d.correct ? "✓" : "✗"}</p>
              {!d.correct && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Explanation</summary>
                  <p className="mt-2 whitespace-pre-wrap">{d.explanation}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  async function submit() {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId: attempt.id, answers })
    });
    if (!res.ok) { setErr("Submit failed"); return; }
    const data = await res.json();
    setResult(data);
  }

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{quiz.title}</h1>
        {endTime && <QuizTimer endTime={endTime} onExpire={submit} />}
      </header>
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const qKey = q.attempt_item_id ?? q.item_id ?? q.id ?? idx; // Support all formats, consistent with QuestionCard
          return (
            <QuestionCard 
              key={qKey} 
              q={q} 
              index={idx} 
              value={answers[qKey]} 
              onChange={(i) => setAnswers(a => ({ ...a, [qKey]: i }))} 
            />
          );
        })}
      </div>
      <button onClick={submit} className="px-4 py-2 rounded-xl bg-black text-white">Submit</button>
    </main>
  );
}
