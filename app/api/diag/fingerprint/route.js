import crypto from "crypto";
export async function GET() {
  const key = process.env.OPENAI_API_KEY || "";
  const fp = key ? crypto.createHash("sha256").update(key).digest("hex").slice(0, 8) : null;
  return Response.json({
    env: process.env.VERCEL_ENV || "unknown",
    model: process.env.OPENAI_MODEL || null,
    hasKey: !!key,
    key_fp: fp
  });
}
