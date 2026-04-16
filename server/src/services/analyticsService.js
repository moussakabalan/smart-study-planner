function ParseDbDate(value) {
  if (!value) {
    return null;
  }
  return new Date(String(value).replace(" ", "T") + "Z");
}

function HoursFromMinutes(minutes) {
  return Number((Number(minutes || 0) / 60).toFixed(2));
}

//? Analytics for one user only
export function GetAnalyticsSummary(db, userId) {
  const completedCountRow = db
    .prepare("SELECT COUNT(*) AS total FROM tasks WHERE user_id = ? AND status = 'completed'")
    .get(userId);

  const sessionTotalsRow = db
    .prepare(
      `SELECT
         COALESCE(SUM(s.planned_duration_minutes), 0) AS planned_total,
         COALESCE(SUM(s.actual_duration_minutes), 0) AS actual_total
       FROM study_sessions s
       JOIN tasks t ON t.id = s.task_id
       WHERE t.user_id = ?`
    )
    .get(userId);

  const completedRows = db
    .prepare(
      `SELECT created_at, completed_at
       FROM tasks
       WHERE user_id = ?
         AND status = 'completed'
         AND completed_at IS NOT NULL`
    )
    .all(userId);

  let durationTotalHours = 0;
  let durationCount = 0;

  for (const row of completedRows) {
    const createdAt = ParseDbDate(row.created_at);
    const completedAt = ParseDbDate(row.completed_at);
    if (!createdAt || !completedAt) {
      continue;
    }
    const diffHours = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    if (Number.isFinite(diffHours) && diffHours >= 0) {
      durationTotalHours += diffHours;
      durationCount += 1;
    }
  }

  const avgCompletionHours = durationCount
    ? Number((durationTotalHours / durationCount).toFixed(2))
    : 0;

  return {
    tasksCompleted: completedCountRow.total,
    plannedStudyHours: HoursFromMinutes(sessionTotalsRow.planned_total),
    actualStudyHours: HoursFromMinutes(sessionTotalsRow.actual_total),
    averageCompletionHours: avgCompletionHours,
  };
}