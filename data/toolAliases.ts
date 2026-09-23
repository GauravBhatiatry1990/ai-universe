// data/toolAliases.ts
// Maps tool slug -> words that count as a mention in a news item.

export const TOOL_ALIASES: Record<string, string[]> = {
  chatgpt: ['chatgpt', 'gpt-4', 'gpt-5', 'gpt-6', 'openai'],
  claude: ['claude', 'anthropic'],
  gemini: ['gemini', 'deepmind'],
  cursor: ['cursor'],
  copilot: ['copilot'],
  deepseek: ['deepseek'],
  sora: ['sora'],
  midjourney: ['midjourney'],
  perplexity: ['perplexity'],
  grok: ['grok', 'xai'],
  llama: ['llama', 'meta ai'],
  mistral: ['mistral'],
  runway: ['runway'],
  elevenlabs: ['elevenlabs', 'eleven labs'],
  notion: ['notion ai'],
  huggingface: ['hugging face', 'huggingface'],
  stable_diffusion: ['stable diffusion'],
  dall_e: ['dall-e', 'dall·e', 'dalle'],
  codeium: ['codeium'],
  tabnine: ['tabnine'],
};

export function getAliases(slug: string, fallbackName: string): string[] {
  return TOOL_ALIASES[slug] || [fallbackName.toLowerCase()];
}