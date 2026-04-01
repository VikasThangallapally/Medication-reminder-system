import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Home' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/caregiver', label: 'Caregiver' },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/20 bg-slate-950/90 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2.5 text-center text-xs font-bold tracking-wide transition ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950'
                    : 'text-cyan-100/85 hover:bg-cyan-500/15'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}