import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }
  
  try {
    const { quizId, token } = await req.json();
    if (!quizId || !token) return new Response("Bad request", { status: 400 });

    const { data: links, error: linkErr } = await supabaseAdmin
      .from("student_links")
      .select("id, student_email, max_attempts, expires_at, quiz_id, quizzes:quiz_id(duration_seconds, title)")
      .eq("quiz_id", quizId)
      .eq("token", token)
      .limit(1);
    if (linkErr) throw linkErr;
    const link = links?.[0];
    if (!link) return new Response("Invalid link", { status: 403 });
    if (new Date(link.expires_at) < new Date()) return new Response("Expired", { status: 403 });

    const { count } = await supabaseAdmin
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quizId)
      .eq("student_email", link.student_email);
    if (count >= link.max_attempts) return new Response("Attempt limit reached", { status: 403 });

    const endsAt = new Date(Date.now() + 1000 * link.quizzes.duration_seconds).toISOString();
    const { data: attemptRow, error: aErr } = await supabaseAdmin
      .from("attempts")
      .insert({ quiz_id: quizId, student_email: link.student_email, ends_at: endsAt })
      .select("id, ends_at")
      .single();
    if (aErr) throw aErr;

    const { data: quizRows } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, duration_seconds")
      .eq("id", quizId)
      .limit(1);
    const quiz = quizRows?.[0];

    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, prompt, options, correct_index, points")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true })
      .maybeSingle();

    let qs = [];
    if (!questions) {
      const { data: qsAll } = await supabaseAdmin
        .from("questions")
        .select("id, prompt, options, correct_index, points")
        .eq("quiz_id", quizId);
      qs = qsAll || [];
    } else {
      qs = Array.isArray(questions) ? questions : [questions];
    }

    // Shuffle questions order per attempt
    qs.sort(() => Math.random() - 0.5);

    // Mask correct_index before returning 
    const masked = qs.map(({ correct_index, ...rest }) => rest);

    return Response.json({ attempt: attemptRow, quiz, questions: masked });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}
