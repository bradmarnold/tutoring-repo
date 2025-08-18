import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req) {
  // Check admin authentication
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return new Response("Database not configured", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const quizId = url.searchParams.get("quiz_id");
    
    if (!quizId) {
      return new Response("quiz_id parameter is required", { status: 400 });
    }

    // Get TEKS analytics from both legacy questions and new attempt_items
    const teksMap = new Map();

    // Get analytics from legacy questions
    const { data: legacyResults } = await supabaseAdmin
      .from("answers")
      .select(`
        is_correct,
        questions!inner(teks_code),
        attempts!inner(quiz_id)
      `)
      .eq("attempts.quiz_id", quizId)
      .not("questions.teks_code", "is", null);

    // Process legacy results
    for (const result of legacyResults || []) {
      const teks = result.questions.teks_code;
      if (!teksMap.has(teks)) {
        teksMap.set(teks, { total: 0, correct: 0 });
      }
      const stats = teksMap.get(teks);
      stats.total++;
      if (result.is_correct) stats.correct++;
    }

    // Get analytics from attempt_items (bank questions)
    const { data: bankResults } = await supabaseAdmin
      .from("answers")
      .select(`
        is_correct,
        attempt_items!inner(
          bank_id,
          attempts!inner(quiz_id)
        )
      `)
      .eq("attempt_items.attempts.quiz_id", quizId)
      .not("attempt_item_id", "is", null);

    // For bank results, we need to get TEKS codes separately
    const bankItemIds = [...new Set((bankResults || [])
      .map(r => r.attempt_items?.bank_id)
      .filter(Boolean))];

    if (bankItemIds.length > 0) {
      const { data: bankItems } = await supabaseAdmin
        .from("question_bank")
        .select("id, teks_code")
        .in("id", bankItemIds)
        .not("teks_code", "is", null);

      const bankTeksMap = new Map();
      for (const item of bankItems || []) {
        bankTeksMap.set(item.id, item.teks_code);
      }

      // Process bank results
      for (const result of bankResults || []) {
        const bankId = result.attempt_items?.bank_id;
        const teks = bankTeksMap.get(bankId);
        if (teks) {
          if (!teksMap.has(teks)) {
            teksMap.set(teks, { total: 0, correct: 0 });
          }
          const stats = teksMap.get(teks);
          stats.total++;
          if (result.is_correct) stats.correct++;
        }
      }
    }

    // Convert to array format with accuracy calculation
    const results = Array.from(teksMap.entries()).map(([teks_code, stats]) => ({
      teks_code,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? (stats.correct / stats.total * 100).toFixed(1) : "0.0"
    })).sort((a, b) => a.teks_code.localeCompare(b.teks_code));

    return Response.json(results);
  } catch (error) {
    console.error("TEKS analytics error:", error);
    return new Response("Failed to fetch TEKS analytics", { status: 500 });
  }
}