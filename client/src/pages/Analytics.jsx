import { useEffect, useState } from "react";
import { FetchAnalyticsSummary, FetchRiskSummary } from "../api/analyticsApi.js";

//? Analytics page now uses real backend metrics and warnings
export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function LoadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, riskData] = await Promise.all([
          FetchAnalyticsSummary(),
          FetchRiskSummary(),
        ]);
        if (!cancelled) {
          setSummary(summaryData);
          setRisk(riskData);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error || e.message || "Could not load analytics");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    LoadAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = [
    {
      label: "Tasks Completed",
      value: loading ? "..." : String(summary?.tasksCompleted ?? 0),
    },
    {
      label: "Planned Study Hours",
      value: loading ? "..." : `${summary?.plannedStudyHours ?? 0}h`,
    },
    {
      label: "Actual Study Hours",
      value: loading ? "..." : `${summary?.actualStudyHours ?? 0}h`,
    },
    {
      label: "Average Completion Time",
      value: loading ? "..." : `${summary?.averageCompletionHours ?? 0}h`,
    },
  ];

  return (
    <div className="page">
      <h1 className="page-title">Analytics</h1>
      <p className="page-lead">Server-calculated stats and rule-based risk warnings.</p>
      {error ? <p className="muted">{error}</p> : null}

      <section className="panel" aria-label="Sample Analytics">
        <h2 className="panel-title">Summary</h2>

        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="table-num">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel" aria-label="Risk Warnings">
        <h2 className="panel-title">Risk Warnings</h2>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <p className="muted">
              Time Pressure Tasks: {risk?.counts?.riskyTasks ?? 0} · Overdue Tasks:{" "}
              {risk?.counts?.overdueTasks ?? 0} · Clustered Deadlines:{" "}
              {risk?.counts?.clusteredDeadlines ?? 0}
            </p>

            {risk?.warnings?.timePressureTasks?.length ? (
              <ul className="task-list">
                {risk.warnings.timePressureTasks.map((t) => (
                  <li key={t.taskId} className="task-row">
                    <div>
                      <div className="task-title">{t.title}</div>
                      <div className="task-meta">
                        Due {t.deadline} · {t.estimatedHours}h Estimated · {t.daysRemaining} Days Left
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No time pressure warnings right now.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}