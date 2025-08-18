"use client";
import { useState } from "react";

export default function DemoLauncher() {
  const [quizId, setQuizId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startPublicDemo() {
    if (loading) return;
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/demo-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Demo not available");
      }
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No demo URL received");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function launchWithId() {
    if (!quizId.trim() || !token.trim()) {
      setError("Please enter both Quiz ID and Token");
      return;
    }
    setError("");
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
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
      
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {loading ? "Starting..." : "Start public demo"}
        </button>
      </div>
    </div>
  );
}