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
    // Return { teks_code, attempts, correct, accuracy } across answers joined to attempt_items/question_bank
    const teksMap = new Map();

    // Get analytics from attempt_items (new system)
    const { data: attemptItemResults } = await supabaseAdmin
      .from("answers")
      .select(`
        is_correct,
        attempt_items!inner(
          bank_item_id,
          question_bank!attempt_items_bank_item_id_fkey(teks_code)
        )
      `)
      .not("attempt_item_id", "is", null)
      .not("attempt_items.question_bank.teks_code", "is", null);

    // Process attempt_items results
    for (const result of attemptItemResults || []) {
      const teks = result.attempt_items?.question_bank?.teks_code;
      if (teks) {
        if (!teksMap.has(teks)) {
          teksMap.set(teks, { attempts: 0, correct: 0 });
        }
        const stats = teksMap.get(teks);
        stats.attempts++;
        if (result.is_correct) stats.correct++;
      }
    }

    // Get analytics from legacy questions (fallback)
    const { data: legacyResults } = await supabaseAdmin
      .from("answers")
      .select(`
        is_correct,
        questions!inner(teks_code)
      `)
      .is("attempt_item_id", null)
      .not("questions.teks_code", "is", null);

    // Process legacy results
    for (const result of legacyResults || []) {
      const teks = result.questions.teks_code;
      if (teks) {
        if (!teksMap.has(teks)) {
          teksMap.set(teks, { attempts: 0, correct: 0 });
        }
        const stats = teksMap.get(teks);
        stats.attempts++;
        if (result.is_correct) stats.correct++;
      }
    }

    // Convert to required format: { teks_code, attempts, correct, accuracy }
    const results = Array.from(teksMap.entries()).map(([teks_code, stats]) => ({
      teks_code,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracy: stats.attempts > 0 ? (stats.correct / stats.attempts).toFixed(3) : "0.000"
    })).sort((a, b) => a.teks_code.localeCompare(b.teks_code));

    return Response.json(results);
  } catch (error) {
    console.error("TEKS analytics error:", error);
    return new Response("Failed to fetch TEKS analytics", { status: 500 });
  }
}