import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsletterSignup from '../../../components/NewsletterSignup';
import ToolLogo from '../../../components/ToolLogo';

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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-5 mb-6">
            <div className="shrink-0">
              <ToolLogo slug={agent.slug} size={72} className="rounded-xl border border-gray-100 p-1.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                  {agent.category}
                </span>
                <span className="text-sm text-gray-500">{agent.pricing}</span>
                {agent.featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">{agent.tagline}</p>

          {agent.bestFor && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 mb-6">
              <p className="text-sm text-purple-900">
                <span className="font-semibold text-purple-700">Best for:</span>{' '}
                {agent.bestFor}
              </p>
            </div>
          )}

          {agent.url && (
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-md shadow-purple-200"
            >
              Visit {agent.name} →
            </a>
          )}
        </div>

        {/* Features */}
        {agent.features && agent.features.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Key Features
            </h2>
            <ul className="space-y-2">
              {agent.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-500 mt-1 font-bold">✓</span>
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
              <div className="rounded-2xl border border-green-200 bg-green-50/60 p-6">
                <h2 className="text-xl font-semibold text-green-700 mb-4">
                  Pros
                </h2>
                <ul className="space-y-2">
                  {agent.pros.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-gray-700 text-sm"
                    >
                      <span className="text-green-600 mt-0.5 font-bold">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {agent.cons && agent.cons.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
                <h2 className="text-xl font-semibold text-red-700 mb-4">
                  Cons
                </h2>
                <ul className="space-y-2">
                  {agent.cons.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-gray-700 text-sm"
                    >
                      <span className="text-red-600 mt-0.5 font-bold">−</span>
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
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Alternatives to {agent.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((alt) => {
                if (!alt) return null;
                return (
                  <Link
                    key={alt.slug}
                    href={`/agent/${alt.slug}`}
                    className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <ToolLogo slug={alt.slug} size={24} />
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                        {alt.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {alt.tagline}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12">
          <NewsletterSignup />
        </div>
      </div>
    </main>
  );
}agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsletterSignup from '../../../components/NewsletterSignup';
import { getLogoUrl } from '../../../data/toolDomains';

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

  const logoUrl = getLogoUrl(agent.slug);

  const alternatives =
    agent.alternatives
      ?.map((altSlug) => (agents as Agent[]).find((a) => a.slug === altSlug))
      .filter(Boolean) ?? [];

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
          <div className="flex items-start gap-5 mb-6">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={agent.name}
                width={72}
                height={72}
                className="rounded-xl shrink-0 bg-white object-contain border border-gray-100 p-1.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                  {agent.category}
                </span>
                <span className="text-sm text-gray-500">{agent.pricing}</span>
                {agent.featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">{agent.tagline}</p>

          {agent.bestFor && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 mb-6">
              <p className="text-sm text-purple-900">
                <span className="font-semibold text-purple-700">Best for:</span>{' '}
                {agent.bestFor}
              </p>
            </div>
          )}

          {agent.url && (
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-md shadow-purple-200"
            >
              Visit {agent.name} →
            </a>
          )}
        </div>

        {/* Features */}
        {agent.features && agent.features.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Key Features
            </h2>
            <ul className="space-y-2">
              {agent.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-700">
                  <span className="text-purple-500 mt-1 font-bold">✓</span>
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
              <div className="rounded-2xl border border-green-200 bg-green-50/60 p-6">
                <h2 className="text-xl font-semibold text-green-700 mb-4">
                  Pros
                </h2>
                <ul className="space-y-2">
                  {agent.pros.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-gray-700 text-sm"
                    >
                      <span className="text-green-600 mt-0.5 font-bold">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {agent.cons && agent.cons.length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
                <h2 className="text-xl font-semibold text-red-700 mb-4">
                  Cons
                </h2>
                <ul className="space-y-2">
                  {agent.cons.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-gray-700 text-sm"
                    >
                      <span className="text-red-600 mt-0.5 font-bold">−</span>
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
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Alternatives to {agent.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((alt) => {
                if (!alt) return null;
                const altLogo = getLogoUrl(alt.slug);
                return (
                  <Link
                    key={alt.slug}
                    href={`/agent/${alt.slug}`}
                    className="group rounded-lg border border-gray-200 bg-white p-4 hover:border-purple-300 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      {altLogo && (
                        <img
                          src={altLogo}
                          alt=""
                          width={24}
                          height={24}
                          className="rounded-md shrink-0 bg-white object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                        {alt.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {alt.tagline}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12">
          <NewsletterSignup />
        </div>
      </div>
    </main>
  );
}