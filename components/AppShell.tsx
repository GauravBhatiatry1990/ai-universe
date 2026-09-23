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
    <div className="min-h-screen flex bg-[#F8FAFF]">
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-200/70 bg-white/70 backdrop-blur-xl">
        <div className="px-5 py-5 border-b border-gray-200/70">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-20 blur-sm" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 group-hover:scale-125 transition" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-gray-900 tracking-tight text-sm">
                AI Universe
              </span>
              <span className="text-[10px] text-gray-400 tracking-widest mt-0.5">
                THE BRAIN OF AI
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition " +
                  (active
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent")
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200/70">
          <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-3.5">
            <p className="text-[10px] font-bold text-purple-600 tracking-widest uppercase mb-1">
              🧠 Coming soon
            </p>
            <p className="text-xs font-semibold text-gray-900 mb-0.5 leading-snug">
              The Brain
            </p>
            <p className="text-[11px] text-gray-500 leading-snug">
              Visualize the entire AI ecosystem
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-gray-200/70">
          <div className="flex items-center gap-3 px-4 lg:px-6 py-3">
            <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
              <span className="h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
              <span className="font-bold text-gray-900 text-sm">AI Universe</span>
            </Link>

            <form onSubmit={handleSubmit} className="flex-1 max-w-xl hidden sm:block">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition">
                <span className="text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search AI tools..."
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                  ⏎
                </kbd>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <button
                aria-label="Notifications"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-sm"
              >
                🔔
              </button>
              <Link
                href="/submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm font-medium px-3.5 py-1.5 transition shadow-sm shadow-purple-200"
              >
                <span className="text-xs">+</span>
                <span className="hidden sm:inline">Submit</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 flex min-w-0">
          <main className="flex-1 min-w-0">{children}</main>

          {rightRail && (
            <aside className="hidden xl:block w-80 shrink-0 border-l border-gray-200/70 bg-white/40 backdrop-blur-sm">
              <div className="sticky top-[57px] p-5 space-y-5 max-h-[calc(100vh-57px)] overflow-y-auto">
                {rightRail}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}