'use client';

import { useState } from 'react';
import Link from 'next/link';
import ToolLogo from './ToolLogo';
import {
  USE_CASES,
  BUDGET_OPTIONS,
  SKILL_LEVELS,
  scoreTools,
} from '../lib/matchmaker';
import type { MatchAgent, DifficultyLevel } from '../lib/matchmaker';

type Step = 1 | 2 | 3 | 'results';

export default function Matchmaker({ agents }: { agents: MatchAgent[] }) {
  const [step, setStep] = useState<Step>(1);
  const [useCase, setUseCase] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [skill, setSkill] = useState<DifficultyLevel | null>(null);

  const matches =
    useCase && budget && skill
      ? scoreTools(agents, { useCase, budget, skill }).slice(0, 3)
      : [];

  const retake = () => {
    setUseCase(null);
    setBudget(null);
    setSkill(null);
    setStep(1);
  };

  const optionBtn =
    'w-full rounded-xl border px-4 py-3 text-sm font-semibold transition text-left ';

  const activeBtn = 'bg-purple-500/15 border-purple-500/40 text-purple-200';
  const idleBtn = 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-purple-500/40 hover:bg-purple-500/[0.06] hover:text-white';

  const stepLabel =
    step === 1 ? 'What do you want to do?' :
    step === 2 ? 'What should it cost?' :
    step === 3 ? 'How technical are you?' : '';

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎯</span>
          <h2 className="text-sm font-bold text-zinc-300 tracking-wide uppercase">
            Find My AI Tool
          </h2>
        </div>
        <span className="text-[11px] font-medium text-zinc-500">
          {step === 'results' ? 'Matches' : `Step ${step} of 3`}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full transition ${
              (step === s || (step !== 'results' && step > s) || step === 'results')
                ? 'bg-purple-500'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step !== 'results' && (
        <p className="text-lg font-semibold text-white mb-5">{stepLabel}</p>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              type="button"
              onClick={() => { setUseCase(uc.id); setStep(2); }}
              className={optionBtn + (useCase === uc.id ? activeBtn : idleBtn)}
            >
              {uc.label}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {BUDGET_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => { setBudget(b.id); setStep(3); }}
              className={optionBtn + (budget === b.id ? activeBtn : idleBtn)}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SKILL_LEVELS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSkill(s); setStep('results'); }}
              className={optionBtn + (skill === s ? activeBtn : idleBtn) + ' text-center'}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {step !== 1 && step !== 'results' && (
        <button
          type="button"
          onClick={() => setStep((step - 1) as Step)}
          className="mt-6 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition"
        >
          ← Back
        </button>
      )}

      {step === 'results' && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 leading-snug">
            {matches.length > 0
              ? `Your top match${matches.length > 1 ? 'es' : ''}`
              : 'Close, but no perfect match'}
          </h3>
          {matches.length > 0 ? (
            <p className="text-sm text-zinc-400 mb-5">
              Based on {USE_CASES.find((u) => u.id === useCase)?.label.toLowerCase()}, {BUDGET_OPTIONS.find((b) => b.id === budget)?.label.toLowerCase()}, and {skill} skill.
            </p>
          ) : (
            <p className="text-sm text-zinc-400 mb-5">
              No strong matches for that combination — try adjusting your answers.
            </p>
          )}

          <div className="space-y-3 mb-6">
            {matches.map(({ agent, score }) => (
              <Link
                key={agent.slug}
                href={`/agent/${agent.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-purple-500/40 hover:bg-purple-500/[0.05]"
              >
                <div className="shrink-0">
                  <ToolLogo slug={agent.slug} size={40} className="rounded-lg border border-white/10 bg-white/5 p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition truncate">
                      {agent.name}
                    </h4>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                      {score}/10
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                    {agent.tagline}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                      {agent.category}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                      {agent.pricing}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400 capitalize">
                      {agent.difficulty}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={retake}
            className="inline-block rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 font-semibold px-6 py-2.5 transition"
          >
            Retake quiz
          </button>
        </div>
      )}
    </section>
  );
}