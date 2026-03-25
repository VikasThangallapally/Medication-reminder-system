import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Welcome() {
  const { isAuthenticated } = useAuth();
  const ctaPath = isAuthenticated ? '/dashboard' : '/login';
  const ctaLabel = isAuthenticated ? 'Open Dashboard' : 'Start Now';

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
      <div className="pointer-events-none absolute -top-8 left-8 h-24 w-72 rotate-[-8deg] rounded-2xl bg-cyan-500/18 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-8 h-24 w-80 rotate-[8deg] rounded-2xl bg-emerald-500/18 blur-2xl" />

      <section className="hero-stage glass-panel card-3d relative w-full overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16">
        <div className="hero-lines" />
        <div className="hero-shimmer" />
        <div className="hero-badge">Smart Health</div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400" />

        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.95fr] lg:items-end">
          <div>
            <p className="hero-reveal-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Welcome Screen</p>
            <h1 className="hero-reveal-2 mt-3 max-w-4xl font-display text-5xl leading-tight text-cyan-50 md:text-6xl lg:text-7xl">
              Welcome to the Medical remainder system
            </h1>
            <p className="hero-reveal-3 mt-5 max-w-3xl text-base text-cyan-100/80 md:text-lg">
              Professional medicine scheduling with a modern reminder dashboard, secure account access, and clean
              progress tracking.
            </p>

            <div className="hero-reveal-4 mt-10 flex flex-wrap gap-4">
              <Link
                to={ctaPath}
                className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400"
              >
                {ctaLabel}
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="rounded-xl border border-cyan-300/40 bg-slate-900/50 px-7 py-3.5 text-base font-semibold text-cyan-100 hover:bg-slate-800/70"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-3 lg:pb-1">
            <article className="hero-feature-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Realtime</p>
              <p className="mt-2 text-lg font-semibold text-cyan-50">Live medicine reminders and smart highlights</p>
            </article>
            <article className="hero-feature-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Security</p>
              <p className="mt-2 text-lg font-semibold text-cyan-50">Protected account flows with password recovery</p>
            </article>
            <article className="hero-feature-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Experience</p>
              <p className="mt-2 text-lg font-semibold text-cyan-50">Polished dashboard with history and dose tracking</p>
            </article>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="hero-reveal-4 mt-8 hidden lg:block">
            <Link
              to="/register"
              className="text-sm font-semibold text-cyan-200/85 hover:text-cyan-100"
            >
              New user? Create your account in less than a minute.
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
