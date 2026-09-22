import agents from '../data/agents.json';
import AgentExplorer from '../components/AgentExplorer';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Universe</h1>
        <p className="text-xl text-gray-600">Discover the best AI agents and tools.</p>
      </div>

      {/* Free vs Paid banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/free-vs-paid"
          className="block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl p-6 transition shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">
                🆓 New
              </p>
              <h2 className="text-xl font-bold mb-1">
                Free vs Paid AI — pick what fits your budget
              </h2>
              <p className="text-sm opacity-90">
                For every AI task, see the free option and when it's worth paying.
              </p>
            </div>
            <span className="text-2xl whitespace-nowrap">→</span>
          </div>
        </Link>
      </div>

      {/* Search + Grid */}
      <AgentExplorer agents={agents} />
    </main>
  );
}