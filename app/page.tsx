import agents from '../data/agents.json';
import AgentExplorer from '../components/AgentExplorer';
import NewsletterSignup from '../components/NewsletterSignup';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          The Brain of AI — Updated Daily
        </div>
        <h1 className="text-6xl md:text-7xl font-bold mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI Universe
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-6">
          Discover, compare, and choose the best AI agents and tools.
        </p>
        <Link
          href="/submit"
          className="inline-block rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 hover:text-white text-sm font-medium px-5 py-2 transition"
        >
          + Submit a Tool
        </Link>
      </div>

      {/* Free vs Paid banner */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/free-vs-paid"
          className="group block relative rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 hover:from-purple-400 hover:via-blue-400 hover:to-cyan-300 transition"
        >
          <div className="rounded-2xl bg-[#0a0a0f]/95 backdrop-blur px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-purple-300 mb-1 tracking-wider uppercase">
                🆓 New Feature
              </p>
              <h2 className="text-lg font-bold text-white mb-1">
                Free vs Paid AI — pick what fits your budget
              </h2>
              <p className="text-sm text-gray-400">
                For every AI task, see the free option and when it's worth paying.
              </p>
            </div>
            <span className="text-2xl text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all">
              →
            </span>
          </div>
        </Link>
      </div>

      {/* Search + Grid */}
      <AgentExplorer agents={agents} />

      {/* Newsletter */}
      <div className="max-w-3xl mx-auto mt-16">
        <NewsletterSignup />
      </div>
    </main>
  );
}