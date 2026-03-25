import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.resetPassword({ token, password });
      setSuccess(data.message || 'Password reset successful.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1000);
    } catch (err) {
      const apiData = err.response?.data;
      const validationMessage = Array.isArray(apiData?.errors) ? apiData.errors[0]?.msg : '';
      setError(validationMessage || apiData?.message || 'Unable to reset password.');
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

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Password Recovery</p>
        <h1 className="mt-1 font-display text-3xl text-cyan-50">Reset Password</h1>
        <p className="mt-1 text-sm text-cyan-100/80">Enter your reset token and set a new password.</p>

        {error && <p className="mt-4 rounded-lg border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">{error}</p>}
        {success && <p className="mt-4 rounded-lg border border-emerald-400/35 bg-emerald-950/40 p-3 text-sm font-semibold text-emerald-200">{success}</p>}

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold text-cyan-100">Reset Token</label>
            <input
              name="token"
              required
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
              placeholder="Paste reset token"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-cyan-100">New Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-cyan-100">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-sm text-cyan-100/80">
          <Link className="font-semibold text-emerald-300 hover:text-emerald-200" to="/login">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
