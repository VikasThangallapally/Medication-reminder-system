import { useEffect, useMemo, useRef, useState } from 'react';
import { medicineInfoService } from '../services/api';

function MedicineInfoCard({ medicine, onDosageSuggestionSelect }) {
  if (!medicine) {
    return null;
  }

  return (
    <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-display text-lg text-slate-900">{medicine.name}</h4>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-cyan-700">
          {medicine.category}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Purpose:</span> {medicine.purpose}
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Uses / Benefits</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-700">
            {medicine.uses.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Common Side Effects</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-700">
            {medicine.sideEffects.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Precautions</p>
        <ul className="mt-1 space-y-1 text-sm text-amber-900">
          {medicine.precautions.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>

      {Array.isArray(medicine.dosageByAge) && medicine.dosageByAge.length > 0 && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Age-wise dosage guide</p>
          <div className="mt-2 space-y-2">
            {medicine.dosageByAge.map((item) => {
              const suggestion = item.frequency ? `${item.dose} | ${item.frequency}` : item.dose;
              return (
                <div key={`${item.ageGroup}-${item.dose}`} className="rounded-md border border-emerald-100 bg-white p-2">
                  <p className="text-xs font-semibold text-emerald-900">{item.ageGroup}</p>
                  <p className="text-sm text-slate-800">Dose: {item.dose}</p>
                  {item.frequency && <p className="text-xs text-slate-600">Frequency: {item.frequency}</p>}
                  {item.maxDaily && <p className="text-xs text-slate-600">Max daily: {item.maxDaily}</p>}
                  {item.notes && <p className="text-xs text-slate-600">Note: {item.notes}</p>}
                  {onDosageSuggestionSelect && (
                    <button
                      type="button"
                      onClick={() => onDosageSuggestionSelect(suggestion)}
                      className="mt-2 rounded-md border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                    >
                      Use this dosage
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-emerald-900/80">Guidance only. Confirm final dose with a qualified clinician.</p>
        </div>
      )}

      <p className="mt-3 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Storage / Shelf life:</span> {medicine.lifespan}
      </p>
    </div>
  );
}

export default function MedicineIntelligenceSection({
  medicineName,
  onMedicineNameChange,
  onPurposeDetected,
  onDosageSuggestionSelect,
}) {
  const [query, setQuery] = useState(medicineName || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  const fetchSuggestions = async (value, openDropdown = true) => {
    setLoading(true);
    try {
      const { data } = await medicineInfoService.search(value, value.trim() ? 40 : 500);
      const medicines = data.medicines || [];
      setResults(medicines);
      if (openDropdown) {
        setOpen(true);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery(medicineName || '');
  }, [medicineName]);

  useEffect(() => {
    const load = async () => {
      await fetchSuggestions(query, query.trim().length > 0);
    };

    const timer = setTimeout(load, 220);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onOutsideClick = (event) => {
      if (!containerRef.current || containerRef.current.contains(event.target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  useEffect(() => {
    if (!medicineName) {
      setInfo(null);
      setError('');
      return;
    }

    const matchesSelected = info && info.name.toLowerCase() === medicineName.toLowerCase();
    if (!matchesSelected) {
      setInfo(null);
    }
  }, [medicineName, info]);

  const manualEntry = useMemo(() => {
    const name = query.trim().toLowerCase();
    if (!name) {
      return false;
    }
    return !results.some((item) => item.name.toLowerCase() === name);
  }, [query, results]);

  const loadDetails = async (name, shouldAutofillPurpose = true) => {
    setError('');
    try {
      const { data } = await medicineInfoService.getByName(name);
      const medicine = data.medicine;
      setInfo(medicine);
      if (shouldAutofillPurpose && onPurposeDetected) {
        onPurposeDetected(medicine.purpose || '');
      }
      return medicine;
    } catch {
      setInfo(null);
      setError('Medicine not found in global database. You can continue with manual entry.');
      return null;
    }
  };

  const onInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    onMedicineNameChange(value);
    setError('');
  };

  const onInputFocusOrTouch = async () => {
    await fetchSuggestions(query, true);
  };

  const onSelectResult = async (item) => {
    const name = item.name;
    setQuery(name);
    onMedicineNameChange(name);
    setOpen(false);
    await loadDetails(name, true);
  };

  return (
    <div className="md:col-span-2" ref={containerRef}>
      <label className="text-sm font-semibold text-slate-700">Medicine Name</label>
      <div className="relative mt-1">
        <input
          value={query}
          onChange={onInputChange}
          onFocus={onInputFocusOrTouch}
          onTouchStart={onInputFocusOrTouch}
          placeholder="Search medicine database or type custom name"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          required
        />

        {open && (
          <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {loading ? (
              <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
            ) : results.length > 0 ? (
              results.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onSelectResult(item)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50"
                >
                  <span className="text-sm font-medium text-slate-900">{item.name}</span>
                  <span className="text-xs text-slate-500">{item.category}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-slate-500">No matches in global database.</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {query.trim() && (
          <button
            type="button"
            onClick={() => loadDetails(query.trim(), true)}
            className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100"
          >
            Load medicine intelligence
          </button>
        )}
        {manualEntry && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            Manual medicine entry mode
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-amber-700">{error}</p>}

      <MedicineInfoCard medicine={info} onDosageSuggestionSelect={onDosageSuggestionSelect} />
    </div>
  );
}
