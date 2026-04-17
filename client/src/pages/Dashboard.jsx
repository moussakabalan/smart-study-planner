import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FetchTasks, FetchUpcomingTasks } from "../api/tasksApi.js";
import { FetchAnalyticsSummary, FetchRiskSummary } from "../api/analyticsApi.js";
import { taskStatusLabel } from "../lib/uiText.js";

//? Dashboard now shows tasks + analytics + risk warnings from backend
export default function Dashboard() {
  const [openCount, setOpenCount] = useState(0);
  const [previewTasks, setPreviewTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function Load() {
      setLoading(true);
      setError(null);

      try {
        const [all, upcoming, summaryData, riskData] = await Promise.all([
          FetchTasks({}),
          FetchUpcomingTasks(),
          FetchAnalyticsSummary(),
          FetchRiskSummary(),
        ]);

        if (cancelled) {
          return;
        }

        setOpenCount(all.filter((t) => t.status !== "completed").length);
        setPreviewTasks(upcoming.slice(0, 8));
        setSummary(summaryData);
        setRisk(riskData);
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
      <p className="page-lead">Quick snapshot of what needs attention this week.</p>

      {error ? <p className="muted">{error}</p> : null}

      <section className="card-grid" aria-label="Summary">
        <article className="card">
          <h2 className="card-title">Open Tasks</h2>
          <p className="card-metric">{loading ? "…" : openCount}</p>
          <Link className="text-link" to="/tasks">
            Go To Tasks
          </Link>
        </article>

        <article className="card">
          <h2 className="card-title">Planned vs Actual Study</h2>
          <p className="card-metric">
            {loading ? "…" : `${summary?.plannedStudyHours ?? 0}h / ${summary?.actualStudyHours ?? 0}h`}
          </p>
          <Link className="text-link" to="/analytics">
            Open Analytics
          </Link>
        </article>

        <article className="card">
          <h2 className="card-title">Risk Alerts</h2>
          <p className="card-metric">{loading ? "…" : risk?.counts?.riskyTasks ?? 0}</p>
          <Link className="text-link" to="/analytics">
            View Warnings
          </Link>
        </article>
      </section>

      <section className="panel" aria-label="Risk Summary">
        <h2 className="panel-title">Risk Summary</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <p className="muted">
            Overdue: {risk?.counts?.overdueTasks ?? 0} · Clustered in Next 7 Days:{" "}
            {risk?.counts?.clusteredDeadlines ?? 0}
          </p>
        )}
      </section>

      <section className="panel" aria-label="Upcoming Tasks">
        <h2 className="panel-title">Upcoming Tasks</h2>

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
                    {task.course || "No Course"} · Due {task.deadline || "—"} ·{" "}
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </div>
                </div>
                <span className={`badge badge-${task.status.replace("_", "-")}`}>
                  {taskStatusLabel(task.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}