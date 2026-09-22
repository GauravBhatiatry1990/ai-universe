import Link from 'next/link';
import useCases from '../../data/useCases.json';
import agents from '../../data/agents.json';
import ToolLogo from '../../components/ToolLogo';

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
};

export default function FreeVsPaidPage() {
  const allAgents = agents as Agent[];
  const cases = useCases as UseCase[];

  const findAgent = (slug: string) => allAgents.find((a) => a.slug === slug);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-8"
        >
          ← Back to all tools
        </Link>

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            13 use cases · Free vs Paid decisions
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-none">
            <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              Free vs Paid AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            For every AI task, here&apos;s the free tool you can start with today
            — and when it&apos;s worth paying.
          </p>
        </div>

        {/* Use cases */}
        <div className="space-y-8">
          {cases.map((uc, idx) => (
            <div
              key={uc.slug}
              className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-purple-50/80 via-white to-blue-50/80 px-6 sm:px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    {uc.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-purple-600 tracking-widest uppercase">
                        Use Case #{String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                      {uc.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {uc.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* FREE */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xs">
                      🆓
                    </div>
                    <h3 className="font-bold text-emerald-700 text-sm uppercase tracking-wide">
                      Free Options
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {uc.freePicks.map((slug) => {
                      const agent = findAgent(slug);
                      if (!agent) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/agent/${agent.slug}`}
                          className="group flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition"
                        >
                          <ToolLogo slug={agent.slug} size={32} className="mt-0.5 rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition">
                                {agent.name}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {agent.pricing}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-snug">
                              {agent.tagline}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* PAID */}
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-white text-xs">
                      💎
                    </div>
                    <h3 className="font-bold text-purple-700 text-sm uppercase tracking-wide">
                      Premium Options
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {uc.paidPicks.map((slug) => {
                      const agent = findAgent(slug);
                      if (!agent) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/agent/${agent.slug}`}
                          className="group flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 hover:border-purple-300 hover:bg-purple-50 hover:shadow-sm transition"
                        >
                          <ToolLogo slug={agent.slug} size={32} className="mt-0.5 rounded-lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition">
                                {agent.name}
                              </span>
                              <span className="text-[10px] font-semibold text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {agent.pricing}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-snug">
                              {agent.tagline}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 sm:px-8 py-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] shrink-0 mt-0.5">
                    ★
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 tracking-widest uppercase mb-1">
                      Our take
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {uc.verdict}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-14 text-sm text-gray-500 max-w-xl mx-auto">
          <p>
            Every recommendation is based on publicly available pricing and
            capabilities. No sponsored placements.
          </p>
        </div>
      </div>
    </main>
  );
}