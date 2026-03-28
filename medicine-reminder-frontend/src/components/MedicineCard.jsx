import { formatDate } from '../utils/formatDate';

function Badge({ status }) {
  const classes = {
    taken: 'bg-emerald-100 text-emerald-700',
    missed: 'bg-rose-100 text-rose-700',
    pending: 'bg-amber-100 text-amber-700',
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes[status] || classes.pending}`}>
      {status || 'pending'}
    </span>
  );
}

export default function MedicineCard({
  medicine,
  isHighlighted,
  onEdit,
  onDelete,
  onMarkTaken,
  onMarkMissed,
}) {
  const dayText = (medicine.daysOfWeek || []).map((d) => d.slice(0, 3)).join(', ');

  return (
    <article
      className={`card-3d glass-panel animate-float-in rounded-2xl border p-3 shadow-soft transition sm:p-4 ${
        isHighlighted
          ? 'border-amber-400 ring-2 ring-amber-200'
          : 'border-white/70'
      }`}
    >
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div className="flex-1">
          <h3 className="font-display text-lg text-slate-900 sm:text-xl">{medicine.name}</h3>
          <p className="mt-1 text-sm text-slate-600">Dosage: {medicine.dosage}</p>
          {medicine.diseaseName ? <p className="text-sm text-slate-600">Disease: {medicine.diseaseName}</p> : null}
          <p className="text-sm text-slate-600">Frequency: {medicine.frequency}</p>
          <p className="text-sm text-slate-600">Days: {dayText || 'Everyday'}</p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
          <button
            type="button"
            onClick={() => onEdit(medicine)}
            className="flex-1 rounded-lg border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 sm:flex-none sm:px-3"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(medicine)}
            className="flex-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 sm:flex-none sm:px-3"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(medicine.timeSlots || []).map((slot) => (
          <div
            key={slot.time}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1 text-xs sm:px-3"
            title={`Status: ${slot.status || 'pending'}`}
          >
            <span className="font-semibold text-slate-700">{slot.time}</span>
            <Badge status={slot.status} />
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {formatDate(medicine.startDate)} - {formatDate(medicine.endDate)}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => onMarkTaken(medicine)}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          ✅ Mark Taken
        </button>
        <button
          type="button"
          onClick={() => onMarkMissed(medicine)}
          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
        >
          ⚠️ Mark Missed
        </button>
      </div>
    </article>
  );
}
