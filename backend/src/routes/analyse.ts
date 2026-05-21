import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { getMealParsingProvider } from '../providers/registry';
import { normalizeInput, lookupFoodMemory, storeFoodMemory } from '../services/foodMemory';
import type { NutritionConfidence, SourceType } from '../models/FoodEntry';

const router = Router();

const MEAL_PARSING_PROMPT = `You are a precise nutrition parser. The user will describe what they ate.

IMPORTANT: Always return a SINGLE JSON object representing the total meal, even if multiple foods are listed.
If multiple foods are described (as a list, with bullet points, or separated by commas/newlines), sum all nutritional values into one combined entry and write a concise name like "Lunch — chapati, sabzi, buttermilk".

Extract:
- A clean, readable name for the combined entry (short summary, no raw measurements in the name)
- Total calories (kcal, integer) — sum of all items
- Total protein (g, integer) — sum of all items
- Total carbohydrates (g, integer) — sum of all items
- Total fat (g, integer) — sum of all items
- Total fiber (g, integer) — sum of all items
- Your confidence in this estimate

Return ONLY a JSON object. No explanation. No markdown. No prose. No arrays.

Use standard reference values for foods. If a portion size is not specified, use a standard serving.
If you cannot identify a food item, use your best estimate and flag it.
For Indian food, use IFCT reference values.

confidence rules:
- "high": well-known foods with clear portions, reliable estimate
- "medium": reasonable estimate but some portions or preparations are unclear
- "low": multiple unfamiliar foods or highly ambiguous descriptions

Also estimate these micronutrients (combined total across all items):
- iron_mg, calcium_mg, vitamin_d_mcg, vitamin_b12_mcg, magnesium_mg, zinc_mg, potassium_mg, sodium_mg
Use standard food composition values. Use 0 if genuinely unknown.

Format (single object, always):
{
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "note": "string | null",
  "confidence": "high" | "medium" | "low",
  "iron_mg": number,
  "calcium_mg": number,
  "vitamin_d_mcg": number,
  "vitamin_b12_mcg": number,
  "magnesium_mg": number,
  "zinc_mg": number,
  "potassium_mg": number,
  "sodium_mg": number
}

The "note" field: include only if there is something important — e.g., assumptions made about portions. Null otherwise.`;

function extractSingleEntry(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;

  // Already a single object with name field
  if (!Array.isArray(raw) && 'name' in (raw as Record<string, unknown>)) {
    return raw as Record<string, unknown>;
  }

  // Array returned — sum all items into one
  if (Array.isArray(raw) && raw.length > 0) {
    const items = raw as Record<string, unknown>[];
    const names = items.map(i => String(i['name'] ?? '')).filter(Boolean).join(', ');
    return {
      name:       names || 'Combined meal',
      calories:   items.reduce((s, i) => s + (Number(i['calories']) || 0), 0),
      protein:    items.reduce((s, i) => s + (Number(i['protein'])  || 0), 0),
      carbs:      items.reduce((s, i) => s + (Number(i['carbs'])    || 0), 0),
      fat:        items.reduce((s, i) => s + (Number(i['fat'])      || 0), 0),
      fiber:      items.reduce((s, i) => s + (Number(i['fiber'])    || 0), 0),
      note:       null,
      confidence: 'medium',
    };
  }

  return null;
}

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
      maxTokens: 1024,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (rawText === null) {
      console.error('[analyse] rawText is null', rawText, text);
      res.status(502).json({ error: "Couldn't parse that. Try again." });
      return;
    }

    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(rawText);
    } catch {
      console.error('[analyse] JSON parse failed. Raw model output:', rawText);
      res.status(422).json({ error: "Couldn't parse that. Try again." });
      return;
    }

    const parsed = extractSingleEntry(rawParsed);
    if (!parsed) {
      console.error('[analyse] extractSingleEntry returned null. rawParsed:', JSON.stringify(rawParsed));
      res.status(422).json({ error: "Couldn't parse that. Try again." });
      return;
    }

    const aiConfidence = String(parsed['confidence'] ?? 'medium');
    const confidence: NutritionConfidence = aiConfidence === 'low' ? 'low_confidence' : 'estimated';

    const micro = (key: string) => Math.max(0, parseFloat((Number(parsed[key]) || 0).toFixed(2)));

    const result = {
      name:     String(parsed['name'] ?? 'Unknown food'),
      calories: Math.max(0, Math.round(Number(parsed['calories']) || 0)),
      protein:  Math.max(0, Math.round(Number(parsed['protein'])  || 0)),
      carbs:    Math.max(0, Math.round(Number(parsed['carbs'])    || 0)),
      fat:      Math.max(0, Math.round(Number(parsed['fat'])      || 0)),
      fiber:    Math.max(0, Math.round(Number(parsed['fiber'])    || 0)),
      note:     parsed['note'] ? String(parsed['note']) : null,
      ironMg:        micro('iron_mg'),
      calciumMg:     micro('calcium_mg'),
      vitaminDMcg:   micro('vitamin_d_mcg'),
      vitaminB12Mcg: micro('vitamin_b12_mcg'),
      magnesiumMg:   micro('magnesium_mg'),
      zincMg:        micro('zinc_mg'),
      potassiumMg:   micro('potassium_mg'),
      sodiumMg:      micro('sodium_mg'),
    };

    storeFoodMemory(
      userId,
      normalizedText,
      { ...result, proteinG: result.protein, carbsG: result.carbs, fatG: result.fat, fiberG: result.fiber, parseNote: result.note,
        ironMg: result.ironMg, calciumMg: result.calciumMg, vitaminDMcg: result.vitaminDMcg, vitaminB12Mcg: result.vitaminB12Mcg,
        magnesiumMg: result.magnesiumMg, zincMg: result.zincMg, potassiumMg: result.potassiumMg, sodiumMg: result.sodiumMg },
      provider.canonicalId,
      confidence,
    ).catch(() => { /* non-critical */ });

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
