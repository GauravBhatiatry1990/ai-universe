import agents from '../data/agents.json';
import AgentExplorer from '../components/AgentExplorer';
import NewsletterSignup from '../components/NewsletterSignup';
import AppShell from '../components/AppShell';
import LivePulse from '../components/LivePulse';
import Link from 'next/link';

export default function Home() {
  return (
    <AppShell rightRail={<LivePulse />}>
      <div className="px-4 lg:px-8 py-8 max-w-[1100px] mx-auto">
        {/* Hero */}
        <section className="mb-10 pt-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            The Brain of AI — Live
          </div>
          <h1 className="text-4xl md:text-[44px] font-semibold tracking-tight leading-tight text-gray-900 mb-3">
            The Living Brain of AI
          </h1>
          <p className="text-base text-gray-600 mb-1">
            Discover tools. Compare options. Follow the news.
          </p>
          <p className="text-sm text-gray-500">
            All in one connected ecosystem — {agents.length} tools and counting.
          </p>
        </section>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3 flex-wrap mb-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-semibold px-4 py-2.5 transition shadow-sm shadow-purple-200"
          >
            📰 AI News Feed
          </Link>
          <Link
            href="/free-vs-paid"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-medium px-4 py-2.5 transition"
          >
            🎯 Free vs Paid
          </Link>
        </div>

        {/* For tool owners */}
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 via-white to-blue-50/60 p-6 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase mb-1.5">
                🚀 For tool owners
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Built an AI tool? Get it in front of our audience.
              </h3>
              <p className="text-sm text-gray-600">
                Free listing forever. Optional paid upgrade for featured
                placement and a dofollow backlink.
              </p>
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-semibold px-4 py-2.5 transition shadow-sm shadow-purple-200 whitespace-nowrap"
            >
              Submit your tool →
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Tools', value: agents.length, icon: '🧠' },
            { label: 'Categories', value: 11, icon: '📂' },
            { label: 'News sources', value: 12, icon: '📡' },
            { label: 'Updated', value: 'Hourly', icon: '⚡' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tool explorer */}
        <div id="tools">
          <AgentExplorer agents={agents} />
        </div>

        {/* Newsletter — deliberate dark contrast card. See note below. */}
        <div className="mt-16">
          <NewsletterSignup />
        </div>
      </div>
    </AppShell>
  );
}