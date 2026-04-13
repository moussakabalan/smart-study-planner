import { useMemo, useState } from "react";

function NewId() {
  return crypto.randomUUID();
}

const emptyForm = {
  title: "",
  course: "",
  deadline: "",
  priority: "medium",
  estimatedHours: "",
  status: "not_started",
};

//? Task list stored in memory so forms and filters behave like the real app
export default function Tasks() {
  const [tasks, setTasks] = useState(() => [
    {
      id: NewId(),
      title: "Essay outline",
      course: "English",
      deadline: "2026-04-22",
      priority: "low",
      estimatedHours: 3,
      status: "not_started",
    },
  ]);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }

      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false;
      }

      if (q && !`${task.title} ${task.course}`.toLowerCase().includes(q)) {
        return false;
      }

      return true;
    });
  }, [tasks, filterPriority, filterStatus, search]);

  function SaveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    const hours = Number(form.estimatedHours);
    const estimatedHours = Number.isFinite(hours) && hours >= 0 ? hours : 0;

    if (editingId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                title: form.title.trim(),
                course: form.course.trim(),
                deadline: form.deadline,
                priority: form.priority,
                estimatedHours,
                status: form.status,
              }
            : t
        )
      );
      setEditingId(null);
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: NewId(),
          title: form.title.trim(),
          course: form.course.trim(),
          deadline: form.deadline,
          priority: form.priority,
          estimatedHours,
          status: form.status,
        },
      ]);
    }

    setForm(emptyForm);
  }

  function StartEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      course: task.course,
      deadline: task.deadline,
      priority: task.priority,
      estimatedHours: String(task.estimatedHours ?? ""),
      status: task.status,
    });
  }

  function RemoveTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  }

  function CancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className="page">
      <h1 className="page-title">Tasks</h1>
      <p className="page-lead">Create and edit tasks in the browser only for now.</p>

      <section className="panel" aria-label="Filters">
        <div className="filter-row">
          <label className="field">
            <span className="field-label">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or course"
              className="input"
            />
          </label>

          <label className="field">
            <span className="field-label">Priority</span>
            <select
              className="input"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel" aria-label="Task form">
        <h2 className="panel-title">{editingId ? "Edit task" : "New task"}</h2>

        <form className="form-grid" onSubmit={SaveTask}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Course</span>
            <input
              className="input"
              value={form.course}
              onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field-label">Deadline</span>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field-label">Priority</span>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Estimated hours</span>
            <input
              type="number"
              min="0"
              step="0.25"
              className="input"
              value={form.estimatedHours}
              onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))}
            />
          </label>

          <label className="field">
            <span className="field-label">Status</span>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? "Save changes" : "Add task"}
            </button>
            {editingId ? (
              <button type="button" className="button button-ghost" onClick={CancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel" aria-label="Task list">
        <h2 className="panel-title">Your tasks ({filtered.length})</h2>

        {filtered.length === 0 ? (
          <p className="muted">No tasks match your filters.</p>
        ) : (
          <ul className="task-list">
            {filtered.map((task) => (
              <li key={task.id} className="task-row">
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    {task.course || "No course"} · due {task.deadline || "—"} ·{" "}
                    {task.estimatedHours}h est. · {task.priority}
                  </div>
                </div>

                <div className="row-actions">
                  <span className={`badge badge-${task.status.replace("_", "-")}`}>
                    {task.status.replace("_", " ")}
                  </span>
                  <button type="button" className="button button-ghost" onClick={() => StartEdit(task)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => RemoveTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
