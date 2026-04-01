import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsService } from '../services/api';

const statusPalette = ['#06b6d4', '#14b8a6', '#10b981', '#22c55e'];

function SummaryCard({ label, value, hint }) {
  return (
    <article className="glass-panel card-3d rounded-2xl p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/70">{label}</p>
      <p className="mt-2 font-display text-3xl text-cyan-50">{value}</p>
      {hint ? <p className="mt-1 text-sm text-cyan-100/75">{hint}</p> : null}
    </article>
  );
}

function formatDayLabel(dateKey) {
  if (!dateKey) {
    return 'N/A';
  }

  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      setError('');

      try {
        const { data } = await analyticsService.get(30);
        if (active) {
          setAnalytics(data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Unable to load analytics.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  const summary = analytics?.summary || {};
  const trends = analytics?.trends || {};
  const daily = analytics?.daily || [];
  const weekly = analytics?.weekly || [];
  const alerts = analytics?.alerts || [];

  const adherenceBarWidth = `${Math.min(Math.max(summary.adherencePercentage || 0, 0), 100)}%`;
  const takenVsMissed = useMemo(
    () => [
      { name: 'Taken', value: summary.totalTaken || 0 },
      { name: 'Missed', value: summary.totalMissed || 0 },
    ],
    [summary.totalTaken, summary.totalMissed]
  );

  if (loading) {
    return (
      <section className="glass-panel rounded-3xl p-6">
        <p className="text-sm font-semibold text-cyan-100">Loading adherence analytics...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="glass-panel rounded-3xl p-6">
        <p className="rounded-xl border border-rose-400/35 bg-rose-950/55 p-3 text-sm font-semibold text-rose-200">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section id="analytics" className="space-y-5">
      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">Analytics</p>
            <h2 className="mt-2 font-display text-3xl text-cyan-50">Adherence Dashboard</h2>
            <p className="mt-1 max-w-2xl text-sm text-cyan-100/80">
              Daily and weekly adherence, tracked doses, and escalation activity for the last 30 days.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/35 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Overall adherence</p>
            <p className="mt-1 font-display text-3xl text-cyan-50">{summary.adherencePercentage || 0}%</p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-900/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: adherenceBarWidth }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-cyan-100/70">
          <span>{summary.totalTaken || 0} taken</span>
          <span>{summary.totalScheduled || 0} scheduled</span>
          <span>{summary.totalMissed || 0} missed</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Adherence" value={`${summary.adherencePercentage || 0}%`} hint="Taken vs scheduled doses" />
        <SummaryCard label="Taken" value={summary.totalTaken || 0} hint="Confirmed on schedule" />
        <SummaryCard label="Missed" value={summary.totalMissed || 0} hint="Escalated or missed doses" />
        <SummaryCard label="Scheduled" value={summary.totalScheduled || 0} hint="Expected doses in the selected range" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <article className="glass-panel rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl text-cyan-50">Daily Adherence</h3>
              <p className="mt-1 text-sm text-cyan-100/75">Taken dose percentage over time.</p>
            </div>
            <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs font-semibold text-cyan-100/80">
              {daily.length} days
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDayLabel}
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                  tickLine={false}
                  minTickGap={20}
                />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2, 6, 23, 0.92)',
                    border: '1px solid rgba(125, 211, 252, 0.22)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value, name) => [name === 'adherencePercentage' ? `${value}%` : value, name]}
                />
                <Line
                  type="monotone"
                  dataKey="adherencePercentage"
                  name="Adherence %"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#22d3ee' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel rounded-3xl p-5">
          <div>
            <h3 className="font-display text-2xl text-cyan-50">Taken vs Missed</h3>
            <p className="mt-1 text-sm text-cyan-100/75">Completion distribution for the selected period.</p>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={takenVsMissed} layout="vertical" margin={{ left: 10, right: 18 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2, 6, 23, 0.92)',
                    border: '1px solid rgba(125, 211, 252, 0.22)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="value" radius={[0, 16, 16, 0]}>
                  {takenVsMissed.map((entry, index) => (
                    <Cell key={entry.name} fill={statusPalette[index % statusPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="glass-panel rounded-3xl p-5">
          <h3 className="font-display text-2xl text-cyan-50">Weekly Adherence</h3>
          <p className="mt-1 text-sm text-cyan-100/75">Week-over-week completion rate.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="3 3" />
                <XAxis dataKey="weekStart" tick={{ fill: '#cbd5e1', fontSize: 12 }} tickFormatter={(value) => formatDayLabel(value)} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2, 6, 23, 0.92)',
                    border: '1px solid rgba(125, 211, 252, 0.22)',
                    borderRadius: '16px',
                    color: '#e2e8f0',
                  }}
                  formatter={(value, name) => [name === 'adherencePercentage' ? `${value}%` : value, name]}
                />
                <Legend />
                <Bar dataKey="adherencePercentage" name="Adherence %" fill="#14b8a6" radius={[16, 16, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel rounded-3xl p-5">
          <h3 className="font-display text-2xl text-cyan-50">Insights</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Best adherence day</p>
              <p className="mt-2 text-lg font-semibold text-cyan-50">
                {trends.bestAdherenceDay ? formatDayLabel(trends.bestAdherenceDay.date) : 'No data'}
              </p>
              <p className="mt-1 text-sm text-cyan-100/75">
                {trends.bestAdherenceDay ? `${trends.bestAdherenceDay.adherencePercentage}% adherence` : 'No scheduled doses in range.'}
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-300/15 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Most missed time</p>
              <p className="mt-2 text-lg font-semibold text-cyan-50">
                {trends.mostMissedTime?.time || 'No data'}
              </p>
              <p className="mt-1 text-sm text-cyan-100/75">
                {trends.mostMissedTime?.missed || 0} missed doses in the selected period.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Escalation alerts</p>
            {alerts.length ? (
              <div className="mt-3 space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-amber-400/20 bg-amber-950/20 p-3">
                    <p className="text-sm font-semibold text-amber-100">{alert.medicineName}</p>
                    <p className="text-xs text-cyan-100/75">
                      {alert.date} at {alert.time}
                    </p>
                    <p className="mt-1 text-xs text-amber-100/80">Escalation sent to caregiver alert stream.</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-cyan-100/75">No escalation alerts in the selected range.</p>
            )}
          </div>
        </article>
      </section>
    </section>
  );
}