"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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
    return results.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }, [agents, query, category]);

  return (
    <>
      {/* Stats bar */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <span>
            <span className="font-semibold text-white">{agents.length}</span> tools
          </span>
          <span className="text-white/20">·</span>
          <span>
            <span className="font-semibold text-white">{categories.length - 1}</span>{" "}
            categories
          </span>
          <span className="text-white/20">·</span>
          <span>
            <span className="font-semibold text-white">
              {agents.filter((a) => a.featured).length}
            </span>{" "}
            featured
          </span>
        </div>
        <span className="text-gray-500">Updated daily</span>
      </div>

      {/* Search */}
      <div className="max-w-6xl mx-auto mb-8 space-y-4">
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-cyan-400/40 opacity-0 group-focus-within:opacity-100 blur transition" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI tools by name, tagline, feature, or category..."
            className="relative w-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur px-4 py-3 text-base text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition"
          />
        </div>

        {/* Category pills */}
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
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20"
                    : "border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white")
                }
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Count + category page link */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-gray-500">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            {category !== "All" ? ` in ${category}` : ""}
            {query ? ` matching "${query}"` : ""}
          </span>
          {category !== "All" && (
            <Link
              href={`/category/${slugify(category)}`}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Open category page →
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {filtered.map((agent) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.slug}`}
              className={
                "group relative rounded-2xl p-[1px] transition " +
                (agent.featured
                  ? "bg-gradient-to-br from-amber-400/60 via-yellow-500/30 to-orange-500/40 hover:from-amber-400 hover:via-yellow-500/60 hover:to-orange-500/70"
                  : "bg-white/[0.06] hover:bg-gradient-to-br hover:from-purple-500/50 hover:via-blue-500/50 hover:to-cyan-400/50")
              }
            >
              <div className="relative h-full rounded-2xl bg-[#0a0a0f] p-6 flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h2 className="text-xl font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-cyan-300 group-hover:bg-clip-text transition">
                    {agent.name}
                  </h2>
                  {agent.featured && (
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      ★ Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {agent.tagline}
                </p>

                {agent.features && agent.features.length > 0 && (
                  <ul className="mb-4 space-y-1">
                    {agent.features.slice(0, 2).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-gray-400"
                      >
                        <span className="text-cyan-400 mt-0.5">✓</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {agent.bestFor && (
                  <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">
                    Best for: {agent.bestFor}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300">
                    {agent.category}
                  </span>
                  <span className="text-xs text-gray-500">{agent.pricing}</span>
                </div>
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
            className="mt-4 text-purple-400 hover:text-purple-300 font-medium text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}