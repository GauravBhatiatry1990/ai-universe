"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Agent = {
  id: number | string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  pricing: string;
  featured?: boolean;
};

export default function AgentExplorer({ agents }: { agents: Agent[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(agents.map((a) => a.category))).sort()],
    [agents]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [agents, query, category]);

  return (
    <>
      {/* Search + Filter controls */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search AI tools by name, tagline, or category..."
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100")
                }
              >
                {c}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-gray-500">
          {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
          {category !== "All" ? ` in ${category}` : ""}
          {query ? ` matching "${query}"` : ""}
        </p>
      </div>

      {/* Agent Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {agent.name}
                </h2>
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
      ) : (
        <div className="max-w-6xl mx-auto py-16 text-center">
          <p className="text-gray-500 text-lg">No tools match your search.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}