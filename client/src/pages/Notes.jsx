import { useMemo, useState } from "react";

function NewId() {
  return crypto.randomUUID();
}

//? Notebook entries kept in memory with simple search and optional task link text
export default function Notes() {
  const [notes, setNotes] = useState(() => [
    {
      id: NewId(),
      title: "Lecture keywords",
      body: "- Mitosis\n- Meiosis\n- Crossing over",
      format: "markdown",
      linkedTaskTitle: "Read chapter 4",
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    body: "",
    format: "plain",
    linkedTaskTitle: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return notes;
    }

    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.linkedTaskTitle && n.linkedTaskTitle.toLowerCase().includes(q))
    );
  }, [notes, search]);

  function SaveNote(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      body: form.body,
      format: form.format,
      linkedTaskTitle: form.linkedTaskTitle.trim(),
    };

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingId ? { ...n, ...payload } : n))
      );
      setEditingId(null);
    } else {
      setNotes((prev) => [...prev, { id: NewId(), ...payload }]);
    }

    setForm({
      title: "",
      body: "",
      format: "plain",
      linkedTaskTitle: "",
    });
  }

  function StartEdit(note) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      body: note.body,
      format: note.format,
      linkedTaskTitle: note.linkedTaskTitle ?? "",
    });
  }

  function RemoveNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({
        title: "",
        body: "",
        format: "plain",
        linkedTaskTitle: "",
      });
    }
  }

  function CancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      body: "",
      format: "plain",
      linkedTaskTitle: "",
    });
  }

  return (
    <div className="page">
      <h1 className="page-title">Notes</h1>
      <p className="page-lead">Plain text or markdown bodies. Link text is just a label until tasks load from the API.</p>

      <section className="panel" aria-label="Search notes">
        <label className="field">
          <span className="field-label">Search notes</span>
          <input
            type="search"
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, body, or linked task"
          />
        </label>
      </section>

      <section className="panel" aria-label="Note form">
        <h2 className="panel-title">{editingId ? "Edit note" : "New note"}</h2>

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
              <option value="plain">Plain text</option>
              <option value="markdown">Markdown</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Linked task (optional)</span>
            <input
              className="input"
              value={form.linkedTaskTitle}
              onChange={(e) => setForm((f) => ({ ...f, linkedTaskTitle: e.target.value }))}
              placeholder="e.g. Essay outline"
            />
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
              {editingId ? "Save note" : "Add note"}
            </button>
            {editingId ? (
              <button type="button" className="button button-ghost" onClick={CancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel" aria-label="Notes list">
        <h2 className="panel-title">All notes ({filtered.length})</h2>

        {filtered.length === 0 ? (
          <p className="muted">No notes match your search.</p>
        ) : (
          <ul className="note-list">
            {filtered.map((note) => (
              <li key={note.id} className="note-card">
                <div className="note-card-head">
                  <div>
                    <div className="note-title">{note.title}</div>
                    <div className="note-meta">
                      {note.format === "markdown" ? "Markdown" : "Plain text"}
                      {note.linkedTaskTitle ? ` · Linked: ${note.linkedTaskTitle}` : ""}
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
