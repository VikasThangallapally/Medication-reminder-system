import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      const target = location.state?.from || '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      const apiData = err.response?.data;
      const validationMessage = Array.isArray(apiData?.errors) ? apiData.errors[0]?.msg : '';
      setError(validationMessage || apiData?.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <div className="pointer-events-none absolute -top-4 -left-3 h-36 w-36 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-36 w-36 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-2 left-10 h-40 w-40 rounded-full bg-teal-400/30 blur-3xl" />

      <section className="glass-panel card-3d relative w-full overflow-hidden rounded-3xl p-7 shadow-soft md:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400" />

        <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-200">MediTrack Portal</p>
        <h1 className="mt-2 font-display text-4xl leading-none text-cyan-50">Welcome Back</h1>
        <p className="mt-3 text-sm text-cyan-100/80">Login to manage your medicines and reminders.</p>

        {error && <p className="mt-5 rounded-xl border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold text-cyan-100">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2.5 text-sm text-cyan-50 outline-none ring-cyan-400 transition focus:ring-2"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-cyan-100">Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={onChange}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2.5 text-sm text-cyan-50 outline-none ring-cyan-400 transition focus:ring-2"
              placeholder="Enter your password"
            />
            <div className="mt-2 text-right">
              <Link className="text-xs font-semibold text-cyan-300 hover:text-cyan-200" to="/forgot-password">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-2.5 text-base font-bold text-slate-950 shadow-lg shadow-cyan-900/45 transition hover:scale-[1.01] hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-sm text-cyan-100/80">
          New here?{' '}
          <Link className="font-bold text-emerald-300 hover:text-emerald-200" to="/register">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
