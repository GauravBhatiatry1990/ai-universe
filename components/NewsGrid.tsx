// components/NewsGrid.tsx
import Link from 'next/link';
import NewsThumbnail from './NewsThumbnail';

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

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
  } catch (error) {
    console.error('NewsGrid fetch error:', error);
    return [];
  }
}

export default async function NewsGrid() {
  const news = await getNews();

  if (!news || news.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
            Latest in AI
          </h2>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            News is temporarily unavailable. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  const featured = news[0];
  const sideStories = news.slice(1, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
            Latest in AI
          </h2>
        </div>
        <Link
          href="/news"
          className="text-xs font-semibold text-purple-600 hover:text-purple-700"
        >
          All AI news →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Link
          href={featured.link}
          target="_blank"
          rel="noopener noreferrer"
          className="lg:col-span-2 group block rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-purple-200 transition"
        >
          <div className="h-52 relative overflow-hidden bg-gray-50">
            <NewsThumbnail
              image={featured.image}
              sourceLogo={featured.sourceLogo}
              alt={featured.title}
              size="large"
            />
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug mb-2 group-hover:text-purple-700 transition line-clamp-3">
              {featured.title}
            </h3>
            {featured.snippet && (
              <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                {featured.snippet}
              </p>
            )}
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>{featured.source}</span>
              <span>·</span>
              <span>{timeAgo(featured.pubDate)}</span>
            </div>
          </div>
        </Link>

        <div className="space-y-4">
          {sideStories.map((story) => (
            <Link
              key={story.link}
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:border-purple-200 transition"
            >
              <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-50">
                <NewsThumbnail
                  image={story.image}
                  sourceLogo={story.sourceLogo}
                  alt={story.title}
                  size="small"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-purple-700 transition">
                  {story.title}
                </h4>
                <div className="text-[11px] text-gray-400">
                  {story.source} · {timeAgo(story.pubDate)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}