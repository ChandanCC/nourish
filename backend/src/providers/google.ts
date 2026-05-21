import type { CompletionProvider, CompletionOptions } from './types';

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
  finishReason?: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
}

export class GoogleProvider implements CompletionProvider {
  readonly providerId = 'google';
  readonly modelId: string;
  readonly canonicalId: string;

  private readonly apiKey: string;

  constructor(apiKey: string, modelId: string) {
    this.apiKey = apiKey;
    this.modelId = modelId;
    this.canonicalId = `google:${modelId}`;
  }

  async complete({ systemPrompt, userMessage, maxTokens, signal }: CompletionOptions): Promise<string | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent`;

    const body = JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
        // Gemini 2.5 Flash uses thinking tokens by default, which consume the
        // maxOutputTokens budget before the actual response. Disabled here because
        // structured JSON extraction does not benefit from extended reasoning,
        // and thinking tokens would exhaust the budget before the response is written.
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const MAX_RETRIES = 3;
    const BACKOFF_MS = [1000, 2000, 4000];

    let resp: Response | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
          body,
          signal,
        });
      } catch (err) {
        console.log('[google] fetch error', err instanceof Error ? err.message : String(err));
        return null;
      }

      if (resp.status !== 429) break;

      const delay = BACKOFF_MS[attempt] ?? 4000;
      console.log(`[google] 429 rate limit — retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, delay);
        signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('AbortError')); }, { once: true });
      }).catch(() => null);

      if (signal.aborted) return null;
    }

    if (!resp || !resp.ok) {
      console.log('[google] fetch failed', resp?.status, resp?.statusText);
      return null;
    }

    let data: GeminiResponse;
    try {
      data = await resp.json() as GeminiResponse;
    } catch (err) {
      console.log('[google] json parse failed', err instanceof Error ? err.message : String(err), resp.statusText, resp.status, url, systemPrompt, userMessage, maxTokens, signal);
      return null;
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.log('[google] candidate is null', data, url, systemPrompt, userMessage, maxTokens, signal);
      return null;
    }
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.log('[google] finishReason is MAX_TOKENS', candidate, url, systemPrompt, userMessage, maxTokens, signal);
      return null;
    }

    const text = candidate.content?.parts?.[0]?.text ?? null;
    if (!text) {
      console.log('[google] text is null', candidate, url, systemPrompt, userMessage, maxTokens, signal);
      return null;
    }
    return text;
  }
}
