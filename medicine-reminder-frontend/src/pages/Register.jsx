import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiData = err.response?.data;
      const validationMessage = Array.isArray(apiData?.errors) ? apiData.errors[0]?.msg : '';
      setError(validationMessage || apiData?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <div className="pointer-events-none absolute top-8 -left-4 h-32 w-32 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 right-2 h-36 w-36 rounded-full bg-emerald-500/25 blur-3xl" />

      <section className="glass-panel card-3d relative w-full overflow-hidden rounded-3xl p-6 shadow-soft">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">MediTrack Portal</p>
        <h1 className="mt-1 font-display text-3xl text-cyan-50">Create Account</h1>
        <p className="mt-1 text-sm text-cyan-100/80">Get reminders tied to your personal account.</p>

        {error && <p className="mt-4 rounded-lg border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">{error}</p>}

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold text-cyan-100">Name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-cyan-100">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-cyan-100">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-cyan-100/80">
          Already have an account?{' '}
          <Link className="font-semibold text-emerald-300 hover:text-emerald-200" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
