import Link from 'next/link';
import useCases from '../../data/useCases.json';
import agents from '../../data/agents.json';

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
          className="text-purple-600 hover:text-purple-700 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              Free vs Paid AI
            </span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            For every AI task, here&apos;s the free tool you can start with
            today — and when it&apos;s worth paying.
          </p>
        </div>

        <div className="space-y-6">
          {cases.map((uc) => (
            <div
              key={uc.slug}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{uc.icon}</span>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {uc.title}
                    </h2>
                    <p className="text-sm text-gray-600">{uc.description}</p>
                  </div>
                </div>
              </div>

              {/* Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Free */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🆓</span>
                    <h3 className="font-semibold text-green-700">
                      Free Options
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {uc.freePicks.map((slug) => {
                      const agent = findAgent(slug);
                      if (!agent) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/agent/${agent.slug}`}
                          className="block rounded-lg border border-green-200 bg-green-50/60 p-3 hover:border-green-400 hover:bg-green-50 transition"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {agent.name}
                            </span>
                            <span className="text-xs text-green-700 font-medium whitespace-nowrap">
                              {agent.pricing}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {agent.tagline}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Paid */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💎</span>
                    <h3 className="font-semibold text-purple-700">
                      Premium Options
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {uc.paidPicks.map((slug) => {
                      const agent = findAgent(slug);
                      if (!agent) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/agent/${agent.slug}`}
                          className="block rounded-lg border border-purple-200 bg-purple-50/60 p-3 hover:border-purple-400 hover:bg-purple-50 transition"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {agent.name}
                            </span>
                            <span className="text-xs text-purple-700 font-medium whitespace-nowrap">
                              {agent.pricing}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {agent.tagline}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Our take:{' '}
                  </span>
                  {uc.verdict}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Every recommendation is based on publicly available pricing and
            capabilities. No sponsored placements.
          </p>
        </div>
      </div>
    </main>
  );
}