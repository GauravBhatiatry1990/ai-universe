// app/api/trends/route.ts
import { NextResponse } from 'next/server';
import { getAliases } from '@/data/toolAliases';

// Tools we track for Live Pulse. Extend anytime.
const TRACKED = [
  { slug: 'chatgpt', name: 'ChatGPT', category: 'Chatbots' },
  { slug: 'claude', name: 'Claude', category: 'Chatbots' },
  { slug: 'gemini', name: 'Gemini', category: 'Chatbots' },
  { slug: 'cursor', name: 'Cursor', category: 'Coding' },
  { slug: 'copilot', name: 'GitHub Copilot', category: 'Coding' },
  { slug: 'deepseek', name: 'DeepSeek', category: 'Chatbots' },
  { slug: 'sora', name: 'Sora', category: 'Video' },
  { slug: 'midjourney', name: 'Midjourney', category: 'Image' },
  { slug: 'perplexity', name: 'Perplexity', category: 'Research' },
  { slug: 'grok', name: 'Grok', category: 'Chatbots' },
  { slug: 'llama', name: 'Llama', category: 'Chatbots' },
  { slug: 'runway', name: 'Runway', category: 'Video' },
  { slug: 'elevenlabs', name: 'ElevenLabs', category: 'Audio' },
  { slug: 'mistral', name: 'Mistral', category: 'Chatbots' },
  { slug: 'notion', name: 'Notion AI', category: 'Productivity' },
];

const RECENT_DAYS = 3;
const OLDER_DAYS = 6;

function countMentions(text: string, aliases: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const alias of aliases) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'gi');
    const matches = lower.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('news fetch failed');
    const items: { title: string; snippet?: string; pubDate: string }[] =
      await res.json();

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const results = TRACKED.map((tool) => {
      const aliases = getAliases(tool.slug, tool.name);
      let recent = 0;
      let older = 0;

      for (const item of items) {
        const age = (now - new Date(item.pubDate).getTime()) / DAY;
        if (age < 0 || age > OLDER_DAYS) continue;
        const text = `${item.title} ${item.snippet || ''}`;
        const count = countMentions(text, aliases);
        if (count === 0) continue;
        if (age <= RECENT_DAYS) recent += count;
        else older += count;
      }

      let percent = 0;
      let badge: 'up' | 'down' | 'new' | 'flat' = 'flat';

      if (recent > 0 && older > 0) {
        percent = Math.round(((recent - older) / older) * 100);
        badge = percent >= 0 ? 'up' : 'down';
        percent = Math.abs(percent);
      } else if (recent > 0 && older === 0) {
        percent = 100;
        badge = 'new';
      } else if (recent === 0 && older > 0) {
        percent = 100;
        badge = 'down';
      }

      return {
        slug: tool.slug,
        name: tool.name,
        category: tool.category,
        recent,
        older,
        total: recent + older,
        percent,
        badge,
      };
    });

    const active = results.filter((r) => r.total > 0);
    active.sort((a, b) => b.total - a.total || b.percent - a.percent);
    const top5 = active.slice(0, 5);

    return NextResponse.json(top5, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('[Trends] failed:', error);
    return NextResponse.json([], { status: 500 });
  }
}