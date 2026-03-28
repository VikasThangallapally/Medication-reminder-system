import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import { medicineService } from '../services/api';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function normalizeDate(value) {
  return value ? parseISO(String(value)) : null;
}

function isActiveOnDate(medicine, date) {
  const start = normalizeDate(medicine.startDate);
  const end = normalizeDate(medicine.endDate);
  if (!start || !end) {
    return false;
  }
  return start <= date && date <= end;
}

export default function CalendarView() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    medicineService
      .getAll()
      .then(({ data }) => setMedicines(data.medicines || data || []))
      .catch(() => setError('Unable to load calendar data.'))
      .finally(() => setLoading(false));
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(monthStart),
        end: endOfWeek(monthEnd),
      }),
    [monthStart, monthEnd]
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={() => {
          logout();
          navigate('/logout');
        }}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          user={user}
          onLogout={() => {
            logout();
            navigate('/logout');
          }}
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-3xl text-slate-900">Medicine Calendar</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>

          <p className="mb-4 text-sm text-slate-600">{format(currentDate, 'MMMM yyyy')}</p>
          {error && <p className="mb-4 text-sm font-semibold text-rose-600">{error}</p>}

          {loading ? (
            <Loader label="Preparing calendar..." />
          ) : (
            <div className="rounded-2xl bg-white p-3 shadow-soft md:p-5">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-500">
                {weekDays.map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const dayMedicines = medicines.filter((medicine) => isActiveOnDate(medicine, day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const today = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-28 rounded-xl border p-2 ${
                        isCurrentMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 text-slate-400'
                      } ${today ? 'ring-2 ring-brand-300' : ''}`}
                    >
                      <p className="text-xs font-semibold">{format(day, 'd')}</p>
                      <div className="mt-2 space-y-1">
                        {dayMedicines.slice(0, 2).map((medicine) => (
                          <div
                            key={`${medicine._id || medicine.id}-${format(day, 'yyyyMMdd')}`}
                            className="truncate rounded-md bg-brand-50 px-2 py-1 text-[11px] text-brand-900"
                          >
                            {medicine.name}
                          </div>
                        ))}
                        {dayMedicines.length > 2 && (
                          <p className="text-[11px] font-semibold text-slate-500">+{dayMedicines.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
