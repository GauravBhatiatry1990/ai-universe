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
    agent.alternatives
      ?.map((altSlug) => (agents as Agent[]).find((a) => a.slug === altSlug))
      .filter(Boolean) ?? [];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-cyan-400/40 mb-6">
          <div className="rounded-2xl bg-[#0a0a0f] p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    {agent.name}
                  </span>
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300">
                    {agent.category}
                  </span>
                  <span className="text-sm text-gray-400">{agent.pricing}</span>
                  {agent.featured && (
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2.5 py-1 rounded-full">
                      ★ Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-300 mb-6">{agent.tagline}</p>

            {agent.bestFor && (
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/[0.06] p-4 mb-6">
                <p className="text-sm text-purple-200">
                  <span className="font-semibold text-purple-300">Best for:</span>{" "}
                  {agent.bestFor}
                </p>
              </div>
            )}

            {agent.url && (
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-medium px-6 py-3 transition shadow-lg shadow-purple-500/20"
              >
                Visit {agent.name} →
              </a>
            )}
          </div>
        </div>

        {/* Features */}
        {agent.features && agent.features.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur p-8 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Key Features
            </h2>
            <ul className="space-y-2">
              {agent.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-300">
                  <span className="text-cyan-400 mt-1">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pros & Cons */}
        {(agent.pros?.length || agent.cons?.length) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            {agent.pros && agent.pros.length > 0 && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-6">
                <h2 className="text-xl font-semibold text-green-400 mb-4">
                  Pros
                </h2>
                <ul className="space-y-2">
                  {agent.pros.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-gray-300 text-sm"
                    >
                      <span className="text-green-400 mt-0.5">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {agent.cons && agent.cons.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Cons</h2>
                <ul className="space-y-2">
                  {agent.cons.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-gray-300 text-sm"
                    >
                      <span className="text-red-400 mt-0.5">−</span>
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Alternatives to {agent.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map(
                (alt) =>
                  alt && (
                    <Link
                      key={alt.slug}
                      href={`/agent/${alt.slug}`}
                      className="group rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-purple-500/40 hover:bg-white/[0.04] transition"
                    >
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition mb-1">
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