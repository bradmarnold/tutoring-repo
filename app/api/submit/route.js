import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai, OPENAI_MODEL } from "@/lib/openaiClient";

// --- replace your explainMistakes with this ---
async function explainMistakes(items, quizTitle) {
  if (!items || items.length === 0) return [];
  if (!process.env.OPENAI_API_KEY) {
    return items.map(() => "Explanation unavailable right now. (AI key not configured.)");
  }

  try {
    const lines = items.map((it, i) =>
      `Q${i + 1}: ${it.prompt}\n` +
      `Options: ${JSON.stringify(it.options)}\n` +
      `Student selected: ${it.selectedText}\n` +
      `Correct answer: ${it.correctText}`
    ).join("\n\n");

    const system = "You are a calm tutor. Explain in short, numbered steps. Use plain language and show formulas when helpful.";
    const user = `Quiz: ${quizTitle}. For each item below, explain why the correct answer is correct and what concept the student likely missed. Keep each explanation under 120 words.\n\n${lines}`;

    const resp = await openai.chat.completions.create({
      model: OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const text = resp?.choices?.[0]?.message?.content || "";
    const parts = text.split(/\n\s*Q\d+[:\.]/i).filter(Boolean);
    return parts.length === items.length ? parts : items.map(() => text || "Explanation coming soon.");
  } catch (err) {
    console.error("OpenAI explanation error:", err?.message || err);
    return items.map(() => "Explanation unavailable right now. We’ll add a walkthrough after class.");
  }
}

export async function POST(req) {
  if (!supabaseAdmin) return new Response("Database not configured", { status: 500 });

  try {
    const { attemptId, answers } = await req.json();
    if (!attemptId || !answers) return new Response("Bad request", { status: 400 });

    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .select("id, quiz_id, student_email, ends_at, finished")
      .eq("id", attemptId)
      .single();
    if (aErr || !attempt) return new Response("Attempt not found", { status: 404 });

    if (attempt.finished) return new Response("Already submitted", { status: 409 });
    if (new Date(attempt.ends_at) < new Date()) return new Response("Time is up", { status: 403 });

    const { data: quiz } = await supabaseAdmin
      .from("quizzes")
      .select("id, title")
      .eq("id", attempt.quiz_id)
      .single();

    const { data: qs } = await supabaseAdmin
      .from("questions")
      .select("id, prompt, options, correct_index, points")
      .eq("quiz_id", attempt.quiz_id);

    let score = 0;
    const details = [];
    const wrong = [];

    for (const q of qs) {
      const sel = answers[q.id];
      const options = Array.isArray(q.options) ? q.options : q.options?.options || [];
      const isCorrect = Number(sel) === Number(q.correct_index);
      if (isCorrect) score += q.points;

      const row = {
        question_id: q.id,
        selected_index: sel,
        is_correct: isCorrect,
        correct: isCorrect,                 // <-- expose for UI that expects `correct`
        prompt: q.prompt,
        options,
        correctText: options[q.correct_index],
        selectedText: sel != null ? options[sel] : "(no answer)",
        explanation: null
      };
      details.push(row);
      if (!isCorrect) {
        wrong.push(row); // we will fill row.explanation below
      }
    }

    const totalPoints = qs.reduce((s, q) => s + q.points, 0);

    // --- get explanations, then merge onto the same detail rows ---
    const exps = await explainMistakes(wrong, quiz.title);
    wrong.forEach((row, i) => { row.explanation = exps[i] || ""; });

    // persist answers (now includes explanation for wrong items)
    const answersRows = details.map(d => ({
      attempt_id: attempt.id,
      question_id: d.question_id,
      selected_index: d.selected_index ?? -1,
      is_correct: d.is_correct,
      explanation: d.explanation || null,
    }));
    await supabaseAdmin.from("answers").upsert(answersRows);

    await supabaseAdmin
      .from("attempts")
      .update({ finished: true, score })
      .eq("id", attempt.id);

    return Response.json({ score, totalPoints, details });
  } catch (e) {
    console.error("submit error:", e?.message || e);
    return new Response("Server error", { status: 500 });
  }
}
