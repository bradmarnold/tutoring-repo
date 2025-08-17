"use client";

import { useState, useEffect } from "react";

export default function PoolsManagementPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Quiz selection
  const [quizId, setQuizId] = useState("");
  const [pools, setPools] = useState([]);
  
  // Add pool form
  const [topicSlug, setTopicSlug] = useState("");
  const [difficulty, setDifficulty] = useState("med");
  const [drawCount, setDrawCount] = useState(5);

  useEffect(() => {
    const storedPw = sessionStorage.getItem("adminKey");
    if (storedPw) {
      setAdminPw(storedPw);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (quizId && authenticated) {
      loadPools();
    }
  }, [quizId, authenticated]);

  function saveAdminKey() {
    if (adminPw.trim()) {
      sessionStorage.setItem("adminKey", adminPw.trim());
      setAuthenticated(true);
    }
  }

  async function loadPools() {
    if (!quizId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pools/list?quiz_id=${quizId}`, {
        headers: {
          "x-admin-key": adminPw
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPools(data.pools || []);
      } else {
        const error = await response.text();
        alert(`Failed to load pools: ${error}`);
      }
    } catch (error) {
      alert("Failed to load pools");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function addPool() {
    if (!quizId || !topicSlug || !drawCount) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/pools/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPw
        },
        body: JSON.stringify({
          quiz_id: quizId,
          topic_slug: topicSlug,
          difficulty,
          draw_count: drawCount
        })
      });

      if (response.ok) {
        alert("Pool added successfully!");
        setTopicSlug("");
        setDifficulty("med");
        setDrawCount(5);
        await loadPools();
      } else {
        const error = await response.text();
        alert(`Failed to add pool: ${error}`);
      }
    } catch (error) {
      alert("Failed to add pool");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePool(poolId) {
    if (!confirm("Are you sure you want to delete this pool?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/pools/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPw
        },
        body: JSON.stringify({
          pool_id: poolId
        })
      });

      if (response.ok) {
        alert("Pool deleted successfully!");
        await loadPools();
      } else {
        const error = await response.text();
        alert(`Failed to delete pool: ${error}`);
      }
    } catch (error) {
      alert("Failed to delete pool");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto mt-16 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Admin Access Required</h1>
        <div className="border rounded-2xl p-6 space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={adminPw}
            onChange={(e) => setAdminPw(e.target.value)}
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
        <h1 className="text-3xl font-bold text-slate-900">Quiz Pools Management</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem("adminKey");
            setAuthenticated(false);
            setAdminPw("");
          }}
          className="px-4 py-2 text-slate-600 hover:text-slate-800"
        >
          Logout
        </button>
      </div>

      {/* Quiz Selection */}
      <div className="border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Select Quiz</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Quiz ID</label>
          <input
            type="text"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Enter quiz ID to manage pools"
          />
        </div>
        {quizId && (
          <button
            onClick={loadPools}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Pools"}
          </button>
        )}
      </div>

      {/* Current Pools */}
      {quizId && (
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Current Pools ({pools.length})</h2>
          
          {pools.length === 0 ? (
            <p className="text-slate-600">No pools configured for this quiz. Add one below.</p>
          ) : (
            <div className="space-y-3">
              {pools.map((pool) => (
                <div key={pool.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{pool.topic_slug}</div>
                    <div className="text-sm text-slate-600">
                      Difficulty: {pool.difficulty} • Draw: {pool.draw_count} questions • Available: {pool.available}
                    </div>
                    {pool.available < pool.draw_count && (
                      <div className="text-sm text-red-600 mt-1">
                        ⚠️ Only {pool.available} questions available, but pool wants to draw {pool.draw_count}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deletePool(pool.id)}
                    disabled={loading}
                    className="px-3 py-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Pool */}
      {quizId && (
        <div className="border rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold">Add New Pool</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic Slug</label>
              <input
                type="text"
                value={topicSlug}
                onChange={(e) => setTopicSlug(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="e.g., calc1-derivatives"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="med">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Draw Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={drawCount}
                onChange={(e) => setDrawCount(parseInt(e.target.value))}
                className="w-full border rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={addPool}
            disabled={loading || !topicSlug || !drawCount}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Pool"}
          </button>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="border rounded-2xl p-6 space-y-4 bg-slate-50">
        <h2 className="text-xl font-semibold">How to Use Pools</h2>
        <div className="space-y-2 text-sm text-slate-700">
          <p><strong>1. Generate Questions:</strong> Use the AI generator to create questions and save them to topic-based question banks.</p>
          <p><strong>2. Create Pools:</strong> Add pools to quizzes specifying which topic/difficulty to draw from and how many questions.</p>
          <p><strong>3. Student Experience:</strong> When students take the quiz, questions are randomly sampled from the pools for each attempt.</p>
          <p><strong>4. Randomization:</strong> Each student gets a different random selection of questions, preventing sharing of specific answers.</p>
        </div>
      </div>
    </div>
  );
}