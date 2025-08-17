"use client";
import { useState } from "react";

export default function DemoLauncher() {
  const [quizId, setQuizId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function startPublicDemo() {
    setLoading(true);
    try {
      const response = await fetch("/api/demo-link");
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert("Demo not available right now. Try again later.");
      }
    } catch (error) {
      alert("Demo not available right now. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  function launchWithId() {
    if (!quizId.trim() || !token.trim()) {
      alert("Please enter both Quiz ID and Token");
      return;
    }
    window.location.href = `/quiz/${quizId.trim()}?token=${token.trim()}`;
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Quiz ID"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border rounded-xl px-3 py-2 text-sm"
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={launchWithId}
          className="px-4 py-2 border rounded-xl text-sm hover:bg-slate-50"
        >
          Launch with ID
        </button>
        <button
          onClick={startPublicDemo}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Starting..." : "Start public demo"}
        </button>
      </div>
    </div>
  );
}