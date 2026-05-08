import { Router, Request, Response } from 'express';

const router = Router();

const SYSTEM_PROMPT = `You are a precise nutrition parser. The user will describe what they ate.

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      const err = await upstream.json() as any;
      res.status(upstream.status).json({ error: err?.error?.message || 'Claude API error' });
      return;
    }

    const data = await upstream.json() as any;
    if (data.stop_reason === 'max_tokens') {
      res.status(422).json({ error: 'Response truncated — try a shorter description' });
      return;
    }

    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    if (!textBlock?.text) {
      res.status(502).json({ error: 'No text in Claude response' });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      res.status(422).json({ error: "Couldn't parse that. Try again." });
      return;
    }

    // Validate and sanitize output
    const result = {
      name:     String(parsed.name ?? 'Unknown food'),
      calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
      protein:  Math.max(0, Math.round(Number(parsed.protein)  || 0)),
      carbs:    Math.max(0, Math.round(Number(parsed.carbs)    || 0)),
      fat:      Math.max(0, Math.round(Number(parsed.fat)      || 0)),
      fiber:    Math.max(0, Math.round(Number(parsed.fiber)    || 0)),
      note:     parsed.note ? String(parsed.note) : null,
    };

    res.json({ result });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      res.status(504).json({ error: 'Server timeout. Try again.' });
      return;
    }
    console.error('Analyse error:', err);
    res.status(502).json({ error: 'Failed to reach Claude API' });
  }
});

export default router;
