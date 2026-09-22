import Link from 'next/link';
import ToolLogo from './ToolLogo';

type TrendingTool = {
  name: string;
  slug: string;
  category: string;
  percent: number;
};

type UpdateItem = {
  text: string;
  time: string;
  icon: string;
};

const TRENDING: TrendingTool[] = [
  { name: 'ChatGPT', slug: 'chatgpt', category: 'Chatbots', percent: 12 },
  { name: 'Claude', slug: 'claude', category: 'Chatbots', percent: 8 },
  { name: 'Cursor', slug: 'cursor', category: 'Coding', percent: 15 },
  { name: 'DeepSeek', slug: 'deepseek', category: 'Chatbots', percent: 22 },
  { name: 'Sora', slug: 'sora', category: 'Video', percent: 9 },
];

const UPDATES: UpdateItem[] = [
  { text: 'OpenAI released GPT-5.6 to all Plus users', time: '2h ago', icon: '🟢' },
  { text: 'Anthropic announced Claude 4.2 with longer context', time: '4h ago', icon: '🟣' },
  { text: 'Google DeepMind published Gemini 3 research paper', time: '6h ago', icon: '🔵' },
  { text: 'Meta open-sourced Llama 4 Scout weights', time: '9h ago', icon: '🟠' },
  { text: 'Mistral launched Le Chat Pro with canvas mode', time: '12h ago', icon: '🟡' },
];

function Sparkline({ percent, seed }: { percent: number; seed: number }) {
  const width = 44;
  const height = 20;
  const baseY = height / 2;
  const amplitude = 5.5;

  const points: string[] = [];
  for (let i = 0; i < 12; i++) {
    const wave =
      Math.sin(i * 0.7 + seed * 1.3) * amplitude +
      Math.cos(i * 0.4 + seed) * (amplitude * 0.4);
    const trend = (i / 11) * (percent / 4);
    const y = baseY - wave - trend;
    points.push(`${(i * width) / 11},${y.toFixed(1)}`);
  }

  const path = `M${points.join(' L')}`;
  const gradId = `sparkGrad-${seed}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
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

        <div className="space-y-1.5">
          {TRENDING.map((tool, i) => (
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
              <Sparkline percent={tool.percent} seed={i + 1} />
              <span className="text-[10px] font-semibold text-green-600 shrink-0 w-10 text-right">
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