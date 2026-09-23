// data/newsSources.ts

const SOURCE_DOMAINS: Record<string, string> = {
  'TechCrunch AI': 'techcrunch.com',
  'VentureBeat AI': 'venturebeat.com',
  'The Verge AI': 'theverge.com',
  'MIT Tech Review AI': 'technologyreview.com',
  'OpenAI Blog': 'openai.com',
  'Anthropic News': 'anthropic.com',
  'Google AI Blog': 'blog.google',
  'DeepMind Blog': 'deepmind.google',
  'Microsoft AI': 'blogs.microsoft.com',
  'Meta AI Blog': 'ai.meta.com',
  'Hugging Face Blog': 'huggingface.co',
  'AI News': 'artificialintelligence-news.com',
};

export function getSourceLogo(sourceName: string): string {
  const domain = SOURCE_DOMAINS[sourceName] || 'google.com';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}