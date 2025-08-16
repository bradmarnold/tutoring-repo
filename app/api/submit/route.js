import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai, OPENAI_MODEL } from "@/lib/openaiClient";

async function explainMistakes(items, quizTitle) {
  if (items.length === 0) return [];
  if (!openai) {
    return items.map(() => "AI explanations are not available - OpenAI not configured.");
  }
  
  const lines = items.map((it, i) => (
    `Q${i+1}: ${it.prompt}\n` +
    `Options: ${JSON.stringify(it.options)}\n` +
    `Student selected: ${it.selectedText}\n` +
    `Correct answer: ${it.correctText}\n`
  )).join("\n\n");
  const system = `You are a calm tutor. Explain in simple steps. Be concise. Avoid jargon. Provide formulas where helpful.`;
  const user = `Quiz: ${quizTitle}. For each item below, explain why the correct answer is correct and what concept the student missed. Use numbered steps.\n\n${lines}`;
  
  try {
    const resp = await openai.responses.create({ model: OPENAI_MODEL, input: [{ role: "system", content: system }, { role: "user", content: user }] });
    const text = resp.output_text || "";
    const chunks = text.split(/\n\s*Q\d+[:\.]/i).filter(Boolean);
    return chunks.length === items.length ? chunks : items.map(() => text);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return items.map(() => "Unable to generate explanation at this time.");
  }
}

export async function POST(req) {
  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }
  
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

    let score = 0; const details = [];
    const wrong = [];

    for (const q of qs) {
      const sel = answers[q.id];
      const options = Array.isArray(q.options) ? q.options : q.options?.options || [];
      const correct = Number(sel) === Number(q.correct_index);
      if (correct) score += q.points;
      const line = {
        question_id: q.id,
        selected_index: sel,
        is_correct: correct,
        prompt: q.prompt,
        options,
        correctText: options[q.correct_index],
        selectedText: sel != null ? options[sel] : "(no answer)",
      };
      details.push({ ...line });
      if (!correct) wrong.push(line);
    }

    const totalPoints = qs.reduce((s, q) => s + q.points, 0);
    const exps = await explainMistakes(wrong, quiz.title);
    wrong.forEach((w, i) => { w.explanation = exps[i] || ""; });

    const answersRows = details.map(d => ({
      attempt_id: attempt.id,
      question_id: d.question_id,
      selected_index: d.selected_index ?? -1,
      is_correct: d.is_correct,
      explanation: d.explanation || null,
    }));
    await supabaseAdmin.from("answers").upsert(answersRows);

    await supabaseAdmin.from("attempts").update({ finished: true, score }).eq("id", attempt.id);

    return Response.json({ score, totalPoints, details });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
}
