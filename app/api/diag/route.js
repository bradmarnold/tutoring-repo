import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .select("id")
      .limit(1);

    return Response.json({
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE,
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        siteUrl: process.env.SITE_URL || null,
      },
      db: { ok: !error, rows: data?.length ?? 0 }
    });
  } catch (e) {
    return new Response(JSON.stringify({ diagError: e?.message || "fail" }), { status: 500 });
  }
}
