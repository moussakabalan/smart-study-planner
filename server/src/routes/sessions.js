import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { RequireAuth } from "../middleware/requireAuth.js";
import * as SessionService from "../services/sessionService.js";

function SendValidationError(res, req) {
  const e = validationResult(req);
  const first = e.array({ onlyFirstError: true })[0];
  return res.status(400).json({ error: first?.msg || "Invalid input" });
}

function ParseIsoLocal(iso) {
  if (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(iso);
}

function StartOfWeekMonday(dateValue) {
  const d = ParseIsoLocal(dateValue);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function AddDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function FormatIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

//? Study session REST handlers for planner week view + CRUD bits
export function SessionsRouter(db) {
  const r = Router();
  r.use(RequireAuth);

  r.get(
    "/",
    [
      query("weekStart")
        .optional({ checkFalsy: true })
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("weekStart must be YYYY-MM-DD"),
      query("from")
        .optional({ checkFalsy: true })
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("from must be YYYY-MM-DD"),
      query("to")
        .optional({ checkFalsy: true })
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("to must be YYYY-MM-DD"),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      let from = req.query.from;
      let to = req.query.to;

      if (!from || !to) {
        const weekStartRaw = req.query.weekStart || FormatIsoDate(StartOfWeekMonday(new Date()));
        const weekStart = StartOfWeekMonday(weekStartRaw);
        from = FormatIsoDate(weekStart);
        to = FormatIsoDate(AddDays(weekStart, 6));
      }

      const sessions = SessionService.GetSessionsInRange(db, req.session.userId, from, to);
      return res.json(sessions);
    }
  );

  r.post(
    "/",
    [
      body("taskId").isInt({ min: 1 }).toInt(),
      body("sessionDate")
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("sessionDate must be YYYY-MM-DD"),
      body("plannedDurationMinutes")
        .isInt({ min: 1 })
        .withMessage("plannedDurationMinutes must be at least 1")
        .toInt(),
      body("actualDurationMinutes")
        .optional({ values: "null" })
        .isInt({ min: 0 })
        .withMessage("actualDurationMinutes must be zero or more")
        .toInt(),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      const session = SessionService.CreateSession(db, req.session.userId, {
        taskId: req.body.taskId,
        sessionDate: req.body.sessionDate,
        plannedDurationMinutes: req.body.plannedDurationMinutes,
        actualDurationMinutes: req.body.actualDurationMinutes ?? null,
      });

      if (!session) {
        return res.status(400).json({ error: "Task does not exist" });
      }

      return res.status(201).json(session);
    }
  );

  r.delete("/:id", param("id").isInt({ min: 1 }).toInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const ok = SessionService.DeleteSession(db, req.session.userId, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.status(204).send();
  });

  return r;
}