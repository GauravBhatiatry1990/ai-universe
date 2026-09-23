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
      {/* Context bar */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-3 flex items-center justify-between text-sm shadow-sm">
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
        <span className="text-[11px] text-gray-400">Updated daily</span>
      </div>

      {/* Search + filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI tools by name, tagline, feature, or category..."
            className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition " +
                  (active
                    ? "bg-white text-purple-700 border border-purple-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60 border border-transparent")
                }
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Count + category link */}
        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <span className="text-gray-500">
            {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
            {category !== "All" ? ` in ${category}` : ""}
            {query ? ` matching "${query}"` : ""}
          </span>
          {category !== "All" && (
            <Link
              href={`/category/${slugify(category)}`}
              className="text-purple-600 hover:text-purple-700 font-semibold"
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
                  "group relative rounded-2xl border p-5 flex flex-col transition shadow-sm " +
                  (agent.featured
                    ? "bg-amber-50/30 border-amber-200 hover:border-amber-300"
                    : "bg-white border-gray-200 hover:border-purple-200")
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
                        className="rounded-md shrink-0 bg-white object-contain border border-gray-100 p-0.5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <h2 className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition truncate">
                      {agent.name}
                    </h2>
                  </div>
                  {agent.featured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold px-2.5 py-1 whitespace-nowrap">
                      🔥 Featured
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-snug line-clamp-2">
                  {agent.tagline}
                </p>

                {agent.features && agent.features.length > 0 && (
                  <ul className="mb-3 space-y-1">
                    {agent.features.slice(0, 2).map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-[11px] text-gray-500"
                      >
                        <span className="text-emerald-500">✓</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {agent.bestFor && (
                  <p className="text-[11px] text-gray-500 italic mb-3 line-clamp-2">
                    Best for: {agent.bestFor}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700">
                    {agent.category}
                  </span>
                  <span className="text-[11px] font-medium text-gray-700">
                    {agent.pricing}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-500 text-base mb-4">No tools match your search.</p>
          <button
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-[11px] font-medium px-3 py-1.5 transition"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}