import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <div className="pointer-events-none absolute top-6 left-4 h-36 w-36 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 right-4 h-36 w-36 rounded-full bg-emerald-500/25 blur-3xl" />

      <section className="glass-panel card-3d relative w-full overflow-hidden rounded-3xl p-8 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400" />

        <div className="mb-3 text-3xl" aria-hidden="true">💊 🩺 </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">Session Closed</p>
        <h1 className="mt-2 font-display text-4xl text-cyan-50">See You Again</h1>
        <p className="mt-3 text-sm text-cyan-100/80">
          You have logged out successfully. Visit again anytime to manage your reminders.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400"
        >
          Sign In Again
        </Link>
      </section>
    </main>
  );
}
