/**
 * Provider registry — runtime-configurable via environment variables.
 *
 * Env vars:
 *   AI_PROVIDER_PARSING=anthropic      (default: anthropic)
 *   AI_PROVIDER_SYNTHESIS=anthropic    (default: anthropic)
 *   AI_MODEL_PARSING=claude-sonnet-4-6 (default: claude-sonnet-4-6)
 *   AI_MODEL_SYNTHESIS=claude-sonnet-4-6
 *
 * To switch providers, change env vars. No code changes required.
 * To add a provider, create a new class in this directory and add a case below.
 */

import { AnthropicProvider } from './anthropic';
import type { CompletionProvider } from './types';

const DEFAULT_PARSING_MODEL    = 'claude-sonnet-4-6';
const DEFAULT_SYNTHESIS_MODEL  = 'claude-sonnet-4-6';

function buildProvider(providerName: string, apiKey: string, model: string): CompletionProvider {
  switch (providerName) {
    case 'anthropic':
      return new AnthropicProvider(apiKey, model);
    default:
      throw new Error(`Unknown AI provider: "${providerName}". Supported: anthropic`);
  }
}

function resolveApiKey(providerName: string): string {
  switch (providerName) {
    case 'anthropic': return process.env.ANTHROPIC_API_KEY ?? '';
    case 'google':    return process.env.GEMINI_API_KEY ?? '';
    case 'openai':    return process.env.OPENAI_API_KEY ?? '';
    default:          return '';
  }
}

export function getMealParsingProvider(): CompletionProvider | null {
  const providerName = process.env.AI_PROVIDER_PARSING ?? 'anthropic';
  const model        = process.env.AI_MODEL_PARSING    ?? DEFAULT_PARSING_MODEL;
  const apiKey       = resolveApiKey(providerName);
  if (!apiKey) return null;
  return buildProvider(providerName, apiKey, model);
}

export function getSignalSynthesisProvider(): CompletionProvider | null {
  const providerName = process.env.AI_PROVIDER_SYNTHESIS ?? 'anthropic';
  const model        = process.env.AI_MODEL_SYNTHESIS    ?? DEFAULT_SYNTHESIS_MODEL;
  const apiKey       = resolveApiKey(providerName);
  if (!apiKey) return null;
  return buildProvider(providerName, apiKey, model);
}
