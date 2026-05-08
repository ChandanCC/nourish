import type { CompletionProvider, CompletionOptions } from './types';

export class AnthropicProvider implements CompletionProvider {
  readonly providerId = 'anthropic';
  readonly modelId: string;
  readonly canonicalId: string;

  private readonly apiKey: string;

  constructor(apiKey: string, modelId: string) {
    this.apiKey = apiKey;
    this.modelId = modelId;
    this.canonicalId = `anthropic:${modelId}`;
  }

  async complete({ systemPrompt, userMessage, maxTokens, signal }: CompletionOptions): Promise<string | null> {
    let resp: Response;
    try {
      resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.modelId,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
        signal,
      });
    } catch {
      return null;
    }

    if (!resp.ok) return null;

    let data: { content?: Array<{ type: string; text?: string }>; stop_reason?: string };
    try {
      data = await resp.json() as typeof data;
    } catch {
      return null;
    }

    if (data.stop_reason === 'max_tokens') return null;

    const textBlock = data.content?.find(b => b.type === 'text');
    return textBlock?.text ?? null;
  }
}
