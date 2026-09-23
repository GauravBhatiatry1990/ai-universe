export type RssFeed = {
  name: string;
  url: string;
  category: string;
};

export const RSS_FEEDS: RssFeed[] = [

  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    category: 'Industry',
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    category: 'Industry',
  },
  {
    name: 'MIT Tech Review AI',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    category: 'Research',
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: 'Official',
  },
  {
    name: 'Anthropic News',
    url: 'https://www.anthropic.com/feed.xml',
    category: 'Official',
  },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'Official',
  },
  {
    name: 'DeepMind Blog',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'Research',
  },
  {
    name: 'Microsoft AI',
    url: 'https://blogs.microsoft.com/ai/feed/',
    category: 'Official',
  },
  {
    name: 'Meta AI Blog',
    url: 'https://ai.meta.com/blog/rss/',
    category: 'Official',
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'Research',
  },
  {
    name: 'AI News',
    url: 'https://artificialintelligence-news.com/feed/',
    category: 'Industry',
  },
];