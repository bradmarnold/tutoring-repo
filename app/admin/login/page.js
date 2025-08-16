"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  async function submit(e){
    e.preventDefault(); setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ password: p }) });
    if (res.ok) window.location.href = "/admin"; else setErr("Wrong password");
  }
  return (
    <main className="max-w-sm mx-auto mt-24 border rounded-2xl p-6 space-y-4">
      <h1 className="text-lg font-semibold">Admin</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={p} onChange={e=>setP(e.target.value)} />
        <button className="w-full bg-black text-white rounded p-2">Sign in</button>
      </form>
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </main>
  );
}
