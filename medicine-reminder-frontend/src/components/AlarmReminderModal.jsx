export default function AlarmReminderModal({ reminder, onTaken, onSnooze }) {
  if (!reminder) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-slate-950/70 p-3 touch-pan-y sm:items-center sm:p-5">
      <div className="w-full max-w-lg rounded-3xl border border-amber-400/40 bg-slate-950/95 p-5 shadow-2xl shadow-amber-900/35 max-h-[90vh] overflow-y-auto">
        <div className="rounded-2xl border border-amber-300/35 bg-amber-500/15 px-3 py-1.5 text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-100">
          Alarm Active
        </div>

        <h3 className="mt-4 font-display text-3xl text-cyan-50">Time to take medicine</h3>
        <p className="mt-2 text-sm text-cyan-100/80">Respond to stop the alarm.</p>

        <div className="mt-5 space-y-2 rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4">
          <p className="text-sm text-cyan-100/75">Medicine</p>
          <p className="text-xl font-bold text-cyan-50">{reminder.medicineName || 'Medicine'}</p>
          <p className="text-sm text-cyan-100/75">Dosage: {reminder.dosage || 'N/A'}</p>
          <p className="text-sm text-cyan-100/75">Time: {reminder.time} ({reminder.date})</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onTaken?.(reminder)}
            className="rounded-2xl bg-emerald-500 px-4 py-4 text-base font-extrabold text-slate-950 transition hover:bg-emerald-400"
          >
            Taken
          </button>
          <button
            type="button"
            onClick={() => onSnooze?.(reminder)}
            className="rounded-2xl bg-amber-500 px-4 py-4 text-base font-extrabold text-slate-950 transition hover:bg-amber-400"
          >
            Snooze (2 min)
          </button>
        </div>
      </div>
    </div>
  );
}