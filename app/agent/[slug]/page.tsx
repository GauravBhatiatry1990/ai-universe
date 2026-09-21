import agents from '../../../data/agents.json';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// We add 'async' here, and change params to a Promise
export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // We 'await' the params here to get the actual slug
  const { slug } = await params;

  // Find the specific agent based on the URL slug
  const agent = agents.find((a) => a.slug === slug);

  // If agent doesn't exist, show a 404 page
  if (!agent) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block font-medium">
          ← Back to all agents
        </Link>

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{agent.name}</h1>
          {agent.featured && (
            <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <p className="text-xl text-gray-600 mb-6">{agent.tagline}</p>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
          <p className="text-gray-600">{agent.description}</p>
        </div>

        <div className="flex gap-4 mb-6">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
            {agent.category}
          </span>
          <span className="inline-block bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
            {agent.pricing}
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
          <div className="flex gap-2 flex-wrap">
            {agent.tags.map((tag) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <a
          href={agent.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Visit {agent.name} →
        </a>
      </div>
    </main>
  );
}