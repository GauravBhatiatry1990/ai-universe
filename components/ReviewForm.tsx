'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { upsertReview, deleteReview } from '../lib/reviews-client';
import { revalidateReviews } from '../lib/review-actions';
import type { MyReview } from '../lib/reviews';

type Props = { slug: string; myReview: MyReview | null; userId: string };

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={`text-xl transition ${n <= value ? 'text-amber-400' : 'text-zinc-700 hover:text-zinc-500'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewForm({ slug, myReview, userId }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [comment, setComment] = useState(myReview?.comment ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Pick a star rating (1–5).');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await upsertReview({ userId, slug, rating, comment: comment.trim() });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    await revalidateReviews();
    router.refresh();
  };

  const handleDelete = async () => {
    if (!myReview) return;
    if (!window.confirm('Delete your review for this tool?')) return;
    setSubmitting(true);
    setError('');
    const result = await deleteReview(myReview.id);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    await revalidateReviews();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          rows={3}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)…"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : myReview ? 'Update review' : 'Submit review'}
        </button>
        {myReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}