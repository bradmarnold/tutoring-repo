"use client";
import { useState, useEffect } from "react";

export default function AdminHome() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quiz creation
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState(900);
  const [createdQuizId, setCreatedQuizId] = useState("");

  // Question adding
  const [questionQuizId, setQuestionQuizId] = useState("");
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [questionOptions, setQuestionOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [questionPoints, setQuestionPoints] = useState(1);
  const [teksCode, setTeksCode] = useState("");

  // Link minting
  const [linkQuizId, setLinkQuizId] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [linkDays, setLinkDays] = useState(7);
  const [mintedLink, setMintedLink] = useState("");

  // Recent attempts
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    const storedKey = sessionStorage.getItem("adminKey");
    if (storedKey) {
      setAdminKey(storedKey);
      setAuthenticated(true);
    }
  }, []);

  function saveAdminKey() {
    if (adminKey.trim()) {
      sessionStorage.setItem("adminKey", adminKey.trim());
      setAuthenticated(true);
    }
  }

  async function createQuiz() {
    if (!quizTitle.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          title: quizTitle,
          duration_seconds: quizDuration
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedQuizId(data.id);
        setQuizTitle("");
        alert(`Quiz created with ID: ${data.id}`);
      } else {
        alert("Failed to create quiz");
      }
    } catch (error) {
      alert("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  }

  async function addQuestion() {
    if (!questionQuizId.trim() || !questionPrompt.trim()) {
      alert("Please enter quiz ID and question prompt");
      return;
    }

    const validOptions = questionOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/question/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          quiz_id: questionQuizId,
          prompt: questionPrompt,
          options: validOptions,
          correct_index: correctIndex,
          points: questionPoints,
          teks_code: teksCode.trim() || null
        })
      });

      if (response.ok) {
        setQuestionPrompt("");
        setQuestionOptions(["", "", "", ""]);
        setCorrectIndex(0);
        setTeksCode("");
        alert("Question added successfully");
      } else {
        alert("Failed to add question");
      }
    } catch (error) {
      alert("Failed to add question");
    } finally {
      setLoading(false);
    }
  }

  async function mintLink() {
    if (!linkQuizId.trim() || !studentEmail.trim()) {
      alert("Please enter quiz ID and student email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/link/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          quiz_id: linkQuizId,
          student_email: studentEmail,
          max_attempts: maxAttempts,
          days: linkDays
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMintedLink(data.url);
        alert("Link minted successfully!");
      } else {
        alert("Failed to mint link");
      }
    } catch (error) {
      alert("Failed to mint link");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(mintedLink);
    alert("Link copied to clipboard!");
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-16 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Admin Access</h1>
        <div className="border rounded-2xl p-6 space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            onKeyPress={(e) => e.key === "Enter" && saveAdminKey()}
          />
          <button
            onClick={saveAdminKey}
            className="w-full px-4 py-2 bg-black text-white rounded-xl hover:bg-slate-800"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("adminKey");
            setAuthenticated(false);
            setAdminKey("");
          }}
          className="px-4 py-2 text-sm border rounded-xl hover:bg-slate-50"
        >
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 text-sm">
        <a 
          href="/admin"
          className="px-4 py-2 border rounded-xl hover:bg-slate-50 bg-slate-100"
        >
          Dashboard
        </a>
        <a 
          href="/admin/ai"
          className="px-4 py-2 border rounded-xl hover:bg-slate-50"
        >
          AI Generator
        </a>
        <a 
          href="/admin/pools"
          className="px-4 py-2 border rounded-xl hover:bg-slate-50"
        >
          Quiz Pools
        </a>
        <a 
          href="/admin/analytics"
          className="px-4 py-2 border rounded-xl hover:bg-slate-50"
        >
          Analytics
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Quiz */}
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Create Quiz</h2>
          <input
            placeholder="Quiz title"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Duration (seconds)"
              value={quizDuration}
              onChange={(e) => setQuizDuration(Number(e.target.value))}
              className="border rounded-xl px-3 py-2"
            />
            <button
              onClick={createQuiz}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
          {createdQuizId && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl">
              Created quiz ID: {createdQuizId}
            </div>
          )}
        </div>

        {/* Add Question */}
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Add Question</h2>
          <input
            placeholder="Quiz ID"
            value={questionQuizId}
            onChange={(e) => setQuestionQuizId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
          />
          <textarea
            placeholder="Question prompt"
            value={questionPrompt}
            onChange={(e) => setQuestionPrompt(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 h-24"
          />
          <div className="space-y-2">
            {questionOptions.map((option, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex === i}
                  onChange={() => setCorrectIndex(i)}
                  className="mt-2"
                />
                <input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...questionOptions];
                    newOptions[i] = e.target.value;
                    setQuestionOptions(newOptions);
                  }}
                  className="flex-1 border rounded-xl px-3 py-2"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Points"
              value={questionPoints}
              onChange={(e) => setQuestionPoints(Number(e.target.value))}
              className="border rounded-xl px-3 py-2"
            />
            <input
              placeholder="TEKS code (optional)"
              value={teksCode}
              onChange={(e) => setTeksCode(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
            <button
              onClick={addQuestion}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Mint Link */}
      <div className="border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Mint Student Link</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            placeholder="Quiz ID"
            value={linkQuizId}
            onChange={(e) => setLinkQuizId(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
          <input
            placeholder="Student email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="number"
            placeholder="Max attempts"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="number"
            placeholder="Days valid"
            value={linkDays}
            onChange={(e) => setLinkDays(Number(e.target.value))}
            className="border rounded-xl px-3 py-2"
          />
        </div>
        <button
          onClick={mintLink}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
        >
          Mint Link
        </button>
        {mintedLink && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Generated Link:</div>
            <div className="flex gap-2">
              <input
                value={mintedLink}
                readOnly
                className="flex-1 border rounded-xl px-3 py-2 text-sm bg-slate-50"
              />
              <button
                onClick={copyLink}
                className="px-4 py-2 border rounded-xl hover:bg-slate-50"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4">
        <a
          href="/api/diag"
          target="_blank"
          className="border rounded-xl p-4 text-center hover:bg-slate-50"
        >
          <div className="font-medium">System Diagnostics</div>
          <div className="text-sm text-slate-600">Check database & API status</div>
        </a>
        <a
          href="/admin/analytics"
          className="border rounded-xl p-4 text-center hover:bg-slate-50"
        >
          <div className="font-medium">Analytics</div>
          <div className="text-sm text-slate-600">View performance data</div>
        </a>
        <a
          href="/admin/quizzes"
          className="border rounded-xl p-4 text-center hover:bg-slate-50"
        >
          <div className="font-medium">Quiz Management</div>
          <div className="text-sm text-slate-600">Advanced quiz tools</div>
        </a>
        <a
          href="/"
          className="border rounded-xl p-4 text-center hover:bg-slate-50"
        >
          <div className="font-medium">View Site</div>
          <div className="text-sm text-slate-600">See student experience</div>
        </a>
      </div>
    </div>
  );
}
