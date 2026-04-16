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

//? Gets sessions between two dates (inclusive) and includes task titles
export function GetSessionsInRange(db, from, to) {
  const rows = db
    .prepare(
      `SELECT
         s.*,
         t.title AS task_title
       FROM study_sessions s
       JOIN tasks t ON t.id = s.task_id
       WHERE date(s.session_date) >= date(?)
         AND date(s.session_date) <= date(?)
       ORDER BY date(s.session_date) ASC, s.id ASC`
    )
    .all(from, to);

  return rows.map(RowToSession);
}

//? Creates a study session and returns the saved row
export function CreateSession(db, input) {
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
       WHERE s.id = ?`
    )
    .get(info.lastInsertRowid);

  return row ? RowToSession(row) : undefined;
}

//? Deletes one session by id
export function DeleteSession(db, id) {
  const info = db.prepare("DELETE FROM study_sessions WHERE id = ?").run(id);
  return info.changes > 0;
}