import { useEffect, useState } from "react";
import {
  CreateTaskApi,
  DeleteTaskApi,
  FetchTasks,
  UpdateTaskApi,
} from "../api/tasksApi.js";
import { taskStatusLabel } from "../lib/uiText.js";

const emptyForm = {
  title: "",
  course: "",
  deadline: "",
  priority: "medium",
  estimatedHours: "",
  status: "not_started",
};

//? Task list and form talk to the Endpoints
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function LoadTasks() {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (search.trim()) {
          params.q = search.trim();
        }
        if (filterPriority !== "all") {
          params.priority = filterPriority;
        }
        if (filterStatus !== "all") {
          params.status = filterStatus;
        }

        const data = await FetchTasks(params);
        if (!cancelled) {
          setTasks(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error || e.message || "Could not load tasks");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    LoadTasks();
    return () => {
      cancelled = true;
    };
  }, [filterPriority, filterStatus, search]);

  async function SaveTask(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    const hours = Number(form.estimatedHours);
    const estimatedHours = Number.isFinite(hours) && hours >= 0 ? hours : 0;

    const body = {
      title: form.title.trim(),
      course: form.course.trim(),
      deadline: form.deadline || "",
      priority: form.priority,
      estimatedHours,
      status: form.status,
    };

    setError(null);

    try {
      if (editingId != null) {
        await UpdateTaskApi(editingId, body);
      } else {
        await CreateTaskApi(body);
      }

      const params = {};
      if (search.trim()) {
        params.q = search.trim();
      }
      if (filterPriority !== "all") {
        params.priority = filterPriority;
      }
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      setTasks(await FetchTasks(params));
      setEditingId(null);
      setForm(emptyForm);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Save failed");
    }
  }

  function StartEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      course: task.course ?? "",
      deadline: task.deadline ?? "",
      priority: task.priority,
      estimatedHours: String(task.estimatedHours ?? ""),
      status: task.status,
    });
  }

  async function RemoveTask(id) {
    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) {
      return;
    }

    setError(null);

    try {
      await DeleteTaskApi(id);
      const params = {};
      if (search.trim()) {
        params.q = search.trim();
      }
      if (filterPriority !== "all") {
        params.priority = filterPriority;
      }
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      setTasks(await FetchTasks(params));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Delete failed");
    }
  }

  function CancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  return (
    <div className="page">
      <h1 className="page-title">Tasks</h1>
      <p className="page-lead">Your task list, saved in SQLite.</p>

      {error ? <p className="muted">{error}</p> : null}

      <section className="panel" aria-label="Filters">
        <div className="filter-row">
          <label className="field">
            <span className="field-label">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or Course"
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
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel" aria-label="Task Form">
        <h2 className="panel-title">{editingId != null ? "Edit Task" : "New Task"}</h2>

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
            <span className="field-label">Estimated Hours</span>
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
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {editingId != null ? "Save Changes" : "Add Task"}
            </button>
            {editingId != null ? (
              <button type="button" className="button button-ghost" onClick={CancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel" aria-label="Task List">
        <h2 className="panel-title">Your Tasks ({loading ? "…" : tasks.length})</h2>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="muted">No tasks match your filters.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-row">
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    {task.course || "No Course"} · Due {task.deadline || "—"} ·{" "}
                    {task.estimatedHours}h Est. · {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </div>
                </div>

                <div className="row-actions">
                  <span className={`badge badge-${task.status.replace("_", "-")}`}>
                    {taskStatusLabel(task.status)}
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