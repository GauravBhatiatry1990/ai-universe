import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 group-hover:scale-125 transition" />
          <span className="font-bold text-gray-900 tracking-tight">
            AI Universe
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition font-medium"
          >
            Tools
          </Link>
          <Link
            href="/news"
            className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition font-medium"
          >
            News
          </Link>
          <Link
            href="/free-vs-paid"
            className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition font-medium hidden sm:block"
          >
            Free vs Paid
          </Link>
          <Link
            href="/pricing"
            className="px-3 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition font-medium hidden sm:block"
          >
            Pricing
          </Link>
          <Link
            href="/submit"
            className="ml-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium transition shadow-sm"
          >
            Submit
          </Link>
        </div>
      </div>
    </nav>
  );
}