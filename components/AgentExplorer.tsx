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
  url?: string;
  bestFor?: string;
  features?: string[];
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
    const results = agents.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.bestFor?.toLowerCase().includes(q) ?? false) ||
        (a.features?.some((f) => f.toLowerCase().includes(q)) ?? false)
      );
    });
    // Featured first
    return results.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }, [agents, query, category]);

  return (
    <>
      {/* Stats bar */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          <span>
            <span className="font-semibold text-gray-900">{agents.length}</span>{" "}
            tools
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-gray-900">
              {categories.length - 1}
            </span>{" "}
            categories
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-gray-900">
              {agents.filter((a) => a.featured).length}
            </span>{" "}
            featured
          </span>
        </div>
        <span className="text-gray-400">Updated daily</span>
      </div>

      {/* Search + Filter controls */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search AI tools by name, tagline, feature, or category..."
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
            <Link
              key={agent.id}
              href={`/agent/${agent.slug}`}
              className={
                "group bg-white p-6 rounded-xl shadow-sm border transition duration-200 hover:shadow-md flex flex-col " +
                (agent.featured
                  ? "border-yellow-200 ring-1 ring-yellow-100"
                  : "border-gray-100")
              }
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                  {agent.name}
                </h2>
                {agent.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {agent.tagline}
              </p>

              {/* Feature bullets */}
              {agent.features && agent.features.length > 0 && (
                <ul className="mb-4 space-y-1">
                  {agent.features.slice(0, 2).map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-xs text-gray-600"
                    >
                      <span className="text-blue-500 mt-0.5">✓</span>
                      <span className="line-clamp-1">{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Best for */}
              {agent.bestFor && (
                <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">
                  Best for: {agent.bestFor}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {agent.category}
                </span>
                <span className="text-xs text-gray-500">{agent.pricing}</span>
              </div>
            </Link>
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