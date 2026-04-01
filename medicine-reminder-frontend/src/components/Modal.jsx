export default function Modal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/45 p-4 touch-pan-y sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft max-h-[88vh] overflow-y-auto">
        <h3 className="font-display text-xl text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
