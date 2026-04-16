function RowToNote(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    taskTitle: row.task_title ?? "",
    title: row.title,
    body: row.body,
    format: row.format,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

//? Gets notes with optional text search and task filter
export function GetNotes(db, { q, taskId } = {}) {
  const clauses = [];
  const params = [];

  if (q && String(q).trim()) {
    const like = `%${String(q).trim().replace(/%/g, "\\%")}%`;
    clauses.push("(LOWER(n.title) LIKE LOWER(?) OR LOWER(n.body) LIKE LOWER(?))");
    params.push(like, like);
  }

  if (taskId) {
    clauses.push("n.task_id = ?");
    params.push(taskId);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT
         n.*,
         t.title AS task_title
       FROM notes n
       LEFT JOIN tasks t ON t.id = n.task_id
       ${where}
       ORDER BY n.updated_at DESC, n.id DESC`
    )
    .all(...params);

  return rows.map(RowToNote);
}

//? Loads one note by id
export function GetNoteById(db, id) {
  const row = db
    .prepare(
      `SELECT
         n.*,
         t.title AS task_title
       FROM notes n
       LEFT JOIN tasks t ON t.id = n.task_id
       WHERE n.id = ?`
    )
    .get(id);

  return row ? RowToNote(row) : undefined;
}

//? Creates a note row
export function CreateNote(db, input) {
  const info = db
    .prepare(
      `INSERT INTO notes (task_id, title, body, format)
       VALUES (@task_id, @title, @body, @format)`
    )
    .run({
      task_id: input.taskId ?? null,
      title: input.title,
      body: input.body ?? "",
      format: input.format,
    });

  return GetNoteById(db, info.lastInsertRowid);
}

//? Updates one note row
export function UpdateNote(db, id, input) {
  const existing = db.prepare("SELECT id FROM notes WHERE id = ?").get(id);
  if (!existing) {
    return undefined;
  }

  db.prepare(
    `UPDATE notes SET
       task_id = @task_id,
       title = @title,
       body = @body,
       format = @format,
       updated_at = datetime('now')
     WHERE id = @id`
  ).run({
    id,
    task_id: input.taskId ?? null,
    title: input.title,
    body: input.body ?? "",
    format: input.format,
  });

  return GetNoteById(db, id);
}

//? Deletes one note row
export function DeleteNote(db, id) {
  const info = db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  return info.changes > 0;
}