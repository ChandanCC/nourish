import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { getMealParsingProvider } from '../providers/registry';
import { normalizeInput, lookupFoodMemory, storeFoodMemory } from '../services/foodMemory';
import type { NutritionConfidence, SourceType } from '../models/FoodEntry';

const router = Router();

const MEAL_PARSING_PROMPT = `You are a precise nutrition parser. The user will describe what they ate.

Extract:
- A clean, readable name for the entry (short, no measurement units in the name)
- Calories (kcal, integer)
- Protein (g, integer)
- Carbohydrates (g, integer)
- Fat (g, integer)
- Fiber (g, integer)
- Your confidence in this estimate

Return ONLY a JSON object. No explanation. No markdown. No prose.

Use standard reference values for foods. If a portion size is not specified, use a standard serving.
If you cannot identify a food item, use your best estimate and flag it.
For Indian food, use IFCT reference values.

confidence rules:
- "high": well-known food with standard portion, reliable estimate
- "medium": reasonable estimate but portion or preparation unclear
- "low": unfamiliar food, highly ambiguous description, or significant uncertainty

Format:
{
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "note": "string | null",
  "confidence": "high" | "medium" | "low"
}

The "note" field: include only if there is something important about the parse — e.g., "Portion size assumed as 1 medium chicken breast (150g). Adjust if different." Null otherwise.`;

router.post('/', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  const userId = new Types.ObjectId(req.user!.userId);
  const normalizedText = normalizeInput(text);

  // Personal memory lookup — deterministic, free, replay-safe
  const memoryHit = await lookupFoodMemory(userId, normalizedText);
  if (memoryHit) {
    res.json({
      result: {
        name:     memoryHit.name,
        calories: memoryHit.calories,
        protein:  memoryHit.proteinG,
        carbs:    memoryHit.carbsG,
        fat:      memoryHit.fatG,
        fiber:    memoryHit.fiberG,
        note:     memoryHit.parseNote,
      },
      parsedByModel: 'memory:personal',
      confidence:    'recalled' as NutritionConfidence,
      sourceType:    'personal_memory' as SourceType,
      sourceId:      memoryHit.sourceId,
    });
    return;
  }

  const provider = getMealParsingProvider();
  if (!provider) {
    res.status(500).json({ error: 'Meal parsing provider not configured' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const rawText = await provider.complete({
      systemPrompt: MEAL_PARSING_PROMPT,
      userMessage: text,
      maxTokens: 512,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (rawText === null) {
      res.status(502).json({ error: "Couldn't parse that. Try again." });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      res.status(422).json({ error: "Couldn't parse that. Try again." });
      return;
    }

    const aiConfidence = String(parsed['confidence'] ?? 'medium');
    const confidence: NutritionConfidence = aiConfidence === 'low' ? 'low_confidence' : 'estimated';

    const result = {
      name:     String(parsed['name'] ?? 'Unknown food'),
      calories: Math.max(0, Math.round(Number(parsed['calories']) || 0)),
      protein:  Math.max(0, Math.round(Number(parsed['protein'])  || 0)),
      carbs:    Math.max(0, Math.round(Number(parsed['carbs'])    || 0)),
      fat:      Math.max(0, Math.round(Number(parsed['fat'])      || 0)),
      fiber:    Math.max(0, Math.round(Number(parsed['fiber'])    || 0)),
      note:     parsed['note'] ? String(parsed['note']) : null,
    };

    // Store in personal memory for future deterministic recall
    storeFoodMemory(
      userId,
      normalizedText,
      { ...result, proteinG: result.protein, carbsG: result.carbs, fatG: result.fat, fiberG: result.fiber, parseNote: result.note },
      provider.canonicalId,
      confidence,
    ).catch(() => { /* non-critical — don't fail the response */ });

    res.json({
      result,
      parsedByModel: provider.canonicalId,
      confidence,
      sourceType: 'ai_estimate' as SourceType,
      sourceId: null,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      res.status(504).json({ error: 'Server timeout. Try again.' });
      return;
    }
    console.error('Analyse error:', err);
    res.status(502).json({ error: 'Failed to reach AI provider' });
  }
});

export default router;
