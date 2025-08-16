"use client";
import { useEffect, useState } from "react";

export default function QuizTimer({ endTime, onExpire }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const id = setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, Math.floor((end - now) / 1000));
      setRemaining(delta);
      if (delta === 0) { clearInterval(id); onExpire?.(); }
    }, 250);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  return <div className="font-mono text-sm">Time left: {mm}:{ss}</div>;
}
