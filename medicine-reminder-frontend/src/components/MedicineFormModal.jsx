import { useEffect, useMemo, useState } from 'react';
import MedicineIntelligenceSection from './MedicineIntelligenceSection';

const frequencyOptions = [
  { label: 'Once daily', value: 'once daily', count: 1 },
  { label: 'Twice daily', value: 'twice daily', count: 2 },
  { label: 'Thrice daily', value: 'thrice daily', count: 3 },
];

const weekdayOptions = [
  { label: 'Mon', value: 'monday' },
  { label: 'Tue', value: 'tuesday' },
  { label: 'Wed', value: 'wednesday' },
  { label: 'Thu', value: 'thursday' },
  { label: 'Fri', value: 'friday' },
  { label: 'Sat', value: 'saturday' },
  { label: 'Sun', value: 'sunday' },
];

const allWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getWeekdayName(date) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[date.getDay()];
}

function deriveDaysFromDateRange(startDate, endDate, fallbackDays = allWeekdays) {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);

  if (!start && !end) {
    return fallbackDays;
  }

  if (start && !end) {
    return [getWeekdayName(start)];
  }

  if (!start && end) {
    return [getWeekdayName(end)];
  }

  if (end < start) {
    return [getWeekdayName(start)];
  }

  const selectedDays = new Set();
  const cursor = new Date(start);
  while (cursor <= end) {
    selectedDays.add(getWeekdayName(cursor));
    cursor.setDate(cursor.getDate() + 1);

    if (selectedDays.size === 7) {
      break;
    }
  }

  return allWeekdays.filter((day) => selectedDays.has(day));
}

function getSlotCount(frequency) {
  const item = frequencyOptions.find((opt) => opt.value === frequency);
  return item ? item.count : 1;
}

export default function MedicineFormModal({
  isOpen,
  mode,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}) {
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    diseaseName: '',
    frequency: 'once daily',
    timeSlots: ['08:00'],
    daysOfWeek: allWeekdays,
    startDate: '',
    endDate: '',
    caregiverEscalationMinutes: 30,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialValues) {
      const normalizedSlots = (initialValues.timeSlots || []).map((slot) =>
        typeof slot === 'string' ? slot : slot.time
      );

      setForm({
        name: initialValues.name || '',
        dosage: initialValues.dosage || '',
        diseaseName: initialValues.diseaseName || '',
        frequency: initialValues.frequency || 'once daily',
        timeSlots: normalizedSlots.length ? normalizedSlots : ['08:00'],
        startDate: (initialValues.startDate || '').slice(0, 10),
        endDate: (initialValues.endDate || '').slice(0, 10),
        caregiverEscalationMinutes: Number(initialValues.caregiverEscalationMinutes) || 30,
        daysOfWeek: deriveDaysFromDateRange(
          (initialValues.startDate || '').slice(0, 10),
          (initialValues.endDate || '').slice(0, 10),
          initialValues.daysOfWeek && initialValues.daysOfWeek.length ? initialValues.daysOfWeek : allWeekdays
        ),
      });
      return;
    }

    setForm({
      name: '',
      dosage: '',
      diseaseName: '',
      frequency: 'once daily',
      timeSlots: ['08:00'],
      daysOfWeek: allWeekdays,
      startDate: '',
      endDate: '',
      caregiverEscalationMinutes: 30,
    });
  }, [initialValues, isOpen]);

  const slotCount = useMemo(() => getSlotCount(form.frequency), [form.frequency]);

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === 'frequency') {
      setForm((prev) => {
        const nextSlots = [...prev.timeSlots];
        const count = getSlotCount(value);
        while (nextSlots.length < count) {
          nextSlots.push('08:00');
        }
        return { ...prev, frequency: value, timeSlots: nextSlots.slice(0, count) };
      });
      return;
    }

    if (name === 'startDate' || name === 'endDate') {
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        return {
          ...next,
          daysOfWeek: deriveDaysFromDateRange(next.startDate, next.endDate, prev.daysOfWeek),
        };
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onMedicineNameChange = (value) => {
    setForm((prev) => ({ ...prev, name: value }));
  };

  const onPurposeDetected = (purpose) => {
    setForm((prev) => ({
      ...prev,
      diseaseName: prev.diseaseName || purpose || '',
    }));
  };

  const onDosageSuggestionSelect = (dosageText) => {
    setForm((prev) => ({ ...prev, dosage: dosageText }));
  };

  const updateSlot = (index, value) => {
    setForm((prev) => {
      const next = [...prev.timeSlots];
      next[index] = value;
      return { ...prev, timeSlots: next };
    });
  };

  const toggleDay = (value) => {
    setForm((prev) => {
      if (prev.daysOfWeek.includes(value)) {
        if (prev.daysOfWeek.length === 1) {
          return prev;
        }
        return { ...prev, daysOfWeek: prev.daysOfWeek.filter((day) => day !== value) };
      }

      return { ...prev, daysOfWeek: [...prev.daysOfWeek, value] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      timeSlots: form.timeSlots.slice(0, slotCount),
      daysOfWeek: form.daysOfWeek,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/45 p-4 touch-pan-y sm:items-center">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-soft animate-float-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-slate-900">
            {mode === 'edit' ? 'Edit Medicine' : 'Add Medicine'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <MedicineIntelligenceSection
              medicineName={form.name}
              onMedicineNameChange={onMedicineNameChange}
              onPurposeDetected={onPurposeDetected}
              onDosageSuggestionSelect={onDosageSuggestionSelect}
            />
            <div>
              <label className="text-sm font-semibold text-slate-700">Dosage</label>
              <input
                name="dosage"
                required
                value={form.dosage}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Disease Name</label>
              <input
                name="diseaseName"
                value={form.diseaseName}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Frequency</label>
              <select
                name="frequency"
                value={form.frequency}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                {frequencyOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Start Date</label>
              <input
                name="startDate"
                type="date"
                required
                value={form.startDate}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">End Date</label>
              <input
                name="endDate"
                type="date"
                required
                value={form.endDate}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Caregiver Escalation (minutes)</label>
              <input
                name="caregiverEscalationMinutes"
                type="number"
                min={5}
                max={240}
                required
                value={form.caregiverEscalationMinutes}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
              <p className="mt-1 text-xs text-slate-500">Minimum 5 minutes.</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Time Slots</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: slotCount }).map((_, index) => (
                <input
                  key={`slot-${index}`}
                  type="time"
                  required
                  value={form.timeSlots[index] || '08:00'}
                  onChange={(e) => updateSlot(index, e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Days</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {weekdayOptions.map((day) => {
                const active = form.daysOfWeek.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-70"
            >
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Medicine' : 'Save Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
