'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { getBrowserClient } from '../lib/supabase/client';
import { initialsOf } from '../lib/initials';

function displayName(email: string, metadata: unknown): string {
  if (typeof metadata === 'object' && metadata !== null) {
    const value = (metadata as Record<string, unknown>).display_name;
    if (typeof value === 'string' && value.trim()) return value;
  }
  return email.split('@')[0] || 'User';
}

export default function AccountMenu() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <span className="h-9 w-9 rounded-full border border-zinc-800 bg-zinc-900" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-purple-500/40 hover:text-white"
      >
        Sign in
      </Link>
    );
  }

  const name = displayName(user.email ?? '', user.user_metadata);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white transition hover:opacity-90"
      >
        {initialsOf(name)}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-20 w-52 space-y-1 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
            <p className="truncate px-3 py-2 text-xs text-zinc-500">{user.email}</p>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800"
            >
              My account
            </Link>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                const supabase = getBrowserClient();
                if (supabase) await supabase.auth.signOut();
                router.refresh();
                router.push('/');
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 transition hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}