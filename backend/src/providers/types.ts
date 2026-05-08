/**
 * Provider capability interfaces.
 *
 * Providers are thin HTTP adapters. They take a system prompt + user message
 * and return raw text. Domain code owns JSON parsing and schema validation.
 *
 * Capabilities:
 *   MealParsingCapability  — natural language → structured nutrition
 *   SignalSynthesisCapability — pre-computed stats → state + instruction
 */

export interface ProviderIdentity {
  readonly providerId: string;   // e.g. "anthropic", "google", "openai"
  readonly modelId: string;      // e.g. "claude-sonnet-4-6"
  /** Canonical format stored in DB: "provider:model" */
  readonly canonicalId: string;
}

export interface CompletionOptions {
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  signal: AbortSignal;
}

/**
 * A provider that can perform text completion.
 * Returns the raw text content of the model's response, or null on failure.
 * Provider-specific response formats (content blocks, choices, etc.) are
 * handled internally — they never leak past this interface.
 */
export interface CompletionProvider extends ProviderIdentity {
  complete(opts: CompletionOptions): Promise<string | null>;
}
