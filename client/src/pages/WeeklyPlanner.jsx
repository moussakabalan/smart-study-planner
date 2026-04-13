import { useMemo, useState } from "react";

function NewId() {
  return crypto.randomUUID();
}

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

//? Week strip with sample sessions so the planner layout is visible early :)
export default function WeeklyPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);

  const [sessions, setSessions] = useState(() => {
    const monday = StartOfWeekMonday(new Date());
    const weekKey = FormatIsoDate(monday);

    return [
      {
        id: NewId(),
        taskTitle: "Biology reading",
        dayIndex: 1,
        durationMinutes: 60,
        weekStart: weekKey,
      },
      {
        id: NewId(),
        taskTitle: "Calculus practice",
        dayIndex: 3,
        durationMinutes: 90,
        weekStart: weekKey,
      },
    ];
  });

  const weekStart = useMemo(() => {
    const base = StartOfWeekMonday(new Date());
    return AddDays(base, weekOffset * 7);
  }, [weekOffset]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => AddDays(weekStart, i));
  }, [weekStart]);

  const sessionsByDay = useMemo(() => {
    const map = new Map();
    days.forEach((d) => map.set(FormatIsoDate(d), []));

    const weekKey = FormatIsoDate(weekStart);

    sessions
      .filter((s) => s.weekStart === weekKey)
      .forEach((s) => {
        const dayDate = AddDays(weekStart, s.dayIndex);
        const key = FormatIsoDate(dayDate);
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key).push(s);
      });

    return map;
  }, [sessions, days, weekStart]);

  const [draft, setDraft] = useState({
    taskTitle: "",
    dayIndex: 0,
    durationMinutes: 60,
  });

  function AddSession(event) {
    event.preventDefault();
    if (!draft.taskTitle.trim()) {
      return;
    }

    setSessions((prev) => [
      ...prev,
      {
        id: NewId(),
        taskTitle: draft.taskTitle.trim(),
        dayIndex: Number(draft.dayIndex),
        durationMinutes: Math.max(1, Number(draft.durationMinutes) || 60),
        weekStart: FormatIsoDate(weekStart),
      },
    ]);

    setDraft({ taskTitle: "", dayIndex: 0, durationMinutes: 60 });
  }

  function RemoveSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="page">
      <h1 className="page-title">Weekly planner</h1>
      <p className="page-lead">Move between weeks and slot sample study blocks. Data resets on refresh for now.</p>

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
        <h2 className="panel-title">Add sample session</h2>
        <form className="form-grid form-grid-tight" onSubmit={AddSession}>
          <label className="field">
            <span className="field-label">Linked task title</span>
            <input
              className="input"
              value={draft.taskTitle}
              onChange={(e) => setDraft((d) => ({ ...d, taskTitle: e.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Day</span>
            <select
              className="input"
              value={draft.dayIndex}
              onChange={(e) => setDraft((d) => ({ ...d, dayIndex: e.target.value }))}
            >
              {days.map((d, i) => (
                <option key={i} value={i}>
                  {d.toLocaleDateString(undefined, { weekday: "long" })}
                </option>
              ))}
            </select>
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

              {list.length === 0 ? (
                <p className="muted day-empty">No sessions</p>
              ) : (
                <ul className="session-list">
                  {list.map((s) => (
                    <li key={s.id} className="session-card">
                      <div>
                        <div className="session-title">{s.taskTitle}</div>
                        <div className="session-meta">{s.durationMinutes} minutes</div>
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
