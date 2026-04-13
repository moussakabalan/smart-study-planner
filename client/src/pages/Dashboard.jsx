import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function NewId() {
  return crypto.randomUUID();
}

//? Home view with sample counts and a short list so the layout feels real; just for demo!
export default function Dashboard() {
  const [sampleTasks] = useState(() => [
    {
      id: NewId(),
      title: "Read chapter 4",
      course: "Biology",
      deadline: "2026-04-20",
      priority: "high",
      status: "in_progress",
    },
    {
      id: NewId(),
      title: "Problem set 3",
      course: "Calculus",
      deadline: "2026-04-18",
      priority: "medium",
      status: "not_started",
    },
  ]);

  const stats = useMemo(() => {
    const upcoming = sampleTasks.filter((t) => t.status !== "completed").length;

    return {
      upcoming,
      sessionsThisWeek: 4,
      notesCount: 6,
    };
  }, [sampleTasks]);

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-lead">
        Quick snapshot of your week. Numbers here are sample data until the server is connected.
      </p>

      <section className="card-grid" aria-label="Summary">
        <article className="card">
          <h2 className="card-title">Open tasks</h2>
          <p className="card-metric">{stats.upcoming}</p>
          <Link className="text-link" to="/tasks">
            Go to tasks
          </Link>
        </article>

        <article className="card">
          <h2 className="card-title">Study sessions (sample)</h2>
          <p className="card-metric">{stats.sessionsThisWeek}</p>
          <Link className="text-link" to="/planner">
            Open planner
          </Link>
        </article>

        <article className="card">
          <h2 className="card-title">Notes (sample)</h2>
          <p className="card-metric">{stats.notesCount}</p>
          <Link className="text-link" to="/notes">
            Open notes
          </Link>
        </article>
      </section>

      <section className="panel" aria-label="Upcoming sample tasks">
        <h2 className="panel-title">Sample upcoming tasks</h2>

        <ul className="task-list">
          {sampleTasks.map((task) => (
            <li key={task.id} className="task-row">
              <div>
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  {task.course} · due {task.deadline} · {task.priority} priority
                </div>
              </div>
              <span className={`badge badge-${task.status.replace("_", "-")}`}>
                {task.status.replace("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
