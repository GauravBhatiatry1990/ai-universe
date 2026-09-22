import agents from '../data/agents.json';
import AgentExplorer from '../components/AgentExplorer';
import NewsletterSignup from '../components/NewsletterSignup';
import NavBar from '../components/NavBar';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Universe
          </h1>
          <p className="text-xl text-gray-600">
            Discover the best AI agents and tools.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/news"
            className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-5 py-2 transition shadow-md shadow-purple-200"
          >
            📰 AI News Feed
          </Link>
          <Link
            href="/submit"
            className="inline-block rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-sm font-medium px-5 py-2 transition shadow-sm"
          >
            + Submit a Tool
          </Link>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <Link
            href="/free-vs-paid"
            className="group block relative rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 hover:from-purple-400 hover:via-blue-400 hover:to-cyan-300 transition"
          >
            <div className="rounded-2xl bg-white/95 backdrop-blur px-6 py-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-purple-600 mb-1 tracking-wider uppercase">
                  🆓 New Feature
                </p>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Free vs Paid AI — pick what fits your budget
                </h2>
                <p className="text-sm text-gray-600">
                  For every AI task, see the free option and when it's worth paying.
                </p>
              </div>
              <span className="text-2xl text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
          </Link>
        </div>

        <AgentExplorer agents={agents} />

        <div className="max-w-3xl mx-auto mt-16">
          <NewsletterSignup />
        </div>
      </main>
    </>
  );
}