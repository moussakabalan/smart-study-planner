import { useEffect, useState } from "react";
import { FetchTasks } from "../api/tasksApi.js";
import {
  CreateNoteApi,
  DeleteNoteApi,
  FetchNotes,
  UpdateNoteApi,
} from "../api/notesApi.js";

//? Notes page backed by API + SQLite
export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    body: "",
    format: "plain",
    taskId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function LoadData() {
      setLoading(true);
      setError(null);
      try {
        const noteParams = {};
        if (search.trim()) {
          noteParams.q = search.trim();
        }
        if (taskFilter !== "all") {
          noteParams.taskId = Number(taskFilter);
        }

        const [noteRows, taskRows] = await Promise.all([
          FetchNotes(noteParams),
          FetchTasks({}),
        ]);

        if (!cancelled) {
          setNotes(noteRows);
          setTasks(taskRows);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.error || e.message || "Could not load notes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    LoadData();
    return () => {
      cancelled = true;
    };
  }, [search, taskFilter]);

  async function RefreshNotes() {
    const params = {};
    if (search.trim()) {
      params.q = search.trim();
    }
    if (taskFilter !== "all") {
      params.taskId = Number(taskFilter);
    }
    setNotes(await FetchNotes(params));
  }

  async function SaveNote(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      body: form.body,
      format: form.format,
      taskId: form.taskId ? Number(form.taskId) : null,
    };

    setError(null);
    try {
      if (editingId) {
        await UpdateNoteApi(editingId, payload);
        setEditingId(null);
      } else {
        await CreateNoteApi(payload);
      }

      await RefreshNotes();
      setForm({
        title: "",
        body: "",
        format: "plain",
        taskId: "",
      });
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Could not save note");
    }
  }

  function StartEdit(note) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      body: note.body,
      format: note.format,
      taskId: note.taskId ? String(note.taskId) : "",
    });
  }

  async function RemoveNote(id) {
    const ok = window.confirm("Are you sure you want to delete this note?");
    if (!ok) {
      return;
    }

    setError(null);
    try {
      await DeleteNoteApi(id);
      await RefreshNotes();
      if (editingId === id) {
        setEditingId(null);
        setForm({
          title: "",
          body: "",
          format: "plain",
          taskId: "",
        });
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Could not delete note");
    }
  }

  function CancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      body: "",
      format: "plain",
      taskId: "",
    });
  }

  return (
    <div className="page">
      <h1 className="page-title">Notes</h1>
      <p className="page-lead">Plain Text or Markdown notes saved in SQLite.</p>
      {error ? <p className="muted">{error}</p> : null}

      <section className="panel" aria-label="Search Notes">
        <div className="filter-row">
          <label className="field">
            <span className="field-label">Search Notes</span>
            <input
              type="search"
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Title or Body"
            />
          </label>
          <label className="field">
            <span className="field-label">Task Filter</span>
            <select
              className="input"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="panel" aria-label="Note Form">
        <h2 className="panel-title">{editingId ? "Edit Note" : "New Note"}</h2>

        <form className="form-stack" onSubmit={SaveNote}>
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
            <span className="field-label">Format</span>
            <select
              className="input"
              value={form.format}
              onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
            >
              <option value="plain">Plain Text</option>
              <option value="markdown">Markdown</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Linked Task (Optional)</span>
            <select
              className="input"
              value={form.taskId}
              onChange={(e) => setForm((f) => ({ ...f, taskId: e.target.value }))}
            >
              <option value="">No Linked Task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Body</span>
            <textarea
              className="input textarea"
              rows={6}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? "Save Note" : "Add Note"}
            </button>
            {editingId ? (
              <button type="button" className="button button-ghost" onClick={CancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel" aria-label="Notes List">
        <h2 className="panel-title">All Notes ({loading ? "…" : notes.length})</h2>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="muted">No notes match your search.</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note.id} className="note-card">
                <div className="note-card-head">
                  <div>
                    <div className="note-title">{note.title}</div>
                    <div className="note-meta">
                      {note.format === "markdown" ? "Markdown" : "Plain Text"}
                      {note.taskTitle ? ` · Linked: ${note.taskTitle}` : ""}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="button button-ghost" onClick={() => StartEdit(note)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => RemoveNote(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <pre className="note-body">{note.body}</pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}