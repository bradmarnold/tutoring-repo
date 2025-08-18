import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Normalize difficulty helper: map { medium→med }
function normalizeDifficulty(difficulty) {
  if (difficulty === 'medium') return 'med';
  return difficulty;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function POST(req) {
  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }
  
  try {
    const { quizId, token } = await req.json();
    if (!quizId || !token) return new Response("Bad request", { status: 400 });

    // 1) Verify student_links (token+quizId), check expiry + max attempts
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

    // 2) Create attempt with ends_at = now + quizzes.duration_seconds
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

    // 3) Try pooled sampling
    const { data: pools } = await supabaseAdmin
      .from("quiz_pools")
      .select("id, topic_id, difficulty, draw_count")
      .eq("quiz_id", quizId);

    let attemptItems = [];

    if (pools && pools.length > 0) {
      // Sample from question bank using pools
      for (const pool of pools) {
        const normalizedDifficulty = normalizeDifficulty(pool.difficulty);
        const { data: bankItems } = await supabaseAdmin
          .from("question_bank")
          .select("id, prompt, options, correct_index, teks_code")
          .eq("topic_id", pool.topic_id)
          .eq("difficulty", normalizedDifficulty)
          .order('created_at', { ascending: false }); // Use ORDER BY for stable randomization

        if (bankItems && bankItems.length > 0) {
          // Sample draw_count rows with ORDER BY random()
          const { data: sampledItems } = await supabaseAdmin
            .from("question_bank")
            .select("id, prompt, options, correct_index, teks_code")
            .eq("topic_id", pool.topic_id)
            .eq("difficulty", normalizedDifficulty)
            .order('random()')
            .limit(pool.draw_count);

          for (const item of sampledItems || []) {
            attemptItems.push({
              attempt_id: attemptRow.id,
              source: 'bank',
              question_id: null,
              bank_item_id: item.id,
              prompt: item.prompt,
              options: item.options,
              correct_index: item.correct_index,
              points: 1
            });
          }
        }
      }
    }

    // 4) Else fallback: Load legacy questions
    if (attemptItems.length === 0) {
      const { data: questions } = await supabaseAdmin
        .from("questions")
        .select("id, prompt, options, correct_index, points")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true });

      const qs = questions || [];
      shuffleArray(qs); // Shuffle legacy questions
      
      // Create attempt_items snapshots for static questions
      for (const q of qs) {
        attemptItems.push({
          attempt_id: attemptRow.id,
          source: 'static',
          question_id: q.id,
          bank_item_id: null,
          prompt: q.prompt,
          options: q.options,
          correct_index: q.correct_index,
          points: q.points || 1
        });
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

    // 5) Always shuffle final list (Fisher–Yates)
    shuffleArray(attemptItems);

    // Build masked client payload: [{ attempt_item_id, prompt, options, points }, ...]
    const masked = attemptItems.map((item) => ({
      attempt_item_id: item.id,
      prompt: item.prompt,
      options: item.options,
      points: item.points
    }));

    return Response.json({ attempt: attemptRow, quiz, questions: masked });
  } catch (e) {
    console.error("Validate error:", e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}
