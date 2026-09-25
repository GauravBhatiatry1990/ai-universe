'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { addFavorite, removeFavorite } from '../lib/favorites-client';

type Props = { slug: string; initialFavorited: boolean };

export default function FavoriteButton({ slug, initialFavorited }: Props) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleToggle() {
    setSubmitting(true);
    setError('');
    const target = !favorited;
    setFavorited(target);
    const result = target ? await addFavorite(slug) : await removeFavorite(slug);
    setSubmitting(false);
    if (!result.ok) {
      setFavorited(!target);
      setError(result.message);
      return;
    }
    router.refresh();
  }

  if (loading) {
    return <span className="inline-block h-11 w-32 rounded-lg border border-white/10 bg-white/[0.03]" />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=/agent/${slug}`}
        className="inline-block rounded-lg border border-purple-500/40 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/10 hover:text-purple-200"
      >
        ☆ Bookmark
      </Link>
    );
  }

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={submitting}
        aria-pressed={favorited}
        className="inline-block rounded-lg border border-purple-500/40 px-6 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/10 hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Saving…' : favorited ? '★ Bookmarked' : '☆ Bookmark'}
      </button>
      {error && <span className="text-[11px] text-rose-400">{error}</span>}
    </span>
  );
}