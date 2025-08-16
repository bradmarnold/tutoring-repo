import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req){
  const { quizId, emails, days=14, attempts=1 } = await req.json();
  if (!quizId || !Array.isArray(emails)) return new Response("Bad request", { status: 400 });
  const rows = emails.map(e => ({
    quiz_id: quizId,
    student_email: e,
    token: cryptoRandom(),
    expires_at: new Date(Date.now()+days*864e5).toISOString(),
    max_attempts: attempts
  }));
  const { data, error } = await supabaseAdmin.from("student_links").insert(rows).select("student_email, token");
  if (error) return new Response("DB error", { status: 500 });
  return Response.json({ links: data });
}

function cryptoRandom(){
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i=0;i<16;i++) bytes[i] = Math.floor(Math.random()*256);
  return Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
}
