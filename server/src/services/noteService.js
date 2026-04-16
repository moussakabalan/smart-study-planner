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

//? Gets notes for one user with optional search and task filter
export function GetNotes(db, userId, { q, taskId } = {}) {
  const clauses = ["n.user_id = ?"];
  const params = [userId];

  if (q && String(q).trim()) {
    const like = `%${String(q).trim().replace(/%/g, "\\%")}%`;
    clauses.push("(LOWER(n.title) LIKE LOWER(?) OR LOWER(n.body) LIKE LOWER(?))");
    params.push(like, like);
  }

  if (taskId) {
    clauses.push("n.task_id = ?");
    params.push(taskId);
  }

  const where = `WHERE ${clauses.join(" AND ")}`;
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

//? Loads one note for this user
export function GetNoteById(db, userId, id) {
  const row = db
    .prepare(
      `SELECT
         n.*,
         t.title AS task_title
       FROM notes n
       LEFT JOIN tasks t ON t.id = n.task_id
       WHERE n.id = ? AND n.user_id = ?`
    )
    .get(id, userId);

  return row ? RowToNote(row) : undefined;
}

//? Creates a note for this user
export function CreateNote(db, userId, input) {
  const info = db
    .prepare(
      `INSERT INTO notes (user_id, task_id, title, body, format)
       VALUES (@user_id, @task_id, @title, @body, @format)`
    )
    .run({
      user_id: userId,
      task_id: input.taskId ?? null,
      title: input.title,
      body: input.body ?? "",
      format: input.format,
    });

  return GetNoteById(db, userId, info.lastInsertRowid);
}

//? Updates a note for this user
export function UpdateNote(db, userId, id, input) {
  const existing = db.prepare("SELECT id FROM notes WHERE id = ? AND user_id = ?").get(id, userId);
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
     WHERE id = @id AND user_id = @user_id`
  ).run({
    id,
    user_id: userId,
    task_id: input.taskId ?? null,
    title: input.title,
    body: input.body ?? "",
    format: input.format,
  });

  return GetNoteById(db, userId, id);
}

//? Deletes a note for this user
export function DeleteNote(db, userId, id) {
  const info = db.prepare("DELETE FROM notes WHERE id = ? AND user_id = ?").run(id, userId);
  return info.changes > 0;
}