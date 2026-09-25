export default function Stars({
  count,
  size = 'text-xs',
}: {
  count: number;
  size?: string;
}) {
  const clamped = Math.max(0, Math.min(5, count));
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${clamped} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < clamped ? 'text-amber-400' : 'text-zinc-700'}>
          ★
        </span>
      ))}
    </span>
  );
}