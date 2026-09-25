'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { getBrowserClient } from '../lib/supabase/client';

type Props = { mode: 'login' | 'signup'; next?: string };

export default function AuthForm({ mode, next }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const target = next && next.startsWith('/') ? next : '/account';
  const accent =
    'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured yet.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    setInfo('');

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setSubmitting(false);
      if (err) {
        setError(`Sign-in failed: ${err.message}`);
        return;
      }
      router.push(target);
      router.refresh();
      return;
    }

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setSubmitting(false);
    if (err) {
      setError(`Sign-up failed: ${err.message}`);
      return;
    }
    if (data.session) {
      router.push(target);
      router.refresh();
      return;
    }
    setInfo('Check your inbox to confirm your email.');
  };

  const handleForgot = async () => {
    const supabase = getBrowserClient();
    if (!supabase) {
      setError('Authentication is not configured yet.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email first to reset your password.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim());
    setSubmitting(false);
    if (err) {
      setError(`Reset failed: ${err.message}`);
      return;
    }
    setInfo('Reset link sent — check your inbox.');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
      <h1 className="mb-1 text-2xl font-semibold text-white">
        {mode === 'login' ? 'Sign in' : 'Create your account'}
      </h1>
      <p className="mb-6 text-sm text-zinc-400">
        {mode === 'login'
          ? 'Welcome back — write reviews and save tools.'
          : 'Join the community — review tools and build your library.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-display-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Display name
            </label>
            <input
              id="auth-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Kiara"
              className={accent}
            />
          </div>
        )}
        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={accent}
          />
        </div>
        <div>
          <label htmlFor="auth-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={accent}
          />
        </div>
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-confirm" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Confirm password
            </label>
            <input
              id="auth-confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={accent}
            />
          </div>
        )}

        {error && <p className="text-xs text-rose-400">{error}</p>}
        {info && <p className="text-xs text-emerald-400">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {mode === 'login' && (
        <button
          type="button"
          onClick={handleForgot}
          disabled={submitting}
          className="mt-3 text-xs text-purple-400 transition hover:text-purple-300 disabled:opacity-60"
        >
          Forgot password?
        </button>
      )}

      <p className="mt-6 text-xs text-zinc-500">
        {mode === 'login' ? (
          <>
            New here?{' '}
            <Link
              href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-purple-400 hover:text-purple-300"
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link
              href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`}
              className="text-purple-400 hover:text-purple-300"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}