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

    let resp: Response;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
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
        }),
        signal,
      });
    } catch {
      return null;
    }

    if (!resp.ok) return null;

    let data: GeminiResponse;
    try {
      data = await resp.json() as GeminiResponse;
    } catch {
      return null;
    }

    const candidate = data.candidates?.[0];
    if (!candidate) return null;
    if (candidate.finishReason === 'MAX_TOKENS') return null;

    return candidate.content?.parts?.[0]?.text ?? null;
  }
}
