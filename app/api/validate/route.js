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

    // Check for quiz pools
    const { data: pools } = await supabaseAdmin
      .from("quiz_pools")
      .select("id, topic_id, difficulty, draw_count")
      .eq("quiz_id", quizId);

    let attemptItems = [];

    if (!pools || pools.length === 0) {
      // No pools - use static questions (legacy behavior)
      const { data: questions } = await supabaseAdmin
        .from("questions")
        .select("id, prompt, options, correct_index, points")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true });

      const qs = questions || [];
      
      // Create attempt_items snapshots for static questions
      for (const q of qs) {
        attemptItems.push({
          attempt_id: attemptRow.id,
          source: 'static',
          question_id: q.id,
          bank_id: null,
          prompt: q.prompt,
          options: q.options,
          correct_index: q.correct_index,
          points: q.points || 1
        });
      }
    } else {
      // Pools exist - sample from question bank
      for (const pool of pools) {
        const { data: bankItems } = await supabaseAdmin
          .from("question_bank")
          .select("id, prompt, options, correct_index, teks_code")
          .eq("topic_id", pool.topic_id)
          .eq("difficulty", pool.difficulty);

        if (bankItems && bankItems.length > 0) {
          // Randomly sample items
          const shuffled = bankItems.sort(() => Math.random() - 0.5);
          const sampled = shuffled.slice(0, Math.min(pool.draw_count, bankItems.length));

          for (const item of sampled) {
            attemptItems.push({
              attempt_id: attemptRow.id,
              source: 'bank',
              question_id: null,
              bank_id: item.id,
              prompt: item.prompt,
              options: item.options,
              correct_index: item.correct_index,
              points: 1
            });
          }
        }
      }
    }

    // Insert attempt_items snapshots
    if (attemptItems.length > 0) {
      const { data: insertedItems, error: itemsError } = await supabaseAdmin
        .from("attempt_items")
        .insert(attemptItems)
        .select("id, prompt, options, points");
      if (itemsError) throw itemsError;
      attemptItems = insertedItems;
    }

    // Shuffle final order
    attemptItems.sort(() => Math.random() - 0.5);

    // Build masked response using attempt_items
    const masked = attemptItems.map((item) => ({
      item_id: item.id,
      prompt: item.prompt,
      options: item.options,
      points: item.points
    }));

    return Response.json({ attempt: attemptRow, quiz, questions: masked });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}
