"use client";

import { useState } from "react";
import Link from "next/link";
import useCases from "../../data/useCases.json";
import agents from "../../data/agents.json";
import ToolLogo from "../../components/ToolLogo";
import AppShell from "../../components/AppShell";

type UseCase = {
  id: number;
  slug: string;
  title: string;
  icon: string;
  description: string;
  freePicks: string[];
  paidPicks: string[];
  verdict: string;
};

type Agent = {
  slug: string;
  name: string;
  tagline: string;
  pricing: string;
  bestFor?: string;
  features?: string[];
};

const QUICK_TAKEAWAYS = [
  "Free tools are great for everyday use and basic tasks.",
  "Paid tools offer more advanced features, higher limits and better performance.",
  "Choose based on your specific needs - not just popularity.",
];

export default function FreeVsPaidPage() {
  const allAgents = agents as Agent[];
  const cases = useCases as UseCase[];
  const [activeIdx, setActiveIdx] = useState(0);

  const findAgent = (slug: string) => allAgents.find((a) => a.slug === slug);
  const active = cases[activeIdx];
  const nextCase = cases[(activeIdx + 1) % cases.length];

  const totalFree = new Set(cases.flatMap((c) => c.freePicks)).size;
  const totalPaid = new Set(cases.flatMap((c) => c.paidPicks)).size;

  const sidebar = (
    <>
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm">
            🤖
          </div>
          <h3 className="text-sm font-semibold text-white">Quick Takeaways</h3>
        </div>
        <ul className="space-y-3">
          {QUICK_TAKEAWAYS.map((t, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <span className="text-xs text-zinc-400 leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-white mb-4">At a Glance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-white mb-0.5">{totalFree}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Free tools
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-0.5">{totalPaid}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Paid tools
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-0.5">{cases.length}</div>
            <div className="text-[11px] text-zinc-500">Use cases</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-0.5">∞</div>
            <div className="text-[11px] text-zinc-500">Possibilities</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-white/[0.02] to-blue-500/10 border border-purple-500/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-purple-400">✨</span>
          <h3 className="text-sm font-semibold text-white">
            Not sure which to choose?
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          Answer a few quick questions and we&apos;ll recommend the AI tools that fit your needs.
        </p>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Coming soon"
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold px-4 py-2.5 transition shadow-sm shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Take the quiz →
          <span className="ml-2 rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
            soon
          </span>
        </button>
      </div>
    </>
  );

  return (
    <AppShell rightRail={sidebar}>
      <div className="px-4 lg:px-8 py-8 max-w-[1100px] mx-auto">
        <section className="mb-8 pt-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-semibold mb-4">
            {cases.length} use cases
          </div>
          <h1 className="text-4xl md:text-[44px] font-semibold tracking-tight leading-tight text-white mb-3">
            Free vs Paid AI
          </h1>
          <p className="text-base text-zinc-400 mb-1">
            For every task, compare the free option with the paid upgrade.
          </p>
          <p className="text-sm text-zinc-500">
            Find the right balance of features, limits and value — all in one place.
          </p>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {cases.slice(0, 6).map((uc, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={uc.slug}
                  onClick={() => setActiveIdx(i)}
                  className={
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition " +
                    (isActive
                      ? "bg-white/[0.06] text-purple-300 border border-purple-500/30 shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent")
                  }
                >
                  <span className="text-xs opacity-80">{uc.icon}</span>
                  <span>{uc.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-start gap-4 px-6 py-5 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-lg shrink-0">
                {active.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white mb-0.5">
                  {active.title}
                </h2>
                <p className="text-sm text-zinc-500">{active.description}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-semibold px-2.5 py-1 whitespace-nowrap">
                🔥 Popular
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div>
                <div className="px-6 py-3.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-emerald-300 tracking-wide">
                      FREE
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-300/80">
                    Great for everyday use
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {active.freePicks.map((slug) => {
                    const agent = findAgent(slug);
                    if (!agent) return null;
                    const features = agent.features?.slice(0, 3) ?? [];
                    return (
                      <Link
                        key={slug}
                        href={`/agent/${agent.slug}`}
                        className="group block px-6 py-4 hover:bg-white/[0.03] transition"
                      >
                        <div className="flex items-start gap-3">
                          <ToolLogo
                            slug={agent.slug}
                            size={36}
                            className="rounded-lg border border-white/10 p-0.5 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-sm text-white group-hover:text-emerald-300 transition">
                              {agent.name}
                            </span>
                            <p className="text-xs text-zinc-400 mb-2 leading-snug line-clamp-2">
                              {agent.tagline}
                            </p>
                            {features.length > 0 && (
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                                {features.map((f) => (
                                  <span
                                    key={f}
                                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500"
                                  >
                                    <span className="text-emerald-400">✓</span>
                                    <span className="truncate max-w-[140px]">{f}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-[11px] font-medium text-zinc-300">
                              {agent.pricing}
                            </div>
                          </div>
                          <span className="text-zinc-600 group-hover:text-emerald-400 transition shrink-0 mt-1">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="px-6 py-3.5 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm font-bold text-purple-300 tracking-wide">
                      PAID
                    </span>
                  </div>
                  <span className="text-[11px] text-purple-300/80">
                    More features, higher limits
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {active.paidPicks.map((slug) => {
                    const agent = findAgent(slug);
                    if (!agent) return null;
                    const features = agent.features?.slice(0, 3) ?? [];
                    return (
                      <Link
                        key={slug}
                        href={`/agent/${agent.slug}`}
                        className="group block px-6 py-4 hover:bg-white/[0.03] transition"
                      >
                        <div className="flex items-start gap-3">
                          <ToolLogo
                            slug={agent.slug}
                            size={36}
                            className="rounded-lg border border-white/10 p-0.5 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-sm text-white group-hover:text-purple-300 transition">
                              {agent.name}
                            </span>
                            <p className="text-xs text-zinc-400 mb-2 leading-snug line-clamp-2">
                              {agent.tagline}
                            </p>
                            {features.length > 0 && (
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                                {features.map((f) => (
                                  <span
                                    key={f}
                                    className="inline-flex items-center gap-1 text-[11px] text-zinc-500"
                                  >
                                    <span className="text-purple-400">✓</span>
                                    <span className="truncate max-w-[140px]">{f}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-[11px] font-medium text-zinc-300">
                              {agent.pricing}
                            </div>
                          </div>
                          <span className="text-zinc-600 group-hover:text-purple-400 transition shrink-0 mt-1">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-gradient-to-r from-purple-500/[0.06] via-transparent to-blue-500/[0.06] px-6 py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-sm">💡</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  Our Verdict
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {active.verdict}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveIdx((activeIdx + 1) % cases.length)}
            className="mt-4 block w-full text-left rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 transition px-6 py-4 group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg shrink-0">
                {nextCase.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                  {nextCase.title}
                </div>
                <div className="text-xs text-zinc-500 truncate">
                  {nextCase.description}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-zinc-500">
                  {activeIdx + 2} of {cases.length}
                </span>
                <span className="text-zinc-600 group-hover:text-purple-400 transition">
                  →
                </span>
              </div>
            </div>
          </button>
        </section>
      </div>
    </AppShell>
  );
}