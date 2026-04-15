import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FetchTasks, FetchUpcomingTasks } from "../api/tasksApi.js";

//? Dashboard pulls real task counts from the API; sessions/notes stay placeholder until later phases
export default function Dashboard() {
  const [openCount, setOpenCount] = useState(0);
  const [previewTasks, setPreviewTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function Load() {
      setLoading(true);
      setError(null);

      try {
        const all = await FetchTasks({});
        const upcoming = await FetchUpcomingTasks();

        if (cancelled) {
          return;
        }

        setOpenCount(all.filter((t) => t.status !== "completed").length);
        setPreviewTasks(upcoming.slice(0, 8));
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error || e.message || "Could not load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    Load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-lead">Task numbers come from the server. Sessions and notes are still placeholders.</p>

      {error ? <p className="muted">{error}</p> : null}

      <section className="card-grid" aria-label="Summary">
        <article className="card">
          <h2 className="card-title">Open tasks</h2>
          <p className="card-metric">{loading ? "…" : openCount}</p>
          <Link className="text-link" to="/tasks">
            Go to tasks
          </Link>
        </article>

        <article className="card">
          <h2 className="card-title">Study sessions (placeholder)</h2>
          <p className="card-metric">—</p>
          <Link className="text-link" to="/planner">
            Open planner
          </Link>
        </article>

        <article className="card">
          <h2 className="card-title">Notes (placeholder)</h2>
          <p className="card-metric">—</p>
          <Link className="text-link" to="/notes">
            Open notes
          </Link>
        </article>
      </section>

      <section className="panel" aria-label="Upcoming tasks">
        <h2 className="panel-title">Upcoming tasks (from API)</h2>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : previewTasks.length === 0 ? (
          <p className="muted">No upcoming tasks (or none with a future deadline).</p>
        ) : (
          <ul className="task-list">
            {previewTasks.map((task) => (
              <li key={task.id} className="task-row">
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    {task.course || "No course"} · due {task.deadline || "—"} · {task.priority} priority
                  </div>
                </div>
                <span className={`badge badge-${task.status.replace("_", "-")}`}>
                  {task.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}