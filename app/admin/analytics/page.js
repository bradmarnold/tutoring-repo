"use client";
import { useEffect, useState } from "react";

export default function Analytics(){
  const [course, setCourse] = useState("");
  const [rows, setRows] = useState([]);
  async function load(){
    const r = await fetch("/api/admin/analytics", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ course: course || null })
    });
    const j = await r.json(); setRows(j.topics || []);
  }
  useEffect(()=>{ load(); },[]);
  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <div className="flex gap-2 items-center">
        <select className="border rounded p-2" value={course} onChange={e=>setCourse(e.target.value)}>
          <option value="">All courses</option>
          {["Calc I","Calc II","Calc III","Physics I","Physics II"].map(c=> <option key={c}>{c}</option>)}
        </select>
        <button className="border rounded p-2" onClick={load}>Refresh</button>
      </div>
      <div className="border rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr><th className="text-left p-2">Topic</th><th className="text-left p-2">Attempts</th><th className="text-left p-2">Correct</th><th className="text-left p-2">Accuracy %</th></tr>
          </thead>
          <tbody>
            {rows.map((r,i)=> (
              <tr key={i} className="border-t">
                <td className="p-2">{r.topic}</td>
                <td className="p-2">{r.attempts}</td>
                <td className="p-2">{r.correct}</td>
                <td className="p-2">{r.accuracy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
