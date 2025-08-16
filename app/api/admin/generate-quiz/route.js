import { supabaseAdmin } from "@/lib/supabaseAdmin";

function weightedSample(items, k){
  const out = []; const pool = items.slice();
  while (out.length < k && pool.length){
    const total = pool.reduce((s, it)=> s + (it.weight || 1), 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) { r -= (pool[idx].weight || 1); if (r <= 0) break; }
    out.push(pool[idx]); pool.splice(idx, 1);
  }
  return out;
}

export async function POST(req){
  const { templateId, title } = await req.json();
  if (!templateId || !title) return new Response("Bad request", { status: 400 });

  const { data: sources } = await supabaseAdmin
    .from("template_sources")
    .select("count, pool:pool_id(id,name), pool_items:pool_id(bank_question_id, weight, bank_questions:bank_question_id(*))")
    .eq("template_id", templateId);

  const { data: quiz, error: qErr } = await supabaseAdmin
    .from("quizzes").insert({ title }).select("id, title").single();
  if (qErr) return new Response("DB error", { status: 500 });

  const toInsert = [];
  for (const src of sources || []){
    const items = (src.pool_items || []).map(pi => ({ weight: pi.weight, ...pi.bank_questions }));
    const pick = weightedSample(items, src.count);
    for (const bq of pick){
      toInsert.push({
        quiz_id: quiz.id,
        bank_question_id: bq.id,
        prompt: bq.prompt,
        options: bq.options,
        correct_index: bq.correct_index,
        points: bq.points
      });
    }
  }
  if (toInsert.length === 0) return new Response("No questions in pools", { status: 400 });
  await supabaseAdmin.from("questions").insert(toInsert);
  return Response.json({ quizId: quiz.id });
}
