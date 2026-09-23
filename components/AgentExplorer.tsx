"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function AgentExplorer({
  agents,
  initialQuery = "",
}: {
  agents: Agent[];
  initialQuery?: string;
}) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(agents.map((a) => a.category))).sort()],
    [agents]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const results = agents.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (!q) return true;
      const haystack = [
        a.name,
        a.tagline,
        a.category,
        a.bestFor || '',
        (a.features || []).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    return results.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }, [agents, category, query]);

  return (
    <section id="tools">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🛠</span>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
            Explore Tools
          </h2>
        </div>
        {category !== "All" && (
          <Link
            href={`/category/${slugify(category)}`}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            Open {category} page →
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "rounded-lg px-3 py-1.5 text-xs font-medium transition " +
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

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-[11px] text-gray-500">
          {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
          {category !== "All" ? ` in ${category}` : ""}
          {query ? ` matching "${query}"` : ""}
        </p>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-[11px] font-medium px-2.5 py-1 transition"
          >
            Clear search ✕
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="flex items-center gap-2.5 mb-3">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="rounded-lg shrink-0 bg-white object-contain border border-gray-100 p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition truncate">
                    {agent.name}
                  </h3>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-snug line-clamp-2">
                  {agent.tagline}
                </p>

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
          <p className="text-gray-500 text-base mb-4">
            No tools match your search.
          </p>
          <button
            onClick={() => {
              setCategory("All");
              setQuery("");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-[11px] font-medium px-3 py-1.5 transition"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}