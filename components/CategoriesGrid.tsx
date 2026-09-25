import Link from 'next/link';
import agents from '../data/agents.json';
import { slugify } from '../lib/slugify';

type Agent = {
  category: string;
};

export default function CategoriesGrid() {
  const all = agents as Agent[];
  const categories = Array.from(new Set(all.map((a) => a.category))).sort();

  const withCounts = categories
    .map((category) => ({
      category,
      count: all.filter((a) => a.category === category).length,
      slug: slugify(category),
    }))
    .filter((c) => c.slug.length > 0 && c.count > 0);

  if (withCounts.length === 0) return null;

  return (
    <section id="categories">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">📂</span>
          <h2 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
            Browse Categories
          </h2>
        </div>
        <Link
          href="/#tools"
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          All tools →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {withCounts.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <span className="text-sm font-medium text-zinc-200 group-hover:text-purple-300 transition truncate">
              {c.category}
            </span>
            <span className="shrink-0 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
              {c.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}