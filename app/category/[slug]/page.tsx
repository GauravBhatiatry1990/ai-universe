import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ToolLogo from '../../../components/ToolLogo';

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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-purple-600 mb-2 tracking-wider uppercase">
            Category
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {matchedCategory}
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} in this category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {tools.map((agent) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.slug}`}
              className={
                "group rounded-2xl border p-6 flex flex-col transition " +
                (agent.featured
                  ? "bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100"
                  : "bg-white border-gray-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50")
              }
            >
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ToolLogo slug={agent.slug} size={28} />
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                    {agent.name}
                  </h2>
                </div>
                {agent.featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    ★ Featured
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {agent.tagline}
              </p>

              {agent.features && agent.features.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {agent.features.slice(0, 2).map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-gray-600"
                    >
                      <span className="text-blue-500 mt-0.5">✓</span>
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
                <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  {agent.category}
                </span>
                <span className="text-xs text-gray-500">{agent.pricing}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Explore other categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c}
                href={`/category/${slugify(c)}`}
                className="rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm px-4 py-1.5 transition"
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