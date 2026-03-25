export default function ReminderCard({ title, count, tone = 'default' }) {
  const toneClass = {
    default: 'border-brand-200 bg-brand-50 text-brand-900',
    good: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-rose-200 bg-rose-50 text-rose-900',
  }[tone];

  return (
    <article className={`card-3d rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide">{title}</p>
      <p className="mt-2 font-display text-3xl">{count}</p>
    </article>
  );
}
