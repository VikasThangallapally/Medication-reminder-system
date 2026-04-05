export default function MedicinePurposeModal({
  isOpen,
  loading,
  error,
  medicine,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/45 p-4 touch-pan-y sm:items-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-soft max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-slate-900">Medicine Purpose & Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading medicine details...</p>
        ) : error ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{error}</p>
        ) : medicine ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-display text-lg text-slate-900">{medicine.name}</h4>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-cyan-700">{medicine.category}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Purpose:</span> {medicine.purpose}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Uses / Benefits</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {(medicine.uses || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Common Side Effects</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {(medicine.sideEffects || []).map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Precautions</p>
              <ul className="mt-1 space-y-1 text-sm text-amber-900">
                {(medicine.precautions || []).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            {Array.isArray(medicine.dosageByAge) && medicine.dosageByAge.length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Age-wise dosage guide</p>
                <div className="mt-2 space-y-2">
                  {medicine.dosageByAge.map((item) => (
                    <div key={`${item.ageGroup}-${item.dose}`} className="rounded-md border border-emerald-100 bg-white p-2">
                      <p className="text-xs font-semibold text-emerald-900">{item.ageGroup}</p>
                      <p className="text-sm text-slate-800">Dose: {item.dose}</p>
                      {item.frequency ? <p className="text-xs text-slate-600">Frequency: {item.frequency}</p> : null}
                      {item.maxDaily ? <p className="text-xs text-slate-600">Max daily: {item.maxDaily}</p> : null}
                      {item.notes ? <p className="text-xs text-slate-600">Note: {item.notes}</p> : null}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-emerald-900/80">Guidance only. Confirm final dose with a qualified clinician.</p>
              </div>
            )}

            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Storage / Shelf life:</span> {medicine.lifespan}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
