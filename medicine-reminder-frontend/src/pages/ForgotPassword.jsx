import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetPath, setResetPath] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [emailReason, setEmailReason] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResetPath('');
    setResetUrl('');
    setEmailReason('');

    try {
      const { data } = await authService.forgotPassword({ email });
      setSuccess(data.message || 'Reset instructions generated successfully.');
      setResetPath(data.resetPath || '');
      setResetUrl(data.resetUrl || '');
      setEmailReason(data.emailReason || '');
    } catch (err) {
      const apiData = err.response?.data;
      const validationMessage = Array.isArray(apiData?.errors) ? apiData.errors[0]?.msg : '';
      setError(validationMessage || apiData?.message || 'Unable to process request.');
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
        <h1 className="mt-1 font-display text-3xl text-cyan-50">Forgot Password</h1>
        <p className="mt-1 text-sm text-cyan-100/80">Enter your account email to generate a reset link.</p>

        {error && <p className="mt-4 rounded-lg border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">{error}</p>}
        {success && <p className="mt-4 rounded-lg border border-emerald-400/35 bg-emerald-950/40 p-3 text-sm font-semibold text-emerald-200">{success}</p>}

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-semibold text-cyan-100">Email</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-cyan-300/30 bg-slate-950/55 px-3 py-2 text-sm text-cyan-50"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-70"
          >
            {loading ? 'Generating...' : 'Generate Reset Link'}
          </button>
        </form>

        {resetPath && (
          <div className="mt-4 rounded-lg border border-cyan-300/25 bg-slate-900/40 p-3">
            <p className="text-sm font-semibold text-cyan-100">Reset Link</p>
            {emailReason && <p className="mt-1 text-xs text-cyan-200/75">{emailReason}</p>}
            {resetUrl && <p className="mt-2 break-all text-xs text-emerald-200/90">{resetUrl}</p>}
            <p className="mt-2 text-sm text-cyan-100/80">
              <Link className="font-semibold text-emerald-300 hover:text-emerald-200" to={resetPath}>
                Open reset page
              </Link>
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-cyan-100/80">
          Remembered password?{' '}
          <Link className="font-semibold text-emerald-300 hover:text-emerald-200" to="/login">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
