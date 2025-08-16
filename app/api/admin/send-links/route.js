import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMagicLink } from "@/lib/mailer";

export async function POST(req){
  const { quizId, links } = await req.json();
  if (!quizId || !Array.isArray(links)) return new Response("Bad request", { status: 400 });

  const { data: quiz } = await supabaseAdmin.from("quizzes").select("id,title").eq("id", quizId).single();
  const base = process.env.SITE_URL || "";
  const results = [];
  for (const { student_email, token } of links){
    const url = `${base}/quiz/${quizId}?token=${token}`;
    const r = await sendMagicLink(student_email, url, quiz.title);
    await supabaseAdmin.from("email_logs").insert({
      to_email: student_email, quiz_id: quizId, token,
      status: r?.error ? "error" : "sent",
      provider_id: r?.data?.id || null
    });
    results.push({ to: student_email, ok: !r?.error });
  }
  return Response.json({ results });
}
