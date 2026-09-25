'use client';

import { useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';

export type TabSection = {
  id: string;
  label: string;
  count?: number;
  content: ReactNode;
};

const getSnapshot = () => window.location.hash;
const getServerSnapshot = () => '';

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export default function AgentTabs({ sections }: { sections: TabSection[] }) {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const rawId = hash.replace('#', '');
  const active = sections.some((s) => s.id === rawId) ? rawId : 'overview';

  const selectTab = (id: string) => {
    window.history.pushState(null, '', `#${id}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => selectTab(s.id)}
              aria-selected={isActive}
              role="tab"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
              }`}
            >
              {s.label}
              {s.count !== undefined && (
                <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {sections.map((s) => (
        <div
          key={s.id}
          id={s.id}
          role="tabpanel"
          hidden={active !== s.id}
          className="scroll-mt-24"
        >
          {s.content}
        </div>
      ))}
    </div>
  );
}