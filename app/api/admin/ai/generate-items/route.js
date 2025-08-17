import { openai, OPENAI_MODEL } from "@/lib/openaiClient";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req) {
  // Check admin authentication
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const { course, unit, topic_slug, teks_codes, difficulty = 'med', n, style = 'concept' } = await req.json();
    
    if (!course || !unit || !topic_slug || !n) {
      return new Response("Missing required fields: course, unit, topic_slug, n", { status: 400 });
    }

    if (n < 1 || n > 20) {
      return new Response("n must be between 1 and 20", { status: 400 });
    }

    if (!openai) {
      return new Response("OpenAI not configured", { status: 500 });
    }

    // Build system prompt for strict JSON generation
    const systemPrompt = `You are an expert STEM tutor and item-writer. Produce high-quality multiple-choice questions for high school/early college level.

Requirements:
- Output STRICT JSON ONLY: an array of items. No commentary.
- Each item has: prompt (string), options (array of 4 concise strings), correct_index (0-3), teks_code (optional, string).
- Keep prompts short and unambiguous. Avoid trick questions.
- Provide strong distractors (common misconceptions), not random noise.
- Adhere to the requested topic, TEKS tags, and difficulty.
- Avoid duplicate options; do not include "All of the above" or "None of the above".
- Use ASCII math or simple Unicode; no LaTeX.

Examples:
[
  {
    "prompt": "d/dx( x^3 ) = ?",
    "options": ["x^2", "3x^2", "x^3", "3x"],
    "correct_index": 1,
    "teks_code": "A.1"
  },
  {
    "prompt": "Units of k in Coulomb's law?",
    "options": ["N·m^2/C^2", "N/C", "C/N", "V/m"],
    "correct_index": 0,
    "teks_code": "B.2"
  }
]`;

    // Build user message
    let userMessage = `Course: ${course}; Unit: ${unit}; Topic: ${topic_slug}; Difficulty: ${difficulty}`;
    if (teks_codes && Array.isArray(teks_codes) && teks_codes.length > 0) {
      userMessage += `; TEKS: ${teks_codes.join(', ')}`;
    }
    if (style) {
      userMessage += `; Style: ${style}`;
    }
    userMessage += `\nGenerate n=${n} items.`;

    // Use Responses API
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: userMessage,
      system_prompt: systemPrompt
    });

    const outputText = response.output_text?.trim();
    if (!outputText) {
      return new Response("No output from AI", { status: 500 });
    }

    // Parse and validate JSON
    let items;
    try {
      items = JSON.parse(outputText);
    } catch (e) {
      return new Response("AI returned invalid JSON", { status: 400 });
    }

    if (!Array.isArray(items)) {
      return new Response("AI output must be an array", { status: 400 });
    }

    // Validate each item
    for (const item of items) {
      if (!item.prompt || !Array.isArray(item.options) || item.options.length !== 4 || 
          typeof item.correct_index !== 'number' || item.correct_index < 0 || item.correct_index > 3) {
        return new Response("Invalid item structure in AI output", { status: 400 });
      }
    }

    return Response.json({ items });
  } catch (error) {
    console.error("AI generation error:", error);
    return new Response("Failed to generate items", { status: 500 });
  }
}