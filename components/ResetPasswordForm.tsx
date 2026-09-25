'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { getBrowserClient } from '../lib/supabase/client';

type Props = { tokenHash?: string; type?: string };

export default function ResetPasswordForm({ tokenHash, type }: Props) {
  const hasToken = Boolean(tokenHash && type);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const accent =
    'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured yet.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    setError('');
    setInfo('');

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      token_hash: tokenHash as string,
      type: type as 'recovery',
    });
    if (verifyErr) {
      setError('This reset link is invalid or has expired.');
      setSubmitting(false);
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (updateErr) {
      setError(`Update failed: ${updateErr.message}`);
      return;
    }
    setInfo('Password updated — sign in with your new password.');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
      <h1 className="mb-1 text-2xl font-semibold text-white">Reset password</h1>
      <p className="mb-6 text-sm text-zinc-400">
        {hasToken
          ? 'Choose a new password for your account.'
          : 'Enter your email on the sign-in page to request a reset link.'}
      </p>

      {error && <p className="mb-4 text-xs text-rose-400">{error}</p>}
      {info && (
        <div className="mb-4 text-xs text-emerald-400">
          <p>{info}</p>
          <Link href="/login" className="mt-2 inline-block text-purple-400 hover:text-purple-300">
            Go to sign-in →
          </Link>
        </div>
      )}

      {hasToken ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={accent}
            />
          </div>
          <div>
            <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Confirm new password
            </label>
            <input
              id="reset-confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={accent}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-zinc-500">
          This reset link is invalid or has expired. Use the &ldquo;Forgot password?&rdquo; link on the{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300">
            sign-in page
          </Link>{' '}
          to receive a fresh one.
        </p>
      )}
    </div>
  );
}