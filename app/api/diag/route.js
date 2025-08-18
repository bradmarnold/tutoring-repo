import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { OPENAI_MODEL } from "@/lib/openaiClient";
import crypto from "crypto";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .select("id")
      .limit(1);

    // Generate key fingerprint if key exists
    const keyFp = process.env.OPENAI_API_KEY 
      ? crypto.createHash('sha256').update(process.env.OPENAI_API_KEY).digest('hex').slice(-8)
      : null;

    return Response.json({
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        model: OPENAI_MODEL,
        key_fp: keyFp,
        siteUrl: process.env.SITE_URL || null,
      },
      demo: {
        quizId: process.env.DEMO_QUIZ_ID || null,
        ttlMinutes: parseInt(process.env.DEMO_TTL_MINUTES) || 15,
        maxAttempts: parseInt(process.env.DEMO_MAX_ATTEMPTS) || 1
      },
      db: { ok: !error, rows: data?.length ?? 0 }
    });
  } catch (e) {
    return new Response(JSON.stringify({ diagError: e?.message || "fail" }), { status: 500 });
  }
}
