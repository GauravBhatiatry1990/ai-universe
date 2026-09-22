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
  url?: string;
  bestFor?: string;
  features?: string[];
  pros?: string[];
  cons?: string[];
  alternatives?: string[];
};

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = (agents as Agent[]).find((a) => a.slug === slug);

  if (!agent) {
    notFound();
  }

  const alternatives =
    agent.alternatives?.map((altSlug) =>
      (agents as Agent[]).find((a) => a.slug === altSlug)
    ).filter(Boolean) ?? [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                  {agent.category}
                </span>
                <span className="text-sm text-gray-500">{agent.pricing}</span>
                {agent.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">{agent.tagline}</p>

          {agent.bestFor && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Best for:</span> {agent.bestFor}
              </p>
            </div>
          )}

          {agent.url && (
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Visit {agent.name} →
            </a>
          )}
        </div>

        {/* Features */}
        {agent.features && agent.features.length > 0 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Key Features
            </h2>
            <ul className="space-y-2">
              {agent.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pros & Cons */}
        {(agent.pros?.length || agent.cons?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {agent.pros && agent.pros.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold text-green-700 mb-4">
                  Pros
                </h2>
                <ul className="space-y-2">
                  {agent.pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-green-600 mt-0.5">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {agent.cons && agent.cons.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold text-red-700 mb-4">
                  Cons
                </h2>
                <ul className="space-y-2">
                  {agent.cons.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-red-600 mt-0.5">−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Alternatives to {agent.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map(
                (alt) =>
                  alt && (
                    <Link
                      key={alt.slug}
                      href={`/agent/${alt.slug}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition"
                    >
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {alt.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {alt.tagline}
                      </p>
                    </Link>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}