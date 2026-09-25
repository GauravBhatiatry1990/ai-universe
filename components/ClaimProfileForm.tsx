'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { SITE_CONTACT_EMAIL } from '../lib/site';

export default function ClaimProfileForm({ agentName }: { agentName: string }) {
  const [name, setName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Claim this profile: ${agentName}`);
    const body = encodeURIComponent(
      `Tool: ${agentName}\n\nFull name: ${name}\nWork email: ${workEmail}\nCompany: ${company || '—'}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="claim-name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Full name
        </label>
        <input
          id="claim-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      <div>
        <label htmlFor="claim-email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Work email
        </label>
        <input
          id="claim-email"
          type="email"
          required
          value={workEmail}
          onChange={(e) => setWorkEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      <div>
        <label htmlFor="claim-company" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Company <span className="text-zinc-600 normal-case">(optional)</span>
        </label>
        <input
          id="claim-company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Acme Inc."
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      <div>
        <label htmlFor="claim-message" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
          Message <span className="text-zinc-600 normal-case">(optional)</span>
        </label>
        <textarea
          id="claim-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything you'd like to change or fix about the listing?"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold px-4 py-2.5 transition hover:from-purple-600 hover:to-blue-600 shadow-sm shadow-purple-500/20"
      >
        Send claim request →
      </button>
      <p className="text-xs text-zinc-500">
        This opens your email app with a prefilled message to {SITE_CONTACT_EMAIL}. No data is stored on our servers.
      </p>
    </form>
  );
}