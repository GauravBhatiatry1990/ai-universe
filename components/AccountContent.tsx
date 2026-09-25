'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import ToolLogo from './ToolLogo';
import Stars from './Stars';
import { removeFavorite } from '../lib/favorites-client';
import { deleteReview } from '../lib/reviews-client';
import { getBrowserClient } from '../lib/supabase/client';
import { formatRelativeTime } from '../lib/time';
import type { FavoriteAgent } from '../lib/favorites';
import type { MyReviewWithAgent } from '../lib/reviews';

type Props = {
  userId: string;
  email: string;
  displayName: string;
  favorites: FavoriteAgent[];
  reviews: MyReviewWithAgent[];
};

export default function AccountContent({
  userId,
  email,
  displayName,
  favorites,
  reviews,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [error, setError] = useState('');

  const saveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) {
      setProfileError('Authentication is not configured yet.');
      return;
    }
    setSaving(true);
    setProfileError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('id', userId);
    setSaving(false);
    if (err) {
      setProfileError(err.message);
      return;
    }
    router.refresh();
  };

  const handleRemoveFavorite = async (slug: string) => {
    setError('');
    const result = await removeFavorite(slug);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    setError('');
    const result = await deleteReview(reviewId);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold text-white">My account</h1>
        <p className="mt-1 text-sm text-zinc-400">{email}</p>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Saved tools</h2>
        {favorites.length === 0 && (
          <p className="text-sm text-zinc-500">No saved tools yet.</p>
        )}
        <ul className="divide-y divide-white/5">
          {favorites.map((f) => (
            <li key={f.slug} className="flex items-center gap-3 py-3">
              <ToolLogo slug={f.slug} size={32} />
              <Link
                href={`/agent/${f.slug}`}
                className="min-w-0 flex-1 transition hover:text-purple-300"
              >
                <span className="block truncate text-sm font-semibold text-white">{f.name}</span>
                <span className="block truncate text-xs text-zinc-400">{f.tagline}</span>
              </Link>
              <button
                type="button"
                onClick={() => handleRemoveFavorite(f.slug)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-rose-500/40 hover:text-rose-300"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Your reviews</h2>
        {reviews.length === 0 && (
          <p className="text-sm text-zinc-500">
            You haven&apos;t reviewed any tools yet.
          </p>
        )}
        <ul className="divide-y divide-white/5">
          {reviews.map((r) => (
            <li key={r.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/agent/${r.slug}#reviews`}
                    className="text-sm font-semibold text-purple-300 transition hover:text-purple-200"
                  >
                    {r.agentName}
                  </Link>
                  <Stars count={r.rating} />
                  <span className="text-[11px] text-zinc-500">
                    {formatRelativeTime(r.created_at)}
                  </span>
                </div>
                {r.comment && <p className="mt-1 text-xs text-zinc-400">{r.comment}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteReview(r.id)}
                className="shrink-0 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Profile</h2>
        <form onSubmit={saveName} className="space-y-3">
          <label htmlFor="profile-name" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Display name
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
          />
          {profileError && <p className="text-xs text-rose-400">{profileError}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save display name'}
          </button>
        </form>
        <p className="mt-4 text-xs text-zinc-500">
          Your display name appears next to the reviews you write.
        </p>
      </div>
    </div>
  );
}