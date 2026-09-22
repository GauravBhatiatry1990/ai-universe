import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Agent = {
  id: number | string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing: string;
  featured?: boolean;
  bestFor?: string;
  features?: string[];
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateStaticParams() {
  const categories = Array.from(
    new Set((agents as Agent[]).map((a) => a.category))
  );
  return categories.map((c) => ({ slug: slugify(c) }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allAgents = agents as Agent[];
  const allCategories = Array.from(new Set(allAgents.map((a) => a.category)));

  const matchedCategory = allCategories.find((c) => slugify(c) === slug);
  if (!matchedCategory) {
    notFound();
  }

  const tools = allAgents
    .filter((a) => a.category === matchedCategory)
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  const otherCategories = allCategories
    .filter((c) => c !== matchedCategory)
    .sort();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-purple-300 mb-2 tracking-wider uppercase">
            Category
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {matchedCategory}
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} in this category
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {tools.map((agent) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.slug}`}
              className={
                "group relative rounded-2xl p-[1px] transition " +
                (agent.featured
                  ? "bg-gradient-to-br from-amber-400/60 via-yellow-500/30 to-orange-500/40 hover:from-amber-400 hover:via-yellow-500/60 hover:to-orange-500/70"
                  : "bg-white/[0.06] hover:bg-gradient-to-br hover:from-purple-500/50 hover:via-blue-500/50 hover:to-cyan-400/50")
              }
            >
              <div className="relative h-full rounded-2xl bg-[#0a0a0f] p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h2 className="text-xl font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-cyan-300 group-hover:bg-clip-text transition">
                    {agent.name}
                  </h2>
                  {agent.featured && (
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      ★ Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {agent.tagline}
                </p>

                {agent.features && agent.features.length > 0 && (
                  <ul className="mb-4 space-y-1">
                    {agent.features.slice(0, 2).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-gray-400"
                      >
                        <span className="text-cyan-400 mt-0.5">✓</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {agent.bestFor && (
                  <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">
                    Best for: {agent.bestFor}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300">
                    {agent.category}
                  </span>
                  <span className="text-xs text-gray-500">{agent.pricing}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Other categories */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Explore other categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c}
                href={`/category/${slugify(c)}`}
                className="rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 hover:text-white text-sm px-4 py-1.5 transition"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}