import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import { medicineService } from '../services/api';

const frequencyOptions = ['once daily', 'twice daily', 'thrice daily'];
const slotCountByFrequency = {
  'once daily': 1,
  'twice daily': 2,
  'thrice daily': 3,
};

export default function EditMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    diseaseName: '',
    frequency: 'once daily',
    timeSlots: ['08:00'],
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    let active = true;

    medicineService
      .getById(id)
      .then(({ data }) => {
        const medicine = data.medicine || data;
        if (!active) {
          return;
        }

        setForm({
          name: medicine.name || '',
          dosage: medicine.dosage || '',
          diseaseName: medicine.diseaseName || '',
          frequency: medicine.frequency || 'once daily',
          timeSlots: (medicine.timeSlots || ['08:00']).map((slot) =>
            typeof slot === 'string' ? slot : slot.time
          ),
          startDate: (medicine.startDate || '').slice(0, 10),
          endDate: (medicine.endDate || '').slice(0, 10),
        });
      })
      .catch(() => {
        setError('Unable to load medicine details.');
      })
      .finally(() => setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'frequency') {
      const count = slotCountByFrequency[value];
      setForm((prev) => {
        const nextSlots = [...prev.timeSlots];
        while (nextSlots.length < count) {
          nextSlots.push('08:00');
        }
        return { ...prev, frequency: value, timeSlots: nextSlots.slice(0, count) };
      });
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateSlot = (index, value) => {
    setForm((prev) => {
      const nextSlots = [...prev.timeSlots];
      nextSlots[index] = value;
      return { ...prev, timeSlots: nextSlots };
    });
  };

  const slotInputs = useMemo(
    () =>
      form.timeSlots.map((slot, index) => (
        <div key={`${slot}-${index}`}>
          <label className="text-sm font-semibold text-slate-700">Time Slot {index + 1}</label>
          <input
            type="time"
            required
            value={slot}
            onChange={(e) => updateSlot(index, e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
          />
        </div>
      )),
    [form.timeSlots]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await medicineService.update(id, { ...form, timeSlots: form.timeSlots });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update medicine.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader label="Loading medicine..." />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => {
          logout();
          navigate('/logout');
        }}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          user={user}
          onLogout={() => {
            logout();
            navigate('/logout');
          }}
        />

        <main className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
          <h2 className="font-display text-3xl text-slate-900">Edit Medicine</h2>
          <p className="mt-1 text-sm text-slate-600">Update medicine schedule and time slots.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Medicine Name</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
                />
              </div>

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
                  {frequencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
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
            </div>

            <div className="grid gap-4 md:grid-cols-3">{slotInputs}</div>

            {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-70"
              >
                {saving ? 'Updating...' : 'Update Medicine'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
