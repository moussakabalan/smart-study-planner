//? Maps a joined session row to something the client can use quickly
function RowToSession(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    taskTitle: row.task_title,
    sessionDate: row.session_date,
    plannedDurationMinutes: row.planned_duration_minutes,
    actualDurationMinutes: row.actual_duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

//? Gets sessions in a date range for this user only
export function GetSessionsInRange(db, userId, from, to) {
  const rows = db
    .prepare(
      `SELECT
         s.*,
         t.title AS task_title
       FROM study_sessions s
       JOIN tasks t ON t.id = s.task_id
       WHERE t.user_id = ?
         AND date(s.session_date) >= date(?)
         AND date(s.session_date) <= date(?)
       ORDER BY date(s.session_date) ASC, s.id ASC`
    )
    .all(userId, from, to);

  return rows.map(RowToSession);
}

//? Creates a study session if the task belongs to this user
export function CreateSession(db, userId, input) {
  const task = db
    .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
    .get(input.taskId, userId);
  if (!task) {
    return undefined;
  }

  const info = db
    .prepare(
      `INSERT INTO study_sessions
         (task_id, session_date, planned_duration_minutes, actual_duration_minutes)
       VALUES
         (@task_id, @session_date, @planned_duration_minutes, @actual_duration_minutes)`
    )
    .run({
      task_id: input.taskId,
      session_date: input.sessionDate,
      planned_duration_minutes: input.plannedDurationMinutes,
      actual_duration_minutes: input.actualDurationMinutes ?? null,
    });

  const row = db
    .prepare(
      `SELECT
         s.*,
         t.title AS task_title
       FROM study_sessions s
       JOIN tasks t ON t.id = s.task_id
       WHERE s.id = ? AND t.user_id = ?`
    )
    .get(info.lastInsertRowid, userId);

  return row ? RowToSession(row) : undefined;
}

//? Deletes one session if it belongs to this user through the task
export function DeleteSession(db, userId, id) {
  const info = db
    .prepare(
      `DELETE FROM study_sessions
       WHERE id = ?
         AND task_id IN (SELECT id FROM tasks WHERE user_id = ?)`
    )
    .run(id, userId);
  return info.changes > 0;
}