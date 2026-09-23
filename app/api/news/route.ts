// app/api/news/route.ts
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { RSS_FEEDS } from '@/data/rssFeeds';
import { getSourceLogo } from '@/data/newsSources';

export const revalidate = 600;

type NewsItem = {
  title: string;
  link: string;
  source: string;
  sourceLogo: string;
  category: string;
  pubDate: string;
  snippet: string;
  image?: string;
};

// Strong AI signals — must appear in the TITLE to pass the filter.
const AI_KEYWORDS = [
  'ai', 'a.i.', 'openai', 'gpt', 'chatgpt', 'llm', 'anthropic', 'claude',
  'gemini', 'deepmind', 'midjourney', 'diffusion', 'copilot', 'llama',
  'mistral', 'machine learning', 'neural', 'multimodal', 'generative',
  'artificial intelligence',
];

function isAIRelated(title: string): boolean {
  const lower = title.toLowerCase();
  return AI_KEYWORDS.some((kw) => {
    if (kw.length <= 3) {
      // Word-boundary check so "ai" doesn't match "chair"
      return new RegExp(`(^|[^a-z])${kw}([^a-z]|$)`, 'i').test(lower);
    }
    return lower.includes(kw);
  });
}

function extractRssImage(item: any): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item['media:content']?.$.url) return item['media:content'].$.url;
  if (item['media:thumbnail']?.$.url) return item['media:thumbnail'].$.url;
  if (typeof item.content === 'string') {
    const m = item.content.match(/<img[^>]+src="([^">]+)"/);
    if (m) return m[1];
  }
  return undefined;
}

async function fetchOgImage(articleUrl: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; AI-Universe/1.0; +https://ai-universe-pi.vercel.app)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return undefined;
    const html = await res.text();

    // Try og:image (property before content, or reversed)
    const ogMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );
    let candidate = ogMatch?.[1];

    if (!candidate) {
      const twMatch = html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      );
      candidate = twMatch?.[1];
    }

    if (!candidate) return undefined;

    // Normalise relative URLs
    if (candidate.startsWith('//')) candidate = 'https:' + candidate;
    else if (candidate.startsWith('/')) {
      candidate = new URL(articleUrl).origin + candidate;
    }

    return candidate;
  } catch {
    return undefined;
  }
}

export async function GET() {
  const parser = new Parser({
    timeout: 8000,
    headers: {
      'User-Agent': 'AI-Universe/1.0 (+https://ai-universe-pi.vercel.app)',
    },
  });

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.map((item: any) => {
        const rssImage = extractRssImage(item);
        return {
          title: item.title || 'Untitled',
          link: item.link || '#',
          source: feed.name,
          sourceLogo: getSourceLogo(feed.name),
          category: feed.category,
          pubDate: item.pubDate || new Date().toISOString(),
          snippet: String(item.contentSnippet || item.content || '')
            .replace(/<[^>]+>/g, '')
            .slice(0, 200),
          _rssImage: rssImage,
        };
      });
    } catch (error) {
      console.error(`[RSS] Failed to fetch ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  const allItems = results.flat();

  // Filter: title must contain a strong AI keyword
  const aiRelated = allItems.filter((item) => isAIRelated(item.title));

  // Sort newest first, take top 20
  const sorted = aiRelated
    .sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )
    .slice(0, 20);

  // Top 4 get OG image fetch (only if RSS didn't already provide one)
  const top4 = sorted.slice(0, 4);
  const rest = sorted.slice(4);

  const top4Enriched: NewsItem[] = await Promise.all(
    top4.map(async (item) => {
      let image = item._rssImage as string | undefined;
      if (!image) {
        image = await fetchOgImage(item.link);
      }
      const { _rssImage, ...rest } = item;
      return { ...rest, image };
    })
  );

  const restEnriched: NewsItem[] = rest.map((item) => {
    const { _rssImage, ...clean } = item;
    return { ...clean, image: _rssImage };
  });

  const final: NewsItem[] = [...top4Enriched, ...restEnriched];

  return NextResponse.json(final, {
    headers: {
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
    },
  });
}