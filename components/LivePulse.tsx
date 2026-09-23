'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolLogo from './ToolLogo';

type Trend = {
  slug: string;
  name: string;
  category: string;
  recent: number;
  older: number;
  total: number;
  percent: number;
  badge: 'up' | 'down' | 'new' | 'flat';
};

type NewsUpdate = {
  title: string;
  source: string;
  pubDate: string;
  link: string;
};

function Sparkline({ percent, badge, seed }: { percent: number; badge: string; seed: number }) {
  const width = 44;
  const height = 20;
  const baseY = height / 2;
  const amplitude = 5.5;
  const direction = badge === 'down' ? -1 : 1;
  const points: string[] = [];

  for (let i = 0; i < 12; i++) {
    const wave =
      Math.sin(i * 0.7 + seed * 1.3) * amplitude +
      Math.cos(i * 0.4 + seed) * (amplitude * 0.4);
    const trend = (i / 11) * ((percent / 100) * 8 * direction);
    const y = baseY - wave - trend;
    points.push(`${(i * width) / 11},${y.toFixed(1)}`);
  }

  const path = `M${points.join(' L')}`;
  const gradId = `sparkGrad-${seed}`;
  const start = badge === 'down' ? '#ef4444' : '#a855f7';
  const end = badge === 'down' ? '#f97316' : '#3b82f6';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <path d={path} fill="none" stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={start} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function timeAgo(dateString: string): string {
  const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function scrollToTools(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
}

export default function LivePulse() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [t, n] = await Promise.all([
          fetch('/api/trends').then((r) => r.json()),
          fetch('/api/news').then((r) => r.json()),
        ]);
        if (!cancelled) {
          setTrends(Array.isArray(t) ? t : []);
          setUpdates(Array.isArray(n) ? n.slice(0, 4) : []);
        }
      } catch (err) {
        console.error('LivePulse:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            📊 Live Pulse
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <span className={`w-1 h-1 rounded-full ${loading ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
            LIVE
          </span>
        </div>

        <p className="text-[11px] text-gray-500 mb-3 leading-snug">
          Trending across AI news (updated every 10 min)
        </p>

        {loading && (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 animate-pulse">
                <div className="w-3.5 h-3 bg-gray-100 rounded" />
                <div className="w-5 h-5 bg-gray-100 rounded" />
                <div className="flex-1 h-3 bg-gray-100 rounded" />
                <div className="w-10 h-3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && trends.length === 0 && (
          <p className="text-[11px] text-gray-400 py-3 text-center">
            Quiet day in AI news.
          </p>
        )}

        {!loading && trends.length > 0 && (
          <div className="space-y-1.5">
            {trends.map((tool, i) => (
              <Link
                key={tool.slug}
                href={`/agent/${tool.slug}`}
                className="flex items-center gap-2 py-1.5 group"
              >
                <span className="w-3.5 text-[11px] font-bold text-gray-400">
                  {i + 1}
                </span>
                <ToolLogo slug={tool.slug} size={18} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                    {tool.name}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {tool.category}
                  </div>
                </div>
                <Sparkline percent={tool.percent} badge={tool.badge} seed={i + 1} />
                <span
                  className={
                    'text-[10px] font-semibold shrink-0 w-12 text-right ' +
                    (tool.badge === 'down'
                      ? 'text-rose-600'
                      : tool.badge === 'new'
                      ? 'text-purple-600'
                      : 'text-green-600')
                  }
                >
                  {tool.badge === 'new'
                    ? 'NEW'
                    : tool.badge === 'down'
                    ? `▼${tool.percent}%`
                    : `▲${tool.percent}%`}
                </span>
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={scrollToTools}
          className="mt-3 block w-full text-center text-[11px] font-medium text-purple-600 hover:text-purple-700"
        >
          View full ranking →
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            🔔 New in AI Universe
          </span>
          <Link href="/news" className="text-[10px] font-medium text-purple-600 hover:text-purple-700">
            Live updates
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2.5 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-200 mt-1.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-2 bg-gray-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && updates.length === 0 && (
          <p className="text-[11px] text-gray-400 py-3 text-center">
            No new updates right now.
          </p>
        )}

        {!loading && updates.length > 0 && (
          <div className="space-y-3">
            {updates.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 group"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0 group-hover:bg-purple-600 transition" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-700 leading-snug line-clamp-2 group-hover:text-purple-700 transition">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.source} · {timeAgo(item.pubDate)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        <Link
          href="/news"
          className="mt-4 block text-center text-[11px] font-medium text-purple-600 hover:text-purple-700"
        >
          View all updates →
        </Link>
      </div>
    </>
  );
}