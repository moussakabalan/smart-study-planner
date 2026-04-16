import { useEffect, useMemo, useState } from "react";
import {
  CreateSessionApi,
  DeleteSessionApi,
  FetchSessionsByWeek,
  FetchTasks,
} from "../api/tasksApi.js";

function StartOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function AddDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function FormatDayLabel(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function FormatIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

//? Week planner now talks to the real API and stores sessions in SQLite
export default function WeeklyPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weekStart = useMemo(() => {
    const base = StartOfWeekMonday(new Date());
    return AddDays(base, weekOffset * 7);
  }, [weekOffset]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => AddDays(weekStart, i));
  }, [weekStart]);

  const weekKey = useMemo(() => FormatIsoDate(weekStart), [weekStart]);

  useEffect(() => {
    let cancelled = false;

    async function LoadPlannerData() {
      setLoading(true);
      setError(null);

      try {
        const [taskRows, sessionRows] = await Promise.all([
          FetchTasks({}),
          FetchSessionsByWeek(weekKey),
        ]);

        if (!cancelled) {
          setTasks(taskRows);
          setSessions(sessionRows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error || e.message || "Could not load planner data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    LoadPlannerData();
    return () => {
      cancelled = true;
    };
  }, [weekKey]);

  const sessionsByDay = useMemo(() => {
    const map = new Map();
    days.forEach((d) => map.set(FormatIsoDate(d), []));

    sessions
      .forEach((s) => {
        const key = s.sessionDate;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(s);
      });

    return map;
  }, [sessions, days]);

  const [draft, setDraft] = useState({
    taskId: "",
    sessionDate: "",
    durationMinutes: 60,
  });

  //? Keep the day picker inside the visible week (min/max match state; avoids broken controlled date inputs)
  useEffect(() => {
    setDraft((d) => ({
      ...d,
      sessionDate: weekKey,
    }));
  }, [weekKey]);

  async function AddSession(event) {
    event.preventDefault();
    if (!draft.taskId) {
      return;
    }

    setError(null);
    try {
      await CreateSessionApi({
        taskId: Number(draft.taskId),
        sessionDate: draft.sessionDate,
        plannedDurationMinutes: Math.max(1, Number(draft.durationMinutes) || 60),
      });
      setSessions(await FetchSessionsByWeek(weekKey));
      setDraft((d) => ({ ...d, taskId: "", durationMinutes: 60 }));
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Could not save session");
    }
  }

  async function RemoveSession(id) {
    setError(null);
    try {
      await DeleteSessionApi(id);
      setSessions(await FetchSessionsByWeek(weekKey));
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Could not delete session");
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Weekly planner</h1>
      <p className="page-lead">Move between weeks and create sessions linked to real tasks.</p>
      {error ? <p className="muted">{error}</p> : null}

      <div className="toolbar">
        <button type="button" className="button button-ghost" onClick={() => setWeekOffset((w) => w - 1)}>
          Previous week
        </button>
        <span className="toolbar-label">
          Week of {FormatDayLabel(weekStart)} — {FormatDayLabel(AddDays(weekStart, 6))}
        </span>
        <button type="button" className="button button-ghost" onClick={() => setWeekOffset((w) => w + 1)}>
          Next week
        </button>
        <button type="button" className="button button-ghost" onClick={() => setWeekOffset(0)}>
          This week
        </button>
      </div>

      <section className="panel" aria-label="Add session">
        <h2 className="panel-title">Add session</h2>
        <form className="form-grid form-grid-tight" onSubmit={AddSession}>
          <label className="field">
            <span className="field-label">Task</span>
            <select
              className="input"
              value={draft.taskId}
              onChange={(e) => setDraft((d) => ({ ...d, taskId: e.target.value }))}
              required
            >
              <option value="">Select a task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field-label">Day</span>
            <input
              type="date"
              className="input"
              min={weekKey}
              max={FormatIsoDate(AddDays(weekStart, 6))}
              value={draft.sessionDate}
              onChange={(e) => setDraft((d) => ({ ...d, sessionDate: e.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Minutes</span>
            <input
              type="number"
              min="1"
              className="input"
              value={draft.durationMinutes}
              onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: e.target.value }))}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="button button-primary">
              Add to this week
            </button>
          </div>
        </form>
      </section>

      <div className="week-grid" role="list">
        {days.map((day) => {
          const key = FormatIsoDate(day);
          const list = sessionsByDay.get(key) ?? [];

          return (
            <section key={key} className="day-column" role="listitem">
              <h2 className="day-heading">{FormatDayLabel(day)}</h2>

              {loading ? (
                <p className="muted day-empty">Loading...</p>
              ) : list.length === 0 ? (
                <p className="muted day-empty">No sessions</p>
              ) : (
                <ul className="session-list">
                  {list.map((s) => (
                    <li key={s.id} className="session-card">
                      <div>
                        <div className="session-title">{s.taskTitle}</div>
                        <div className="session-meta">{s.plannedDurationMinutes} minutes</div>
                      </div>
                      <button
                        type="button"
                        className="button button-danger button-small"
                        onClick={() => RemoveSession(s.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}