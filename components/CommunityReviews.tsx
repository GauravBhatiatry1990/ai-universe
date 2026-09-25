import Link from 'next/link';
import { getLatestReviews } from '../lib/reviews';
import { getAgentMeta } from '../lib/agentLookup';
import Stars from './Stars';
import { formatRelativeTime } from '../lib/time';
import { initialsOf } from '../lib/initials';

export default async function CommunityReviews() {
  const reviews = await getLatestReviews(3);

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">💬</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Community Reviews
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm">
        <div className="divide-y divide-white/5">
          {reviews.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">
              No reviews yet — share your experience by signing in.
            </p>
          )}
          {reviews.map((r) => {
            const meta = getAgentMeta(r.slug);
            return (
              <div key={r.id} className="flex items-start gap-3 px-5 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                  {initialsOf(r.display_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-white">{r.display_name}</span>
                    <Stars count={r.rating} />
                    {meta ? (
                      <Link
                        href={`/agent/${r.slug}`}
                        className="text-xs text-purple-400 transition hover:text-purple-300"
                      >
                        on {meta.name} →
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-500">on {r.slug}</span>
                    )}
                  </div>
                  {r.comment && (
                    <p className="text-xs leading-relaxed text-zinc-400">{r.comment}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-zinc-500">
                  {formatRelativeTime(r.created_at)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            Sign in to write a review →
          </Link>
        </div>
      </div>
    </section>
  );
}