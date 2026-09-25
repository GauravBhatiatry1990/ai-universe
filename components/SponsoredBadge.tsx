export default function SponsoredBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
      Sponsored
    </span>
  );
}