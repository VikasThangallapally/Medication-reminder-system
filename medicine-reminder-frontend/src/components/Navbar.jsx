import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenuToggle, user, onLogout }) {
  const { isLight, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleThemeToggle = () => {
    toggleTheme();
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  return (
    <header className="glass-panel sticky top-0 z-30 mx-2 mt-2 rounded-2xl px-3 py-3 sm:mx-3 sm:mt-3 sm:px-4 md:mx-6 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
          <h1 className="truncate font-display text-base text-cyan-50 sm:text-lg">Medicine Reminder</h1>
        </div>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
              isLight
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                : 'border-cyan-300/30 bg-slate-900/70 text-cyan-100 hover:bg-slate-800'
            }`}
          >
            {isLight ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
              isLight
                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-red-500/30 bg-red-900/30 text-red-200 hover:bg-red-900/50'
            }`}
          >
            Logout
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="relative md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-cyan-300/30 p-2 text-cyan-200 hover:bg-cyan-900/30"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="absolute right-0 top-12 z-50 rounded-lg border border-cyan-300/30 bg-slate-900/95 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={handleThemeToggle}
                className={`block w-full px-4 py-2 text-left text-sm font-semibold transition hover:bg-cyan-900/30 ${
                  isLight ? 'text-slate-700' : 'text-cyan-100'
                }`}
              >
                {isLight ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <div className="border-t border-cyan-300/20" />
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-sm font-semibold text-red-400 transition hover:bg-red-900/30"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
