'use client';

import Link from 'next/link';
import Stars from './Stars';
import ReviewForm from './ReviewForm';
import { formatRelativeTime } from '../lib/time';
import { initialsOf } from '../lib/initials';
import type { ReviewRow, ToolStats, MyReview } from '../lib/reviews';

type Props = {
  slug: string;
  reviews: ReviewRow[];
  stats: ToolStats;
  myReview: MyReview | null;
  userId: string | null;
};

export default function AgentReviews({ slug, reviews, stats, myReview, userId }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm">
      {stats.review_count > 0 && (
        <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
          <Stars count={Math.round(stats.avg_rating ?? 0)} />
          <span className="text-xs text-zinc-400">
            {(stats.avg_rating ?? 0).toFixed(1)} average · {stats.review_count}{' '}
            review{stats.review_count === 1 ? '' : 's'}
          </span>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {reviews.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">
            No reviews yet — be the first.
          </p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="flex items-start gap-3 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
              {initialsOf(r.display_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-white">{r.display_name}</span>
                <Stars count={r.rating} />
              </div>
              {r.comment && (
                <p className="text-xs leading-relaxed text-zinc-400">{r.comment}</p>
              )}
            </div>
            <span className="shrink-0 text-[11px] text-zinc-500">
              {formatRelativeTime(r.created_at)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4">
        {userId ? (
          <ReviewForm
            key={myReview?.id ?? 'new'}
            slug={slug}
            myReview={myReview}
            userId={userId}
          />
        ) : (
          <Link
            href={`/login?next=/agent/${slug}#reviews`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
          >
            Sign in to write a review →
          </Link>
        )}
      </div>
    </div>
  );
}