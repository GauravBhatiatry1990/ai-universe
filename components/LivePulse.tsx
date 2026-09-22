import Link from 'next/link';

type TrendingTool = {
  name: string;
  slug: string;
  category: string;
  percent: number;
  featured?: boolean;
};

type UpdateItem = {
  text: string;
  time: string;
  icon: string;
};

const TRENDING: TrendingTool[] = [
  { name: 'ChatGPT', slug: 'chatgpt', category: 'Chatbots', percent: 12, featured: true },
  { name: 'Claude', slug: 'claude', category: 'Chatbots', percent: 8, featured: true },
  { name: 'Cursor', slug: 'cursor', category: 'Coding', percent: 15, featured: true },
  { name: 'DeepSeek', slug: 'deepseek', category: 'Chatbots', percent: 22, featured: true },
  { name: 'Sora', slug: 'sora', category: 'Video', percent: 9, featured: true },
];

const UPDATES: UpdateItem[] = [
  { text: 'OpenAI released GPT-5.6 to all Plus users', time: '2h ago', icon: '🟢' },
  { text: 'Anthropic announced Claude 4.2 with longer context', time: '4h ago', icon: '🟣' },
  { text: 'Google DeepMind published Gemini 3 research paper', time: '6h ago', icon: '🔵' },
  { text: 'Meta open-sourced Llama 4 Scout weights', time: '9h ago', icon: '🟠' },
  { text: 'Mistral launched Le Chat Pro with canvas mode', time: '12h ago', icon: '🟡' },
];

function Sparkline({ percent }: { percent: number }) {
  const points: string[] = [];
  const base = 30 - percent * 0.5;
  for (let i = 0; i < 12; i++) {
    const y = base + Math.sin(i * 0.9 + percent) * 4;
    points.push(`${i * 4},${Math.max(2, Math.min(20, y))}`);
  }
  const path = `M${points.join(' L')}`;
  return (
    <svg width="48" height="22" viewBox="0 0 48 22" className="shrink-0">
      <path
        d={path}
        fill="none"
        stroke="url(#sparkGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function LivePulse() {
  return (
    <>
      {/* Live Pulse */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            📊 Live Pulse
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>

        <p className="text-[11px] text-gray-500 mb-3 leading-snug">
          Real-time trending across AI tools (updated hourly)
        </p>

        <div className="space-y-2">
          {TRENDING.map((tool, i) => (
            <Link
              key={tool.slug}
              href={`/agent/${tool.slug}`}
              className="flex items-center gap-3 py-1.5 group"
            >
              <span className="w-4 text-xs font-bold text-gray-400">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                  {tool.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {tool.category}
                </div>
              </div>
              <Sparkline percent={tool.percent} />
              <span className="text-[10px] font-semibold text-green-600 shrink-0">
                ▲{tool.percent}%
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/#tools"
          className="mt-3 block text-center text-[11px] font-medium text-purple-600 hover:text-purple-700"
        >
          View full ranking →
        </Link>
      </div>

      {/* Updates */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            🔔 New in AI Universe
          </span>
          <Link
            href="/news"
            className="text-[10px] font-medium text-purple-600 hover:text-purple-700"
          >
            Live updates
          </Link>
        </div>

        <div className="space-y-3">
          {UPDATES.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-xs mt-0.5 shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-700 leading-snug">
                  {item.text}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>

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