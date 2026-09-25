"use client";
import Link from "next/link";
import ToolLogo from "../../components/ToolLogo";
import AppShell from "../../components/AppShell";
import agents from "../../data/agents.json";

export default function TrendsPage() {
  // For now, we pull featured tools. Eventually, this will come from your real API.
  const trendingTools = agents.filter((t: any) => t.featured).slice(0, 15);

  return (
    <AppShell>
      <div className="px-4 lg:px-8 py-8 max-w-[1100px] mx-auto">
        {/* Header Section */}
        <div className="mb-8 pt-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            📈 Live Pulse Trends
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Real-time ranking of AI tools based on community usage, news mentions, and search volume.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <span className="font-bold">▲ UP</span>
              <span className="text-emerald-300/70">Moved up since yesterday</span>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 text-red-300 px-3 py-1.5 rounded-full border border-red-500/30">
              <span className="font-bold">▼ DOWN</span>
              <span className="text-red-300/70">Moved down since yesterday</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30">
              <span className="font-bold">✨ NEW</span>
              <span className="text-purple-300/70">Entered top 50 in 24h</span>
            </div>
          </div>
        </div>

        {/* Rankings List */}
        <div>
          <div className="bg-white/[0.03] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-white/[0.02] border-b border-white/10 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">Tool</div>
              <div className="col-span-3 text-center">7-Day Trend</div>
              <div className="col-span-3 text-right">Change (24h)</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5">
              {trendingTools.map((tool: any, index: number) => {
                // Fake data logic for demonstration - this will come from your API later
                const isUp = index % 3 === 0;
                const isNew = index % 3 === 2;

                return (
                  <div
                    key={tool.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center">
                      <span className="text-xl font-black text-zinc-600 group-hover:text-purple-400 transition-colors">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Tool Info with Logo */}
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center p-1 shadow-sm shrink-0">
                        <ToolLogo slug={tool.slug} size={28} />
                      </div>
                      <div>
                        <Link
                          href={`/agent/${tool.slug}`}
                          className="font-bold text-white hover:text-purple-300 transition text-lg"
                        >
                          {tool.name}
                        </Link>
                        <p className="text-xs text-zinc-500 font-medium">{tool.category}</p>
                      </div>
                    </div>

                    {/* Trend Chart (SVG) */}
                    <div className="col-span-3 flex justify-center">
                      <div className="w-32 h-10 relative">
                        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={isUp ? "#10b981" : isNew ? "#a855f7" : "#ef4444"} stopOpacity="0.2"/>
                              <stop offset="100%" stopColor={isUp ? "#10b981" : isNew ? "#a855f7" : "#ef4444"} stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          <path
                            d={`M0,${isUp ? 30 : isNew ? 20 : 10} Q25,${isUp ? 25 : 35}, 50,${isUp ? 15 : isNew ? 20 : 25} T100,${isUp ? 5 : isNew ? 10 : 35}`}
                            fill={`url(#grad-${index})`}
                            stroke={isUp ? "#10b981" : isNew ? "#a855f7" : "#ef4444"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            fillOpacity="1"
                          />
                          <circle cx="100" cy={isUp ? 5 : isNew ? 10 : 35} r="3" fill={isUp ? "#10b981" : isNew ? "#a855f7" : "#ef4444"} />
                        </svg>
                      </div>
                    </div>

                    {/* Change Badge */}
                    <div className="col-span-3 flex justify-end">
                      {isUp ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          <span className="text-xs font-bold">▲ UP 2</span>
                          <span className="text-[10px] text-emerald-300/70">vs yesterday</span>
                        </div>
                      ) : isNew ? (
                        <div className="flex items-center gap-1.5 bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-500/30">
                          <span className="text-xs font-bold">✨ NEW</span>
                          <span className="text-[10px] text-purple-300/70">this week</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-red-500/10 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30">
                          <span className="text-xs font-bold">▼ DOWN 1</span>
                          <span className="text-[10px] text-red-300/70">vs yesterday</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-6">
            Data refreshes every 10 minutes. Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </AppShell>
  );
}