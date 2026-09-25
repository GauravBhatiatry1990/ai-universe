"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, FormEvent } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Tools", href: "/#tools", icon: "🛠️" },
  { label: "News", href: "/news", icon: "📰" },
  { label: "Categories", href: "/#categories", icon: "📂" },
  { label: "Free vs Paid", href: "/free-vs-paid", icon: "🎯" },
  { label: "Pricing", href: "/pricing", icon: "💎" },
];

export default function AppShell({
  children,
  rightRail,
}: {
  children: ReactNode;
  rightRail?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/?q=${encodeURIComponent(query)}#tools`);
    setTimeout(() => {
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  return (
    <div className="min-h-screen flex bg-transparent text-zinc-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-zinc-800/80 bg-[#0a0a0c]/80 backdrop-blur-xl relative z-20">
        <div className="px-5 py-6 border-b border-zinc-800/80">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-40 blur-md group-hover:opacity-70 transition" />
              <span className="relative h-3 w-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 group-hover:scale-125 transition" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-white tracking-tight text-base">
                AI Universe
              </span>
              <span className="text-[10px] text-zinc-500 tracking-widest mt-1 font-mono">
                EXPLORE • COMPARE
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 " +
                  (active
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent")
                }
              >
                <span className="text-base opacity-80">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/80">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
            <p className="text-[10px] font-bold text-purple-400 tracking-widest uppercase mb-1">
              🧠 Coming soon
            </p>
            <p className="text-xs font-semibold text-white mb-1 leading-snug">
              The AI Galaxy
            </p>
            <p className="text-[11px] text-zinc-500 leading-snug">
              Visualize the ecosystem map
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0c]/70 border-b border-zinc-800/80">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-3">
            <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
              <span className="h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
              <span className="font-bold text-white text-sm">AI Universe</span>
            </Link>

            <form onSubmit={handleSubmit} className="flex-1 max-w-xl hidden sm:block">
              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition shadow-inner">
                <span className="text-zinc-500 text-sm">🔍</span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search 100+ AI tools..."
                  className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
                />
                <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 font-mono">
                  ⌘ K
                </kbd>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-3">
              <button
                aria-label="Theme"
                disabled
                aria-disabled="true"
                title="Coming soon"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                🌙
              </button>
              <button
                aria-label="Notifications"
                disabled
                aria-disabled="true"
                title="Coming soon"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-400 transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                🔔
              </button>
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white text-sm font-semibold px-4 py-2 transition shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <span className="text-xs font-bold">+</span>
                <span className="hidden sm:inline">Submit</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content + Right Rail */}
        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0">{children}</main>

          {rightRail && (
            <aside className="hidden xl:block w-80 shrink-0 border-l border-zinc-800/80 bg-[#0a0a0c]/40 backdrop-blur-md">
              <div className="sticky top-[65px] p-5 space-y-5 max-h-[calc(100vh-65px)] overflow-y-auto">
                {rightRail}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}