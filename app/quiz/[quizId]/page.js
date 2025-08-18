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
  const [submitting, setSubmitting] = useState(false);
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

  // Warn on navigation mid-quiz
  useEffect(() => {
    if (!attempt || result) return;
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You have an active quiz. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [attempt, result]);

  const endTime = useMemo(() => attempt?.ends_at, [attempt]);

  // Count unanswered questions
  const unansweredCount = useMemo(() => {
    if (!questions.length) return 0;
    return questions.filter((q, idx) => {
      const qKey = q.attempt_item_id ?? q.item_id ?? q.id ?? idx;
      return answers[qKey] === undefined;
    }).length;
  }, [questions, answers]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading quiz...</span>
    </div>
  );
  
  if (err) return <p className="text-red-600">{err}</p>;
  
  if (result) {
    return (
      <div className="space-y-6">
        <div className="text-center bg-gray-50 rounded-xl p-6">
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <div className="text-xl">
            Score: <span className="font-semibold">{result.score} / {result.totalPoints}</span>
            <span className="text-gray-600 ml-2">
              ({Math.round((result.score / result.totalPoints) * 100)}%)
            </span>
          </div>
        </div>
        
        {result.details?.some(d => !d.is_correct) && (
          <div className="text-center">
            <a href="#explanations" className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              View Explanations ↓
            </a>
          </div>
        )}

        <div id="explanations" className="space-y-4">
          {result.details.map((d, i) => (
            <div key={i} className={`border rounded-xl p-4 ${d.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <p className="font-medium">{i + 1}. {d.prompt}</p>
              <p className="text-sm text-slate-700 mt-1">
                Your answer: {d.selectedText} {d.is_correct ? "✓" : "✗"}
              </p>
              {!d.is_correct && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium text-blue-600">Show Explanation</summary>
                  <p className="mt-2 whitespace-pre-wrap text-gray-700">{d.explanation}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, answers })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Submit failed");
      }
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
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
      
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {unansweredCount > 0 && (
              <span className="text-orange-600 font-medium">
                {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}
              </span>
            )}
            {unansweredCount === 0 && (
              <span className="text-green-600 font-medium">All questions answered</span>
            )}
          </div>
          
          <button 
            onClick={submit} 
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>
    </main>
  );
}
