import agents from '../data/agents.json';
import AgentExplorer from '../components/AgentExplorer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Universe</h1>
        <p className="text-xl text-gray-600">Discover the best AI agents and tools.</p>
      </div>

      {/* Search + Grid */}
      <AgentExplorer agents={agents} />
    </main>
  );
}