import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dashboard#add', label: 'Add Medicine' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/caregiver', label: 'Caregiver' },
  { to: '/dashboard#history', label: 'History' },
];

export default function Sidebar({ open, onClose, user, onLogout }) {
  useEffect(() => {
    if (open) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [open]);

  const handleLogoutClick = () => {
    onClose?.();
    onLogout?.();
  };

  return (
    <>
      <aside
        className={`glass-panel fixed inset-y-0 left-0 z-50 m-2 flex w-[88vw] max-w-72 transform flex-col overflow-y-auto rounded-2xl px-4 py-5 transition-transform duration-200 sm:m-3 sm:w-64 sm:py-6 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <h2 className="px-3 font-display text-xl text-cyan-50">MediTrack</h2>
        <nav className="mt-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950'
                    : 'text-cyan-100/90 hover:bg-cyan-500/15'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-xl border border-cyan-300/20 bg-slate-900/45 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-cyan-200/70">Signed in as</p>
            <p className="text-lg font-semibold leading-tight text-cyan-100">{user?.name || 'User'}</p>
          </div>

          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full rounded-xl border border-rose-400/40 bg-rose-900/30 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/45"
          >
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/45 md:hidden"
        />
      )}
    </>
  );
}
