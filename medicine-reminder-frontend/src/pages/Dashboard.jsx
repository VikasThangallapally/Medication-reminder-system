import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryList from '../components/HistoryList';
import useAuth from '../hooks/useAuth';
import useReminderChecker from '../hooks/useReminderChecker';
import Loader from '../components/Loader';
import MedicineCard from '../components/MedicineCard';
import MedicineFormModal from '../components/MedicineFormModal';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';
import ReminderCard from '../components/ReminderCard';
import Sidebar from '../components/Sidebar';
import { medicineService, reminderService } from '../services/api';

function getId(medicine) {
  return medicine._id || medicine.id;
}

function normalizeMedicine(rawMedicine, todayKey, nowKey) {
  const timeSlots = (rawMedicine.timeSlots || []).map((slot) => (typeof slot === 'string' ? slot : slot.time));
  const logs = rawMedicine.logs || [];

  const mappedSlots = timeSlots.map((time) => {
    const log = logs.find((entry) => entry.date === todayKey && entry.time === time);
    if (log) {
      return { time, status: log.status };
    }

    if (time < nowKey) {
      return { time, status: 'missed' };
    }

    return { time, status: 'pending' };
  });

  return {
    ...rawMedicine,
    timeSlots: mappedSlots,
  };
}

function activeToday(medicine, todayKey) {
  const start = (medicine.startDate || '').slice(0, 10);
  const end = (medicine.endDate || '').slice(0, 10);
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = weekdays[new Date().getDay()];
  const hasDayRules = Array.isArray(medicine.daysOfWeek) && medicine.daysOfWeek.length > 0;
  const dayAllowed = !hasDayRules || medicine.daysOfWeek.includes(todayName);

  return start <= todayKey && todayKey <= end && dayAllowed;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [allMedicines, setAllMedicines] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const nowKey = format(new Date(), 'HH:mm');

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await medicineService.getAll();
      const list = data.medicines || data || [];
      setAllMedicines(list.map((item) => normalizeMedicine(item, todayKey, nowKey)));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load medicines.');
    } finally {
      setLoading(false);
    }
  }, [todayKey, nowKey]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const todayMedicines = useMemo(
    () => allMedicines.filter((item) => activeToday(item, todayKey)),
    [allMedicines, todayKey]
  );

  const historyMedicines = useMemo(
    () =>
      allMedicines.filter((item) => {
        const end = (item.endDate || '').slice(0, 10);
        const hasHistoryLogs = Array.isArray(item.logs) && item.logs.length > 0;
        const hasStatusChanges = Array.isArray(item.timeSlots)
          && item.timeSlots.some((slot) => slot?.status && slot.status !== 'pending');
        return hasHistoryLogs || hasStatusChanges || (end && end < todayKey);
      }),
    [allMedicines, todayKey]
  );

  const upcomingCount = useMemo(
    () => todayMedicines.flatMap((item) => item.timeSlots).filter((slot) => slot.status === 'pending').length,
    [todayMedicines]
  );

  const missedCount = useMemo(
    () => todayMedicines.flatMap((item) => item.timeSlots).filter((slot) => slot.status === 'missed').length,
    [todayMedicines]
  );

  const { highlightedMedicineIds } = useReminderChecker({
    medicines: todayMedicines,
    todayKey,
  });

  const markStatus = async (medicine, status) => {
    try {
      const targetSlot = medicine.timeSlots.find((slot) => slot.status === 'pending') || medicine.timeSlots[0];

      const payload = {
        medicineId: getId(medicine),
        date: todayKey,
        time: targetSlot?.time,
        status,
      };

      try {
        await reminderService.mark(payload);
      } catch {
        await medicineService.markStatus(getId(medicine), {
          date: payload.date,
          time: payload.time,
          status: payload.status,
        });
      }

      await loadMedicines();
    } catch {
      setError('Unable to update medicine status.');
    }
  };

  const upsertMedicineInState = useCallback((medicine) => {
    setAllMedicines((prev) => {
      const normalized = normalizeMedicine(medicine, todayKey, nowKey);
      const id = getId(normalized);
      const exists = prev.some((item) => getId(item) === id);
      if (!exists) {
        return [normalized, ...prev];
      }
      return prev.map((item) => (getId(item) === id ? normalized : item));
    });
  }, [todayKey, nowKey]);

  const handleSubmitMedicine = async (payload) => {
    setSaving(true);
    setError('');
    try {
      if (editingMedicine) {
        const { data } = await medicineService.update(getId(editingMedicine), payload);
        const updated = data.medicine || data;
        upsertMedicineInState(updated);
      } else {
        const { data } = await medicineService.create(payload);
        const created = data.medicine || data;
        upsertMedicineInState(created);
      }

      setFormModalOpen(false);
      setEditingMedicine(null);
      await loadMedicines();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save medicine.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirmDelete) {
      return;
    }

    try {
      await medicineService.remove(getId(confirmDelete));
      setAllMedicines((prev) => prev.filter((item) => getId(item) !== getId(confirmDelete)));
      setConfirmDelete(null);
      await loadMedicines();
    } catch {
      setError('Unable to delete medicine.');
    }
  };

  const onClearHistory = async () => {
    if (!historyMedicines.length) {
      setClearHistoryOpen(false);
      return;
    }

    setClearingHistory(true);
    try {
      await Promise.all(historyMedicines.map((medicine) => medicineService.remove(getId(medicine))));
      const historyIds = new Set(historyMedicines.map((medicine) => getId(medicine)));
      setAllMedicines((prev) => prev.filter((item) => !historyIds.has(getId(item))));
      setClearHistoryOpen(false);
      await loadMedicines();
    } catch {
      setError('Unable to clear history.');
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

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
          <div id="add" />
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
            <div>
              <h2 className="font-display text-3xl text-cyan-50">Today&apos;s Dashboard</h2>
              <p className="mt-1 text-sm text-cyan-100/80">Track upcoming doses and missed entries instantly.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingMedicine(null);
                setFormModalOpen(true);
              }}
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-emerald-400"
            >
              Add Medicine
            </button>
          </div>

          {error && <p className="mt-4 rounded-lg border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">{error}</p>}

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <ReminderCard title="Medicines Today" count={todayMedicines.length} tone="default" />
            <ReminderCard title="Upcoming Doses" count={upcomingCount} tone="good" />
            <ReminderCard title="Missed Doses" count={missedCount} tone="danger" />
          </section>

          <section className="mt-6">
            {loading ? (
              <Loader label="Fetching today's medicines..." />
            ) : todayMedicines.length === 0 ? (
              <div className="glass-panel rounded-2xl border border-dashed border-brand-200 p-10 text-center">
                <p className="text-sm text-cyan-100/75">No medicines scheduled for today.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todayMedicines.map((medicine) => (
                  <MedicineCard
                    key={getId(medicine)}
                    medicine={medicine}
                    isHighlighted={highlightedMedicineIds.includes(String(getId(medicine)))}
                    onEdit={(item) => {
                      setEditingMedicine(item);
                      setFormModalOpen(true);
                    }}
                    onDelete={(item) => setConfirmDelete(item)}
                    onMarkTaken={(item) => markStatus(item, 'taken')}
                    onMarkMissed={(item) => markStatus(item, 'missed')}
                  />
                ))}
              </div>
            )}
          </section>

          <section id="history" className="mt-10">
            <h3 className="font-display text-2xl text-cyan-50">Previous Medicines / History</h3>
            <p className="mt-1 text-sm text-cyan-100/80">Past schedules and status summary.</p>
            <div className="mt-4">
              {loading ? (
                <Loader label="Loading history..." />
              ) : (
                <HistoryList
                  medicines={historyMedicines}
                  onDeleteMedicine={(medicine) => setConfirmDelete(medicine)}
                  onClearHistory={() => setClearHistoryOpen(true)}
                  clearingAll={clearingHistory}
                />
              )}
            </div>
          </section>
        </main>
      </div>

      <Modal
        isOpen={Boolean(confirmDelete)}
        title="Delete Medicine"
        message="This action will permanently remove the medicine schedule."
        onCancel={() => setConfirmDelete(null)}
        onConfirm={onDelete}
      />

      <Modal
        isOpen={clearHistoryOpen}
        title="Clear History"
        message="This will delete all medicines shown in history. This action cannot be undone."
        onCancel={() => {
          if (clearingHistory) {
            return;
          }
          setClearHistoryOpen(false);
        }}
        onConfirm={onClearHistory}
      />

      <MedicineFormModal
        isOpen={formModalOpen}
        mode={editingMedicine ? 'edit' : 'add'}
        loading={saving}
        initialValues={editingMedicine}
        onCancel={() => {
          if (saving) {
            return;
          }
          setFormModalOpen(false);
          setEditingMedicine(null);
        }}
        onSubmit={handleSubmitMedicine}
      />
    </div>
  );
}
