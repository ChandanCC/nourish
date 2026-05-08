/**
 * Provider registry — runtime-configurable via environment variables.
 *
 * Env vars:
 *   AI_PROVIDER_PARSING=gemini        (default: gemini)
 *   AI_PROVIDER_SYNTHESIS=gemini      (default: gemini)
 *   AI_MODEL_PARSING=gemini-2.5-flash (default: gemini-2.5-flash)
 *   AI_MODEL_SYNTHESIS=gemini-2.5-flash
 *
 * Supported providers: gemini, anthropic
 * To add a provider: implement CompletionProvider, add cases below.
 * To switch providers: change env vars. No code changes required.
 */

import { AnthropicProvider } from './anthropic';
import { GoogleProvider } from './google';
import type { CompletionProvider } from './types';

const DEFAULT_PROVIDER       = 'gemini';
const DEFAULT_PARSING_MODEL  = 'gemini-2.5-flash';
const DEFAULT_SYNTHESIS_MODEL = 'gemini-2.5-flash';

function resolveApiKey(providerName: string): string {
  switch (providerName) {
    case 'anthropic': return process.env.ANTHROPIC_API_KEY ?? '';
    case 'gemini':    return process.env.GEMINI_API_KEY    ?? '';
    case 'openai':    return process.env.OPENAI_API_KEY    ?? '';
    default:          return '';
  }
}

function buildProvider(providerName: string, apiKey: string, model: string): CompletionProvider {
  switch (providerName) {
    case 'anthropic': return new AnthropicProvider(apiKey, model);
    case 'gemini':    return new GoogleProvider(apiKey, model);
    default:
      throw new Error(`Unknown AI provider: "${providerName}". Supported: gemini, anthropic`);
  }
}

export function getMealParsingProvider(): CompletionProvider | null {
  const providerName = process.env.AI_PROVIDER_PARSING ?? DEFAULT_PROVIDER;
  const model        = process.env.AI_MODEL_PARSING    ?? DEFAULT_PARSING_MODEL;
  const apiKey       = resolveApiKey(providerName);
  if (!apiKey) return null;
  return buildProvider(providerName, apiKey, model);
}

export function getSignalSynthesisProvider(): CompletionProvider | null {
  const providerName = process.env.AI_PROVIDER_SYNTHESIS ?? DEFAULT_PROVIDER;
  const model        = process.env.AI_MODEL_SYNTHESIS    ?? DEFAULT_SYNTHESIS_MODEL;
  const apiKey       = resolveApiKey(providerName);
  if (!apiKey) return null;
  return buildProvider(providerName, apiKey, model);
}
