import { differenceInCalendarDays } from 'date-fns';
import { formatDate } from '../utils/formatDate';

function getSummary(medicine) {
  const logs = medicine.logs || [];
  const taken = logs.filter((item) => item.status === 'taken').length;
  const missed = logs.filter((item) => item.status === 'missed').length;

  const start = new Date(medicine.startDate);
  const end = new Date(medicine.endDate);
  const days = Math.max(differenceInCalendarDays(end, start) + 1, 1);
  const totalExpected = days * (medicine.timeSlots?.length || 1);
  const pending = Math.max(totalExpected - taken - missed, 0);

  return { taken, missed, pending };
}

export default function HistoryList({ medicines, onDeleteMedicine, onClearHistory, clearingAll }) {
  if (!medicines.length) {
    return (
      <div className="glass-panel rounded-2xl border border-dashed border-brand-200 p-8 text-center text-sm text-slate-600">
        No previous medicines found.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-100 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-700">{medicines.length} records</p>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={clearingAll}
          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {clearingAll ? 'Clearing...' : 'Clear History'}
        </button>
      </div>
      <div className="max-h-80 overflow-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="sticky top-0 bg-brand-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Name</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Dosage</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Status Summary</th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {medicines.map((medicine) => {
            const summary = getSummary(medicine);
            const key = medicine._id || medicine.id;

            return (
              <tr key={key} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{medicine.name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{medicine.dosage}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(medicine.startDate)} - {formatDate(medicine.endDate)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <span className="font-semibold text-emerald-700">Taken: {summary.taken}</span>
                  {' | '}
                  <span className="font-semibold text-rose-700">Missed: {summary.missed}</span>
                  {' | '}
                  <span className="font-semibold text-amber-700">Pending: {summary.pending}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteMedicine?.(medicine)}
                    className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
