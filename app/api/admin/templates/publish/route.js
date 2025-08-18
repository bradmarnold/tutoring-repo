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
    const { id, howMany = 20, seed } = await req.json();

    if (!id) {
      return Response.json({ error: "Missing template id" }, { status: 400 });
    }

    if (howMany < 1 || howMany > 100) {
      return Response.json({ error: "howMany must be between 1 and 100" }, { status: 400 });
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
        topic_id,
        topics:topic_id(slug, course, unit)
      `)
      .eq("id", id)
      .single();

    if (templateError || !template) {
      return Response.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.status !== 'published' && template.status !== 'draft') {
      // Auto-promote to published for this operation
      await supabaseAdmin
        .from("question_templates")
        .update({ status: 'published' })
        .eq("id", id);
    }

    // 1. Insert template_versions (increment version)
    const { data: latestVersion } = await supabaseAdmin
      .from("template_versions")
      .select("version")
      .eq("template_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const newVersion = (latestVersion?.version || 0) + 1;
    
    const { error: versionError } = await supabaseAdmin
      .from("template_versions")
      .insert({
        template_id: id,
        version: newVersion,
        snapshot: {
          title: template.title,
          prompt_md: template.prompt_md,
          variables: template.variables,
          difficulty: template.difficulty,
          teks_code: template.teks_code,
          solution_steps_md: template.solution_steps_md,
          explanation_md: template.explanation_md,
          timestamp: new Date().toISOString()
        }
      });

    if (versionError) throw versionError;

    // 2. Expand N unique variants
    const variants = [];
    const questionBankItems = [];
    const maxAttempts = howMany * 3; // Prevent infinite loops
    let attempts = 0;

    if (seed) {
      // Use seed for reproducible results (simplified - in production use proper seeding)
      Math.seedrandom = Math.seedrandom || (() => Math.random());
    }

    while (variants.length < howMany && attempts < maxAttempts) {
      attempts++;
      
      try {
        // Generate variant
        const values = chooseValues(template.variables);
        const prompt = renderTemplate({ markdown: template.prompt_md, values });
        
        // Extract correct answer (simplified - extract from solution or use first variable)
        const correctAnswer = Object.values(values)[0]?.toString() || "Answer";
        
        // Generate distractors
        const distractors = await makeDistractors({
          topic: template.topics?.course,
          difficulty: template.difficulty,
          correct: correctAnswer,
          values,
          prompt
        });

        const { options, correctIndex } = toOptions({ 
          correct: correctAnswer, 
          distractors 
        });

        // Check for uniqueness (basic - check prompt similarity)
        const isDuplicate = variants.some(v => v.prompt === prompt);
        if (isDuplicate) continue;

        const solutionSteps = template.solution_steps_md 
          ? renderTemplate({ markdown: template.solution_steps_md, values })
          : null;

        const explanation = template.explanation_md
          ? renderTemplate({ markdown: template.explanation_md, values })
          : null;

        // Create variant for bank_variants
        const variant = {
          template_id: id,
          version: newVersion,
          topic_id: template.topic_id,
          prompt,
          options,
          correct_index: correctIndex,
          difficulty: template.difficulty,
          teks_code: template.teks_code,
          explanation: explanation,
          solution_steps_md: solutionSteps,
          origin_meta: { values, seed: seed || null },
          created_by: 'template-publisher'
        };

        variants.push(variant);

        // Also create for question_bank
        questionBankItems.push({
          topic_id: template.topic_id,
          prompt,
          options,
          correct_index: correctIndex,
          difficulty: template.difficulty,
          teks_code: template.teks_code,
          explanation: explanation,
          created_by: 'template-publisher',
          origin_template_id: id
        });

      } catch (variantError) {
        console.error(`Error generating variant ${attempts}:`, variantError);
        continue;
      }
    }

    if (variants.length === 0) {
      return Response.json({ error: "Failed to generate any variants" }, { status: 500 });
    }

    // 3. Insert into bank_variants
    const { error: variantsError } = await supabaseAdmin
      .from("bank_variants")
      .insert(variants);

    if (variantsError) throw variantsError;

    // 4. Insert into question_bank (for pool compatibility)
    const { error: questionBankError } = await supabaseAdmin
      .from("question_bank")
      .insert(questionBankItems);

    if (questionBankError) throw questionBankError;

    return Response.json({
      success: true,
      template_id: id,
      version: newVersion,
      variants_created: variants.length,
      question_bank_items: questionBankItems.length
    });

  } catch (error) {
    console.error("Publish template error:", error);
    return Response.json({ error: "Failed to publish template" }, { status: 500 });
  }
}