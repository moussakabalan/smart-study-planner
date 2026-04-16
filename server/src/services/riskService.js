function ParseIsoLocal(iso) {
  if (!iso || typeof iso !== "string") {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return null;
  }
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function StartOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function DayDiff(a, b) {
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.ceil((a.getTime() - b.getTime()) / oneDay);
}

//? Risk rules for one user's tasks only
export function GetRiskSummary(db, userId) {
  const today = StartOfToday();
  const maxHoursPerDay = 3;
  const clusterWindowDays = 7;
  const clusterCountThreshold = 3;

  const activeTasks = db
    .prepare(
      `SELECT id, title, deadline, estimated_hours
       FROM tasks
       WHERE user_id = ?
         AND status != 'completed'
         AND deadline IS NOT NULL`
    )
    .all(userId);

  const riskyTasks = [];
  const overdueTasks = [];
  const upcomingDeadlines = [];

  for (const task of activeTasks) {
    const deadlineDate = ParseIsoLocal(task.deadline);
    if (!deadlineDate) {
      continue;
    }

    const daysRemaining = DayDiff(deadlineDate, today);

    if (daysRemaining < 0) {
      overdueTasks.push({
        taskId: task.id,
        title: task.title,
        deadline: task.deadline,
        daysOverdue: Math.abs(daysRemaining),
      });
      continue;
    }

    upcomingDeadlines.push({
      taskId: task.id,
      title: task.title,
      deadline: task.deadline,
      daysRemaining,
      estimatedHours: task.estimated_hours,
    });

    const safeCapacity = Math.max(1, daysRemaining) * maxHoursPerDay;
    if (Number(task.estimated_hours || 0) > safeCapacity) {
      riskyTasks.push({
        taskId: task.id,
        title: task.title,
        deadline: task.deadline,
        daysRemaining,
        estimatedHours: task.estimated_hours,
        recommendedHoursPerDay: Number((task.estimated_hours / Math.max(1, daysRemaining)).toFixed(2)),
      });
    }
  }

  const clusteredDeadlines = upcomingDeadlines.filter(
    (t) => t.daysRemaining >= 0 && t.daysRemaining <= clusterWindowDays
  );

  return {
    rules: {
      maxHoursPerDay,
      clusterWindowDays,
      clusterCountThreshold,
    },
    counts: {
      riskyTasks: riskyTasks.length,
      overdueTasks: overdueTasks.length,
      clusteredDeadlines: clusteredDeadlines.length,
    },
    warnings: {
      timePressureTasks: riskyTasks,
      overdueTasks,
      clusteredDeadlines:
        clusteredDeadlines.length >= clusterCountThreshold ? clusteredDeadlines : [],
    },
  };
}