import OpenAI from "openai";

// Handle missing environment variables gracefully during build
const openaiApiKey = process.env.OPENAI_API_KEY;
export const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

// Resilient tutor explanation function using Responses API
export async function tutorExplain(items, quizTitle) {
  if (!items || items.length === 0) return [];
  if (!openai) {
    return items.map(() => "Explanation unavailable right now.");
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

    const resp = await openai.responses.create({
      model: OPENAI_MODEL,
      input: user,
      metadata: { system_prompt: system }
    });

    const text = resp?.output_text || "";
    const parts = text.split(/\n\s*Q\d+[:\.]?/i).filter(Boolean);
    return parts.length === items.length ? parts : items.map(() => text || "Explanation coming soon.");
  } catch (err) {
    // Log masked error (no key material)
    console.error("OpenAI explanation error:", err?.error?.type || err?.message || "unknown");
    return items.map(() => "Explanation unavailable right now.");
  }
}
