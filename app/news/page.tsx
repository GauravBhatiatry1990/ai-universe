import Link from 'next/link';
import Parser from 'rss-parser';
import { RSS_FEEDS } from '../../data/rssFeeds';
import AppShell from '../../components/AppShell';

export const revalidate = 3600; // refresh every 1 hour

type Article = {
  title: string;
  link: string;
  pubDate: string;
  snippet: string;
  source: string;
  category: string;
};

async function fetchFeed(
  parser: Parser,
  feed: { name: string; url: string; category: string }
): Promise<Article[]> {
  try {
    const res = await fetch(feed.url, {
      next: { revalidate: 3600 },
      headers: { 'User-Agent': 'AIUniverse/1.0' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = await parser.parseString(xml);
    return (parsed.items || []).slice(0, 4).map((item) => ({
      title: item.title || 'Untitled',
      link: item.link || '#',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      snippet: (item.contentSnippet || item.content || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200),
      source: feed.name,
      category: feed.category,
    }));
  } catch {
    return [];
  }
}

async function getNews(): Promise<Article[]> {
  const parser = new Parser({
    timeout: 8000,
    headers: { 'User-Agent': 'AIUniverse/1.0' },
  });

  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeed(parser, feed))
  );

  const articles: Article[] = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled') articles.push(...r.value);
  });

  return articles
    .sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    )
    .slice(0, 40);
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function NewsPage() {
  const articles = await getNews();

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-[1100px] mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6 transition"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="text-center mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Live — Updated hourly
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              AI News
            </span>
          </h1>
          <p className="text-lg text-zinc-400">
            Latest AI stories from {RSS_FEEDS.length} trusted sources.
          </p>
        </div>

        {/* Articles */}
        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article, i) => (
              <a
                key={`${article.link}-${i}`}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10 transition"
              >
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 font-medium text-purple-300">
                    {article.category}
                  </span>
                  <span className="text-zinc-500 font-medium">
                    {article.source}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-400">
                    {timeAgo(article.pubDate)}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-white group-hover:text-purple-300 transition mb-2">
                  {article.title}
                </h2>

                {article.snippet && (
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {article.snippet}
                  </p>
                )}

                <span className="mt-3 inline-block text-sm text-purple-400 group-hover:text-purple-300 font-medium">
                  Read full story →
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-zinc-400">
              Unable to load news right now. Try refreshing in a minute.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-zinc-500 mt-12">
          News sourced from public RSS feeds. Auto-refreshes every hour.
        </p>
      </div>
    </AppShell>
  );
}