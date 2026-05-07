import { Router, Request, Response } from 'express';

const router = Router();

const SYSTEM_PROMPT = `You are a nutrition analysis expert. Analyze all food items and return ONLY raw JSON. Start with { end with }.

Return this exact structure (use 0 for unknowns, never omit fields):
{"items":[{"name":"","quantity":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"mealLabel":""}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0},"micros":{"vitaminC":0,"vitaminD":0,"vitaminB12":0,"vitaminA":0,"vitaminE":0,"vitaminK":0,"calcium":0,"iron":0,"magnesium":0,"zinc":0,"potassium":0,"sodium":0,"omega3":0,"folate":0},"summary":""}

Rules: macros/fiber in grams, calories in kcal. Indian food = IFCT data. Low-fat milk=1.5% fat ~60kcal/100ml. mealLabel: Breakfast/Lunch/Dinner/Snack/Other. Output ONLY JSON.`;

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
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-api-key':     apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 5000,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: text }],
      }),
    });

    const data = await upstream.json() as any;

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || 'Claude API error' });
      return;
    }
    if (data.stop_reason === 'max_tokens') {
      res.status(422).json({ error: 'Response cut off — try a smaller meal' });
      return;
    }

    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    if (!textBlock?.text) {
      res.status(502).json({ error: 'No text in Claude response' });
      return;
    }

    res.json({ result: textBlock.text });
  } catch (err) {
    console.error('Analyse error:', err);
    res.status(502).json({ error: 'Failed to reach Claude API' });
  }
});

export default router;
