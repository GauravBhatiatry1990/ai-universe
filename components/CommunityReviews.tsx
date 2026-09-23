type Review = {
  id: number;
  name: string;
  initials: string;
  color: string;
  rating: number;
  text: string;
  time: string;
};

const REVIEWS: Review[] = [
  {
    id: 1,
    name: "Rohit S.",
    initials: "RS",
    color: "bg-purple-500",
    rating: 5,
    text: "ChatGPT is still the best all-rounder. Super helpful for work and learning.",
    time: "2h ago",
  },
  {
    id: 2,
    name: "Priya M.",
    initials: "PM",
    color: "bg-rose-500",
    rating: 5,
    text: "I love Midjourney for creating unique images. The quality is amazing!",
    time: "5h ago",
  },
  {
    id: 3,
    name: "Aman K.",
    initials: "AK",
    color: "bg-emerald-500",
    rating: 5,
    text: "Perplexity is my go-to for research. The sources make a huge difference.",
    time: "9h ago",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < count ? "text-amber-400" : "text-gray-200"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function CommunityReviews() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">💬</span>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
            Community Reviews
          </h2>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {REVIEWS.map((r) => (
            <div key={r.id} className="flex items-start gap-3 px-5 py-4">
              <div
                className={`w-9 h-9 rounded-full ${r.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}
              >
                {r.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">
                    {r.name}
                  </span>
                  <Stars count={r.rating} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{r.text}</p>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">
                {r.time}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 text-[11px] font-semibold px-3 py-1.5 transition"
          >
            Sign in to write a review
          </button>
          <button
            type="button"
            className="text-[11px] font-semibold text-purple-600 hover:text-purple-700"
          >
            Load more reviews →
          </button>
        </div>
      </div>
    </section>
  );
}