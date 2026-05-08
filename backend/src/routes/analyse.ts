import { Router, Request, Response } from 'express';
import { getMealParsingProvider } from '../providers/registry';

const router = Router();

const MEAL_PARSING_PROMPT = `You are a precise nutrition parser. The user will describe what they ate.

Extract:
- A clean, readable name for the entry (short, no measurement units in the name)
- Calories (kcal, integer)
- Protein (g, integer)
- Carbohydrates (g, integer)
- Fat (g, integer)
- Fiber (g, integer)

Return ONLY a JSON object. No explanation. No markdown. No prose.

Use standard reference values for foods. If a portion size is not specified, use a standard serving.
If you cannot identify a food item, use your best estimate and flag it.
For Indian food, use IFCT reference values.

Format:
{
  "name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "note": "string | null"
}

The "note" field: include only if there is something important about the parse — e.g., "Portion size assumed as 1 medium chicken breast (150g). Adjust if different." Null otherwise.`;

router.post('/', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text?.trim()) {
    res.status(400).json({ error: 'text is required' });
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

    const result = {
      name:     String(parsed['name'] ?? 'Unknown food'),
      calories: Math.max(0, Math.round(Number(parsed['calories']) || 0)),
      protein:  Math.max(0, Math.round(Number(parsed['protein'])  || 0)),
      carbs:    Math.max(0, Math.round(Number(parsed['carbs'])    || 0)),
      fat:      Math.max(0, Math.round(Number(parsed['fat'])      || 0)),
      fiber:    Math.max(0, Math.round(Number(parsed['fiber'])    || 0)),
      note:     parsed['note'] ? String(parsed['note']) : null,
    };

    res.json({ result, parsedByModel: provider.canonicalId });
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
