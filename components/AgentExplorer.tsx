"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getLogoUrl } from '../data/toolDomains';

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
      <div className="mb-6 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          <span>
            <span className="font-semibold text-gray-900">{agents.length}</span> tools
          </span>
          <span className="text-gray-300">·</span>
          <span>
            <span className="font-semibold text-gray-900">{categories.length - 1}</span>{" "}
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

      {/* Search */}
      <div className="mb-8 space-y-4">
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/30 via-blue-400/30 to-cyan-400/30 opacity-0 group-focus-within:opacity-100 blur transition" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI tools by name, tagline, feature, or category..."
            className="relative w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 shadow-sm focus:border-purple-400 focus:outline-none transition"
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
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md shadow-purple-500/20"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300")
                }
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Count + category link */}
        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-gray-500">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            {category !== "All" ? ` in ${category}` : ""}
            {query ? ` matching "${query}"` : ""}
          </span>
          {category !== "All" && (
            <Link
              href={`/category/${slugify(category)}`}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Open category page →
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((agent) => {
            const logoUrl = getLogoUrl(agent.slug);
            return (
              <Link
                key={agent.id}
                href={`/agent/${agent.slug}`}
                className={
                  "group relative rounded-2xl border p-6 flex flex-col transition " +
                  (agent.featured
                    ? "bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100"
                    : "bg-white border-gray-200 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50")
                }
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-md shrink-0 bg-white object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition truncate">
                      {agent.name}
                    </h2>
                  </div>
                  {agent.featured && (
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      ★ Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {agent.tagline}
                </p>

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

                {agent.bestFor && (
                  <p className="text-xs text-gray-500 italic mb-4 line-clamp-2">
                    Best for: {agent.bestFor}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="inline-block rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                    {agent.category}
                  </span>
                  <span className="text-xs text-gray-500">{agent.pricing}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-lg">No tools match your search.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}