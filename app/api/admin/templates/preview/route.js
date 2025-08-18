import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { chooseValues, renderTemplate, makeDistractors, toOptions } from "@/lib/ai/generator";

export async function POST(req) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { template_id, n = 3 } = await req.json();

    if (!template_id) {
      return Response.json({ error: "Missing template_id" }, { status: 400 });
    }

    // Get template
    const { data: template, error: templateError } = await supabaseAdmin
      .from("question_templates")
      .select(`
        id,
        title,
        prompt_md,
        variables,
        difficulty,
        teks_code,
        solution_steps_md,
        explanation_md,
        topics:topic_id(slug, course, unit)
      `)
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return Response.json({ error: "Template not found" }, { status: 404 });
    }

    const samples = [];
    
    for (let i = 0; i < Math.min(n, 10); i++) {
      try {
        // 1. Choose variable values
        const values = chooseValues(template.variables);

        // 2. Render template parts
        const prompt = renderTemplate({ markdown: template.prompt_md, values });
        const solutionSteps = template.solution_steps_md 
          ? renderTemplate({ markdown: template.solution_steps_md, values })
          : null;
        const explanation = template.explanation_md
          ? renderTemplate({ markdown: template.explanation_md, values })
          : null;

        // 3. Extract correct answer from solution or prompt
        // For preview, use first variable value as correct answer
        const correctAnswer = values[Object.keys(values)[0]]?.toString() || "Answer";

        // 4. Generate distractors
        const distractors = await makeDistractors({
          topic: template.topics?.course,
          difficulty: template.difficulty,
          correct: correctAnswer,
          values,
          prompt
        });

        // 5. Create options with correct answer
        const { options, correctIndex } = toOptions({ 
          correct: correctAnswer, 
          distractors 
        });

        samples.push({
          id: i + 1,
          values,
          prompt,
          options,
          correctIndex, // Include for PREVIEW ONLY
          correctAnswer,
          solutionSteps,
          explanation,
          metadata: {
            template_id: template.id,
            template_title: template.title,
            topic: template.topics?.slug,
            difficulty: template.difficulty,
            teks_code: template.teks_code
          }
        });
      } catch (sampleError) {
        console.error(`Error generating sample ${i + 1}:`, sampleError);
        samples.push({
          id: i + 1,
          error: "Failed to generate sample",
          details: sampleError.message
        });
      }
    }

    return Response.json({
      template: {
        id: template.id,
        title: template.title,
        topic: template.topics?.slug,
        difficulty: template.difficulty
      },
      samples
    });
  } catch (error) {
    console.error("Preview template error:", error);
    return Response.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}