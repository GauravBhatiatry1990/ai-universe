import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsletterSignup from '../../../components/NewsletterSignup';
import ToolLogo from '../../../components/ToolLogo';
import AppShell from '../../../components/AppShell';
import AgentTabs from '../../../components/AgentTabs';
import type { TabSection } from '../../../components/AgentTabs';
import AgentReviews from '../../../components/AgentReviews';
import SponsoredBadge from '../../../components/SponsoredBadge';
import FavoriteButton from '../../../components/FavoriteButton';
import { getCurrentUser } from '../../../lib/supabase/auth';
import { getIsFavorite } from '../../../lib/favorites';
import { getReviewsForSlug, getToolStats, getMyReview } from '../../../lib/reviews';

type Agent = {
  id: number | string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing: string;
  featured?: boolean;
  sponsored?: boolean;
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

  const user = await getCurrentUser();
  const [reviews, stats, myReview, isFavorite] = await Promise.all([
    getReviewsForSlug(agent.slug),
    getToolStats(agent.slug),
    user ? getMyReview(agent.slug, user.id) : Promise.resolve(null),
    user ? getIsFavorite(agent.slug, user.id) : Promise.resolve(false),
  ]);

  const alternatives =
    agent.alternatives
      ?.map((altSlug) => (agents as Agent[]).find((a) => a.slug === altSlug))
      .filter(Boolean) ?? [];

  const sections: TabSection[] = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          <h2 className="text-2xl font-semibold text-white mb-5">
            At a glance
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Pricing
              </dt>
              <dd className="text-sm text-zinc-200 mt-1">{agent.pricing}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Category
              </dt>
              <dd className="text-sm text-zinc-200 mt-1">{agent.category}</dd>
            </div>
            {agent.url && (
              <div>
                <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Website
                </dt>
                <dd className="text-sm mt-1">
                  <a
                    href={agent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition"
                  >
                    {agent.url.replace(/^https?:\/\//, '')} ↗
                  </a>
                </dd>
              </div>
            )}
            {agent.bestFor && (
              <div>
                <dt className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Best for
                </dt>
                <dd className="text-sm text-zinc-200 mt-1">{agent.bestFor}</dd>
              </div>
            )}
          </dl>
        </div>
      ),
    },
    {
      id: 'features',
      label: 'Features & Pros/Cons',
      content: (
        <>
          {agent.features && agent.features.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Key Features
              </h2>
              <ul className="space-y-2">
                {agent.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-purple-400 mt-1 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(agent.pros?.length || agent.cons?.length) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {agent.pros && agent.pros.length > 0 && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-6">
                  <h2 className="text-xl font-semibold text-green-400 mb-4">
                    Pros
                  </h2>
                  <ul className="space-y-2">
                    {agent.pros.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-zinc-300 text-sm"
                      >
                        <span className="text-green-400 mt-0.5 font-bold">
                          +
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {agent.cons && agent.cons.length > 0 && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6">
                  <h2 className="text-xl font-semibold text-red-400 mb-4">
                    Cons
                  </h2>
                  <ul className="space-y-2">
                    {agent.cons.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-2 text-zinc-300 text-sm"
                      >
                        <span className="text-red-400 mt-0.5 font-bold">
                          −
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      ),
    },
    {
      id: 'reviews',
      label: 'Community Reviews',
      count: stats.review_count,
      content: (
        <AgentReviews
          slug={agent.slug}
          reviews={reviews}
          stats={stats}
          myReview={myReview}
        />
      ),
    },
    {
      id: 'alternatives',
      label: 'Alternatives',
      content:
        alternatives.length > 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Alternatives to {agent.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternatives.map((alt) => {
                if (!alt) return null;
                return (
                  <Link
                    key={alt.slug}
                    href={`/agent/${alt.slug}`}
                    className="group rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:border-purple-500/40 hover:bg-purple-500/[0.05] transition"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <ToolLogo slug={alt.slug} size={24} />
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition truncate">
                        {alt.name}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {alt.tagline}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-zinc-400">
              No alternatives listed yet.
            </p>
          </div>
        ),
    },
  ];

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 text-sm font-medium inline-block mb-6 transition"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 mb-6 shadow-lg shadow-purple-950/20">
          <div className="flex items-start gap-5 mb-6">
            <div className="shrink-0">
              <ToolLogo
                slug={agent.slug}
                size={72}
                className="rounded-xl border border-white/10 bg-white/5 p-1.5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {agent.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300">
                  {agent.category}
                </span>
                {agent.sponsored && <SponsoredBadge />}
                {agent.featured && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md shadow-orange-500/20">
                    ★ Featured
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-lg text-zinc-300 mb-6">{agent.tagline}</p>

          <div className="flex items-center gap-3 flex-wrap">
            {agent.url && (
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold px-6 py-3 transition shadow-lg shadow-purple-500/30"
              >
                Visit {agent.name} →
              </a>
            )}
            <Link
              href={`/claim/${agent.slug}`}
              className="inline-block rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 font-semibold px-6 py-3 transition"
            >
              Claim this Profile
            </Link>
            <FavoriteButton slug={agent.slug} initialFavorited={isFavorite} />
          </div>
        </div>

        <AgentTabs sections={sections} />

        <div className="mt-12">
          <NewsletterSignup />
        </div>
      </div>
    </AppShell>
  );
}