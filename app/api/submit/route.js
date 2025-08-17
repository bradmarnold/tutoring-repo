// Replace your existing explainMistakes with this version
async function explainMistakes(items, quizTitle) {
  // Nothing wrong? Nothing to explain.
  if (!items || items.length === 0) return [];

  // If the key/model are missing, don't fail the submit — just return a friendly note.
  if (!process.env.OPENAI_API_KEY) {
    return items.map(() => "Explanation unavailable right now. (AI key not configured.)");
  }

  try {
    // Build a compact, structured prompt
    const lines = items.map((it, i) =>
      `Q${i + 1}: ${it.prompt}\n` +
      `Options: ${JSON.stringify(it.options)}\n` +
      `Student selected: ${it.selectedText}\n` +
      `Correct answer: ${it.correctText}`
    ).join("\n\n");

    const system = "You are a calm tutor. Explain in short, numbered steps. Use plain language and show formulas when helpful.";
    const user = `Quiz: ${quizTitle}. For each item below, explain why the correct answer is correct and what concept the student likely missed. Keep each explanation under 120 words.\n\n${lines}`;

    const resp = await openai.responses.create({
      model: OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const text = resp?.output_text || "";
    // Try to split by Q markers (Q1:, Q2:, …). If that fails, reuse the whole text.
    const parts = text.split(/\n\s*Q\d+[:\.]/i).filter(Boolean);
    return parts.length === items.length ? parts : items.map(() => text || "Explanation coming soon.");
  } catch (err) {
    // Safety net: even if OpenAI errors/quota hits, submission succeeds
    console.error("OpenAI explanation error:", err?.message || err);
    return items.map(() => "Explanation unavailable right now. We’ll add a walkthrough after class.");
  }
}
