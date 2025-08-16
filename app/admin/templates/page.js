"use client";
import { useEffect, useState } from "react";

export default function Templates(){
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("Calc I");
  const [exam, setExam] = useState("Midterm 1");
  const [duration, setDuration] = useState(3600);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const r = await fetch("/api/_templates");
      const data = await r.json();
      setTemplates(data);
    } catch (e) {
      console.error("Failed to load templates:", e);
    }
  }

  async function save(){
    const r = await fetch("/api/admin/add-template", {
      method:"POST", 
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ name, course, exam, duration_seconds: duration })
    });
    if (r.ok) {
      alert("Template saved");
      setName("");
      loadTemplates();
    } else {
      alert("Failed to save template");
    }
  }

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Quiz Templates</h1>
      
      <div className="border rounded-xl p-4 space-y-3">
        <h2 className="font-medium">Create New Template</h2>
        <input 
          className="border rounded p-2 w-full" 
          placeholder="Template name (eg Calc I - Midterm 1)" 
          value={name} 
          onChange={e=>setName(e.target.value)} 
        />
        <div className="grid grid-cols-2 gap-2">
          <select className="border rounded p-2" value={course} onChange={e=>setCourse(e.target.value)}>
            {["Calc I","Calc II","Calc III","Physics I","Physics II"].map(c=> <option key={c}>{c}</option>)}
          </select>
          <select className="border rounded p-2" value={exam} onChange={e=>setExam(e.target.value)}>
            {["Midterm 1","Midterm 2","Final","Quiz","Practice"].map(e=> <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label>Duration (minutes):</label>
          <input 
            className="border rounded p-2" 
            type="number" 
            value={duration / 60} 
            onChange={e=>setDuration(parseInt(e.target.value) * 60)} 
          />
        </div>
        <button className="bg-black text-white rounded p-2" onClick={save}>Create Template</button>
      </div>

      <div className="border rounded-xl p-4">
        <h2 className="font-medium mb-3">Existing Templates</h2>
        {templates.length === 0 ? (
          <p className="text-slate-600">No templates found. Connect a database and run the seed script to add sample templates.</p>
        ) : (
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="border rounded p-3">
                <div className="font-medium">{t.name}</div>
                <div className="text-sm text-slate-600">{t.course} • {t.exam}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}