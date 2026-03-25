import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenuToggle, user, onLogout }) {
  const { isLight, toggleTheme } = useTheme();

  return (
    <header className="glass-panel sticky top-0 z-30 mx-3 mt-3 rounded-2xl px-4 py-3 md:mx-6 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="rounded-lg border border-cyan-300/30 p-2 text-cyan-200 md:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-display text-lg text-cyan-50">Medicine Reminder</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
              isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                : 'border-cyan-300/30 bg-slate-900/70 text-cyan-100 hover:bg-slate-800'
            }`}
          >
            {isLight ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
              isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                : 'border-cyan-300/30 bg-slate-900/70 text-cyan-100 hover:bg-slate-800'
            }`}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
