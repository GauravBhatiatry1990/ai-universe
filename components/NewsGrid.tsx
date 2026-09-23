import Link from "next/link";

type Story = {
  id: number;
  title: string;
  summary: string;
  time: string;
  source: string;
};

const FEATURED: Story = {
  id: 1,
  title: "OpenAI unveils GPT-5 with major advances in reasoning and reliability",
  summary:
    "OpenAI has officially launched GPT-5, its most capable model to date, with significant improvements in reasoning, factual accuracy and tool use.",
  time: "2h ago",
  source: "OpenAI",
};

const SIDE_STORIES: Story[] = [
  {
    id: 2,
    title: "Google rolls out Gemini 2.5 Pro with stronger coding and multimodal abilities",
    summary: "",
    time: "4h ago",
    source: "Google DeepMind",
  },
  {
    id: 3,
    title: "Microsoft integrates Copilot across Office apps for all users",
    summary: "",
    time: "6h ago",
    source: "Microsoft",
  },
  {
    id: 4,
    title: "Meta announces Llama 4 with improved reasoning and multilingual support",
    summary: "",
    time: "8h ago",
    source: "Meta AI",
  },
];

function StoryThumb({ seed }: { seed: number }) {
  const gradients = [
    "from-purple-500/30 to-blue-500/30",
    "from-blue-500/30 to-cyan-400/30",
    "from-emerald-500/30 to-teal-400/30",
    "from-rose-500/30 to-orange-400/30",
  ];
  return (
    <div
      className={`rounded-lg bg-gradient-to-br ${gradients[seed % gradients.length]} w-20 h-20 shrink-0`}
    />
  );
}

export default function NewsGrid() {
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
        {/* Featured */}
        <Link
          href="/news"
          className="lg:col-span-2 group block rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-purple-200 transition"
        >
          <div className="h-52 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-400/20 relative flex items-center justify-center">
            <span className="text-5xl opacity-25">🧠</span>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug mb-2 group-hover:text-purple-700 transition">
              {FEATURED.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
              {FEATURED.summary}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span>{FEATURED.source}</span>
              <span>·</span>
              <span>{FEATURED.time}</span>
            </div>
          </div>
        </Link>

        {/* Side stories — natural height, no stretching */}
        <div className="space-y-4">
          {SIDE_STORIES.map((story) => (
            <Link
              key={story.id}
              href="/news"
              className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:border-purple-200 transition"
            >
              <StoryThumb seed={story.id} />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-purple-700 transition">
                  {story.title}
                </h4>
                <div className="text-[11px] text-gray-400">
                  {story.source} · {story.time}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}