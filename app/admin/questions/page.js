"use client";
import { useState } from "react";

export default function Questions(){
  const [course, setCourse] = useState("Calc I");
  const [unit, setUnit] = useState("");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["","","",""]);
  const [correct, setCorrect] = useState(0);

  async function save(){
    const r = await fetch("/api/admin/add-bank-question", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ course, unit, prompt, options, correct_index: correct, points:1 })
    });
    if (r.ok) alert("Saved");
  }

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Question bank</h1>
      <div className="border rounded-xl p-4 space-y-3">
        <select className="border rounded p-2" value={course} onChange={e=>setCourse(e.target.value)}>
          {["Calc I","Calc II","Calc III","Physics I","Physics II"].map(c=> <option key={c}>{c}</option>)}
        </select>
        <input className="border rounded p-2 w-full" placeholder="Unit (eg Derivatives)" value={unit} onChange={e=>setUnit(e.target.value)} />
        <textarea className="border rounded p-2 w-full h-28" placeholder="Prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} />
        {options.map((o,i)=> (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" name="correct" checked={correct===i} onChange={()=>setCorrect(i)} />
            <input className="border rounded p-2 w-full" placeholder={`Option ${i+1}`} value={o} onChange={e=>setOptions(prev=> prev.map((x,j)=> j===i? e.target.value : x))} />
          </div>
        ))}
        <button className="bg-black text-white rounded p-2" onClick={save}>Save to bank</button>
      </div>
    </main>
  );
}
