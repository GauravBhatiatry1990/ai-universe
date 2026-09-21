import agents from '../data/agents.json';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Universe</h1>
        <p className="text-xl text-gray-600">Discover the best AI agents and tools.</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">{agent.name}</h2>
              {agent.featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{agent.tagline}</p>
            <div className="flex items-center justify-between">
              <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                {agent.category}
              </span>
              <span className="text-sm text-gray-500">{agent.pricing}</span>
            </div>
            <Link
              href={`/agent/${agent.slug}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}