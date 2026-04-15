//? Maps a DB row to the shape the React app expects (yummy data)
function RowToTask(row) {
  return {
    id: row.id,
    title: row.title,
    course: row.course ?? "",
    deadline: row.deadline ?? "",
    priority: row.priority,
    estimatedHours: row.estimated_hours,
    status: row.status,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

//? Loads one task or returns undefined when missing
export function GetTaskById(db, id) {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return row ? RowToTask(row) : undefined;
}

//? Lists tasks with optional search, filters, and upcoming/overdue buckets
export function GetTasks(db, { q, priority, status, category } = {}) {
  const clauses = [];
  const params = [];

  if (q && String(q).trim()) {
    const like = `%${String(q).trim().replace(/%/g, "\\%")}%`;
    clauses.push("(LOWER(title) LIKE LOWER(?) OR LOWER(course) LIKE LOWER(?))");
    params.push(like, like);
  }

  if (priority && priority !== "all") {
    clauses.push("priority = ?");
    params.push(priority);
  }

  if (status && status !== "all") {
    clauses.push("status = ?");
    params.push(status);
  }

  if (category === "upcoming") {
    clauses.push("status != 'completed'");
    clauses.push("deadline IS NOT NULL");
    clauses.push("date(deadline) >= date('now')");
  } else if (category === "overdue") {
    clauses.push("status != 'completed'");
    clauses.push("deadline IS NOT NULL");
    clauses.push("date(deadline) < date('now')");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `SELECT * FROM tasks ${where} ORDER BY (deadline IS NULL), date(deadline) ASC, id ASC`;
  const rows = db.prepare(sql).all(...params);
  return rows.map(RowToTask);
}

//? Inserts a row and returns the new task object
export function CreateTask(db, input) {
  const deadline = input.deadline ? String(input.deadline) : null;
  const completedAt = input.status === "completed" ? new Date().toISOString() : null;

  const info = db
    .prepare(
      `INSERT INTO tasks (title, course, deadline, priority, estimated_hours, status, completed_at)
       VALUES (@title, @course, @deadline, @priority, @estimated_hours, @status, @completed_at)`
    )
    .run({
      title: input.title,
      course: input.course ?? "",
      deadline,
      priority: input.priority,
      estimated_hours: input.estimatedHours,
      status: input.status,
      completed_at: completedAt,
    });

  return GetTaskById(db, info.lastInsertRowid);
}

//? Updates fields and keeps completed_at in sync with status
export function UpdateTask(db, id, input) {
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) {
    return undefined;
  }

  const deadline = input.deadline ? String(input.deadline) : null;
  let completedAt = existing.completed_at;

  if (input.status === "completed") {
    completedAt = completedAt || new Date().toISOString();
  } else {
    completedAt = null;
  }

  db.prepare(
    `UPDATE tasks SET
      title = @title,
      course = @course,
      deadline = @deadline,
      priority = @priority,
      estimated_hours = @estimated_hours,
      status = @status,
      completed_at = @completed_at,
      updated_at = datetime('now')
    WHERE id = @id`
  ).run({
    id,
    title: input.title,
    course: input.course ?? "",
    deadline,
    priority: input.priority,
    estimated_hours: input.estimatedHours,
    status: input.status,
    completed_at: completedAt,
  });

  return GetTaskById(db, id);
}

//? Deletes a task row; sessions cascade in the DB
export function DeleteTask(db, id) {
  const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return info.changes > 0;
}