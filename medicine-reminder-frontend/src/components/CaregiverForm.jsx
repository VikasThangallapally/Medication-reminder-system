import { useEffect, useState } from 'react';
import { caregiverService } from '../services/api';

export default function CaregiverForm({ user, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm({
      name: user?.caregiver?.name || '',
      email: user?.caregiver?.email || '',
      phone: user?.caregiver?.phone || '',
    });
  }, [user]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await caregiverService.save(form);
      onSaved?.(data.user || null);
      setSuccess('Caregiver details saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save caregiver details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="caregiver" className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Settings</p>
          <h2 className="mt-2 font-display text-3xl text-cyan-50">Caregiver Escalation</h2>
          <p className="mt-1 max-w-2xl text-sm text-cyan-100/80">
            Add a caregiver so escalation alerts can be routed when a dose is still not confirmed after the second reminder.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/35 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Current caregiver</p>
          <p className="mt-1 font-semibold text-cyan-50">{user?.caregiver?.name || 'Not set'}</p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 rounded-xl border border-emerald-400/35 bg-emerald-950/40 p-3 text-sm font-semibold text-emerald-200">
          {success}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-cyan-100">Caregiver Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={onChange}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50 outline-none ring-cyan-400 transition focus:ring-2"
            placeholder="Name"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-cyan-100">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50 outline-none ring-cyan-400 transition focus:ring-2"
            placeholder="caregiver@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-cyan-100">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50 outline-none ring-cyan-400 transition focus:ring-2"
            placeholder="Phone number"
          />
        </div>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Caregiver'}
          </button>
        </div>
      </form>
    </section>
  );
}