"use client";
import { useEffect, useState } from "react";

export default function Quizzes(){
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [emails, setEmails] = useState("");
  const [links, setLinks] = useState([]);

  useEffect(()=>{ fetch("/api/_templates").then(r=>r.json()).then(setTemplates); },[]);

  async function generate(){
    const r = await fetch("/api/admin/generate-quiz", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ templateId, title }) });
    const j = await r.json(); setQuizId(j.quizId);
  }
  async function mint(){
    const list = emails.split(/\s|,|;/).map(e=>e.trim()).filter(Boolean);
    const r = await fetch("/api/admin/mint-links", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ quizId, emails: list, days: 14, attempts: 1 }) });
    const j = await r.json(); setLinks(j.links);
  }
  async function send(){
    await fetch("/api/admin/send-links", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ quizId, links }) });
    alert("Sent");
  }

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Generate quizzes</h1>
      <div className="border rounded-xl p-4 space-y-3">
        <select className="border rounded p-2" value={templateId} onChange={e=>setTemplateId(e.target.value)}>
          <option value="">Select template</option>
          {templates.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input className="border rounded p-2 w-full" placeholder="Quiz title (eg Calc I MT1 A)" value={title} onChange={e=>setTitle(e.target.value)} />
        <button className="bg-black text-white rounded p-2" onClick={generate}>Create quiz</button>
        {quizId && <p className="text-sm text-slate-600">Quiz created: {quizId}</p>}
      </div>

      <div className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Mint and send links</h2>
        <textarea className="w-full border rounded p-2 h-28" placeholder="student1@uta.edu, student2@uta.edu" value={emails} onChange={e=>setEmails(e.target.value)} />
        <div className="flex gap-2">
          <button className="rounded p-2 border" onClick={mint}>Mint links</button>
          <button className="rounded p-2 border" onClick={send}>Send emails</button>
        </div>
        {links.length>0 && (
          <div className="text-sm text-slate-700">
            <p>Minted:</p>
            <ul className="list-disc ml-5">
              {links.map((l,i)=> <li key={i}>{l.student_email}</li>)}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
