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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-block mb-6"
        >
          ← Back to all tools
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Free vs Paid AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            For every AI task, here's the free tool you can start with today —
            and when it's worth paying.
          </p>
        </div>

        <div className="space-y-8">
          {cases.map((uc) => (
            <div
              key={uc.slug}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-5 border-b border-gray-100">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🆓</span>
                    <h3 className="font-semibold text-green-700">Free Options</h3>
                  </div>
                  <div className="space-y-2">
                    {uc.freePicks.map((slug) => {
                      const agent = findAgent(slug);
                      if (!agent) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/agent/${agent.slug}`}
                          className="block bg-green-50 border border-green-100 rounded-lg p-3 hover:border-green-300 transition"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {agent.name}
                            </span>
                            <span className="text-xs text-green-700 whitespace-nowrap">
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

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💎</span>
                    <h3 className="font-semibold text-purple-700">Premium Options</h3>
                  </div>
                  <div className="space-y-2">
                    {uc.paidPicks.map((slug) => {
                      const agent = findAgent(slug);
                      if (!agent) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/agent/${agent.slug}`}
                          className="block bg-purple-50 border border-purple-100 rounded-lg p-3 hover:border-purple-300 transition"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {agent.name}
                            </span>
                            <span className="text-xs text-purple-700 whitespace-nowrap">
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

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Our take: </span>
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