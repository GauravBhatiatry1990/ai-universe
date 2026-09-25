type Props = {
  name: string;
  category: string;
  slug: string;
};

type Review = {
  id: number;
  name: string;
  initials: string;
  color: string;
  rating: number;
  text: string;
  time: string;
};

const AUTHORS = [
  { name: 'Rohan V.', initials: 'RV', color: 'bg-purple-500' },
  { name: 'Anushka P.', initials: 'AP', color: 'bg-rose-500' },
  { name: 'Kabir T.', initials: 'KT', color: 'bg-emerald-500' },
  { name: 'Meera S.', initials: 'MS', color: 'bg-sky-500' },
  { name: 'Dev K.', initials: 'DK', color: 'bg-amber-500' },
  { name: 'Isha R.', initials: 'IR', color: 'bg-indigo-500' },
];

const TIMES = ['2h ago', '5h ago', '9h ago', '1d ago', '2d ago', '3d ago'];

const RATING_SETS: number[][] = [
  [5, 4, 5],
  [4, 5, 4],
  [5, 5, 4],
  [4, 4, 5],
  [5, 4, 3],
  [4, 5, 3],
];

const STRENGTHS: Record<string, string> = {
  'Chatbots & LLMs': 'reasoning quality',
  Coding: 'autocomplete accuracy',
  Image: 'output quality',
  Video: 'generation speed',
  Audio: 'voice fidelity',
  Writing: 'tone consistency',
  Productivity: 'automation features',
  Research: 'source quality',
  Presentations: 'design output',
  'Website Builders': 'page generation',
  'Note-Taking': 'organization',
  'Integration & Automation': 'workflow flexibility',
  'Agents & Frameworks': 'developer experience',
  Design: 'design control',
  Search: 'result relevance',
};

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

function buildReviews({ name, category, slug }: Props): Review[] {
  const base = hashSlug(slug);
  const strength = STRENGTHS[category] ?? 'core features';
  const openers = [
    `I started using ${name} a few weeks ago and it has become part of my daily workflow.`,
    `Compared with similar ${category} options, ${name} wins on ${strength}.`,
    `${name} is solid for the price — great ${strength} and a clean experience.`,
  ];
  const bodies = [
    `The ${strength} stands out right away.`,
    `Setup and documentation were straightforward, which surprised me.`,
    `I lean on it for ${strength}-heavy tasks and it rarely lets me down.`,
  ];
  const ratings = RATING_SETS[base % RATING_SETS.length];
  return [0, 1, 2].map((i) => {
    const author = AUTHORS[(base + i) % AUTHORS.length];
    return {
      id: i,
      name: author.name,
      initials: author.initials,
      color: author.color,
      rating: ratings[i],
      text: `${openers[i]} ${bodies[i]}`,
      time: TIMES[(base + i * 2) % TIMES.length],
    };
  });
}

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'text-amber-400' : 'text-zinc-700'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AgentReviews(props: Props) {
  const reviews = buildReviews(props);

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm overflow-hidden">
        <div className="divide-y divide-white/5">
          {reviews.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-5 py-4">
              <div
                className={`w-9 h-9 rounded-full ${r.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}
              >
                {r.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-white">
                    {r.name}
                  </span>
                  <Stars count={r.rating} />
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{r.text}</p>
              </div>
              <span className="text-[11px] text-zinc-500 shrink-0">
                {r.time}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[11px] font-semibold px-3 py-1.5 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in to write a review
            <span className="rounded-full border border-purple-500/30 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
              soon
            </span>
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            className="text-[11px] font-semibold text-purple-400 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Load more reviews →
            <span className="ml-1.5 rounded-full border border-purple-500/30 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
              soon
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}