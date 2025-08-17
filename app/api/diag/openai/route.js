import { openai, OPENAI_MODEL } from "@/lib/openaiClient";

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) return Response.json({ ok:false, reason:"no_key" }, { status:500 });
    const r = await openai.responses.create({
      model: OPENAI_MODEL || "gpt-4.1-mini",
      input: "Say OK."
    });
    const text = r.output_text?.trim() || "";
    return Response.json({ ok: text.toLowerCase().includes("ok"), model: OPENAI_MODEL });
  } catch (e) {
    return Response.json({ ok:false, error: e?.error?.message || e?.message || "unknown" }, { status:500 });
  }
}
