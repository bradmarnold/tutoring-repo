"use client";

import { useState, useEffect } from "react";

export default function AiGeneratorPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [course, setCourse] = useState("calc1");
  const [unit, setUnit] = useState("derivatives");
  const [topicSlug, setTopicSlug] = useState("calc1-derivatives");
  const [difficulty, setDifficulty] = useState("med");
  const [numItems, setNumItems] = useState(5);
  const [teksCodesList, setTeksCodesList] = useState("");
  const [style, setStyle] = useState("concept");
  
  // Generated items state
  const [generatedItems, setGeneratedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());

  useEffect(() => {
    const storedPw = sessionStorage.getItem("adminKey");
    if (storedPw) {
      setAdminPw(storedPw);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Auto-generate topic slug from course and unit
    setTopicSlug(`${course}-${unit}`);
  }, [course, unit]);

  function saveAdminKey() {
    if (adminPw.trim()) {
      sessionStorage.setItem("adminKey", adminPw.trim());
      setAuthenticated(true);
    }
  }

  async function generateItems() {
    if (!course || !unit || !numItems) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const teksCodes = teksCodesList
        .split(",")
        .map(code => code.trim())
        .filter(code => code.length > 0);

      const response = await fetch("/api/admin/ai/generate-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPw
        },
        body: JSON.stringify({
          course,
          unit,
          topic_slug: topicSlug,
          teks_codes: teksCodes.length > 0 ? teksCodes : undefined,
          difficulty,
          n: numItems,
          style
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedItems(data.items);
        setSelectedItems(new Set(data.items.map((_, i) => i)));
      } else {
        const error = await response.text();
        alert(`Failed to generate items: ${error}`);
      }
    } catch (error) {
      alert("Failed to generate items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSelectedItems() {
    const selected = generatedItems.filter((_, i) => selectedItems.has(i));
    if (selected.length === 0) {
      alert("Please select at least one item to save");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai/save-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminPw
        },
        body: JSON.stringify({
          topic_slug: topicSlug,
          items: selected
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully saved ${data.saved} items to the question bank!`);
        setGeneratedItems([]);
        setSelectedItems(new Set());
      } else {
        const error = await response.text();
        alert(`Failed to save items: ${error}`);
      }
    } catch (error) {
      alert("Failed to save items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function updateItem(index, field, value) {
    const updated = [...generatedItems];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedItems(updated);
  }

  function updateOption(itemIndex, optionIndex, value) {
    const updated = [...generatedItems];
    const newOptions = [...updated[itemIndex].options];
    newOptions[optionIndex] = value;
    updated[itemIndex] = { ...updated[itemIndex], options: newOptions };
    setGeneratedItems(updated);
  }

  function toggleItemSelection(index) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
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
        <h1 className="text-3xl font-bold text-slate-900">AI Question Generator</h1>
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

      {/* Navigation */}
      <div className="flex gap-4 text-sm">
        <a 
          href="/admin"
          className="px-4 py-2 border rounded-xl hover:bg-slate-50"
        >
          Dashboard
        </a>
        <a 
          href="/admin/ai"
          className="px-4 py-2 border rounded-xl hover:bg-slate-50 bg-slate-100"
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

      {/* Generation Form */}
      <div className="border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Generate Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="calc1">Calculus I</option>
              <option value="calc2">Calculus II</option>
              <option value="calc3">Calculus III</option>
              <option value="phys1">Physics I</option>
              <option value="phys2">Physics II</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="e.g., derivatives, kinematics"
            />
          </div>

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
            <label className="block text-sm font-medium mb-1">Number of Items (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={numItems}
              onChange={(e) => setNumItems(parseInt(e.target.value))}
              className="w-full border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="concept">Concept</option>
              <option value="calculation">Calculation</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">TEKS Codes (optional, comma-separated)</label>
          <input
            type="text"
            value={teksCodesList}
            onChange={(e) => setTeksCodesList(e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="e.g., A.1, A.2, B.3"
          />
        </div>

        <button
          onClick={generateItems}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Items"}
        </button>
      </div>

      {/* Generated Items */}
      {generatedItems.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generated Items ({generatedItems.length})</h2>
            <button
              onClick={saveSelectedItems}
              disabled={loading || selectedItems.size === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              Save Selected ({selectedItems.size})
            </button>
          </div>

          <div className="space-y-4">
            {generatedItems.map((item, index) => (
              <ItemCard
                key={index}
                item={item}
                index={index}
                selected={selectedItems.has(index)}
                onToggleSelect={() => toggleItemSelection(index)}
                onUpdateItem={updateItem}
                onUpdateOption={updateOption}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, index, selected, onToggleSelect, onUpdateItem, onUpdateOption }) {
  return (
    <div className={`border rounded-xl p-4 ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1"
        />
        
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Prompt</label>
            <textarea
              value={item.prompt}
              onChange={(e) => onUpdateItem(index, "prompt", e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {item.options.map((option, optIndex) => (
              <div key={optIndex}>
                <label className="block text-sm font-medium mb-1">
                  Option {String.fromCharCode(65 + optIndex)}
                  {item.correct_index === optIndex && " ✓"}
                </label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onUpdateOption(index, optIndex, e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${
                    item.correct_index === optIndex ? "border-green-500 bg-green-50" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Correct Index</label>
              <select
                value={item.correct_index}
                onChange={(e) => onUpdateItem(index, "correct_index", parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
              >
                {item.options.map((_, i) => (
                  <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">TEKS Code</label>
              <input
                type="text"
                value={item.teks_code || ""}
                onChange={(e) => onUpdateItem(index, "teks_code", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={item.difficulty || "med"}
                onChange={(e) => onUpdateItem(index, "difficulty", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="easy">Easy</option>
                <option value="med">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}