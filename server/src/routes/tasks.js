import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { RequireAuth } from "../middleware/requireAuth.js";
import * as TaskService from "../services/taskService.js";

function SendValidationError(res, req) {
  const e = validationResult(req);
  const first = e.array({ onlyFirstError: true })[0];
  return res.status(400).json({ error: first?.msg || "Invalid input" });
}

//? Task REST handlers wired to the service layer
export function TasksRouter(db) {
  const r = Router();
  r.use(RequireAuth);

  const listValidators = [
    query("q").optional({ checkFalsy: true }).trim(),
    query("priority")
      .optional({ checkFalsy: true })
      .isIn(["all", "low", "medium", "high"]),
    query("status")
      .optional({ checkFalsy: true })
      .isIn(["all", "not_started", "in_progress", "completed"]),
    query("category").optional({ checkFalsy: true }).isIn(["upcoming", "overdue"]),
  ];

  r.get("/", listValidators, (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const tasks = TaskService.GetTasks(db, req.session.userId, {
      q: req.query.q,
      priority: req.query.priority,
      status: req.query.status,
      category: req.query.category,
    });

    return res.json(tasks);
  });

  r.get("/:id", param("id").isInt({ min: 1 }).toInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const task = TaskService.GetTaskById(db, req.session.userId, req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.json(task);
  });

  r.post(
    "/",
    [
      body("title").trim().notEmpty().withMessage("Title is required"),
      body("course").optional().isString(),
      body("deadline")
        .optional({ values: "null" })
        .custom((value) => {
          if (value === "" || value === null || value === undefined) {
            return true;
          }
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return true;
          }
          throw new Error("Deadline must be YYYY-MM-DD or empty");
        }),
      body("priority").isIn(["low", "medium", "high"]),
      body("estimatedHours")
        .isFloat({ min: 0 })
        .withMessage("Estimated hours must be zero or more")
        .toFloat(),
      body("status").isIn(["not_started", "in_progress", "completed"]),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      const deadline =
        req.body.deadline === "" || req.body.deadline == null
          ? null
          : String(req.body.deadline).slice(0, 10);

      const task = TaskService.CreateTask(db, req.session.userId, {
        title: req.body.title,
        course: req.body.course ?? "",
        deadline,
        priority: req.body.priority,
        estimatedHours: Number(req.body.estimatedHours),
        status: req.body.status,
      });

      return res.status(201).json(task);
    }
  );

  r.put(
    "/:id",
    param("id").isInt({ min: 1 }).toInt(),
    [
      body("title").trim().notEmpty().withMessage("Title is required"),
      body("course").optional().isString(),
      body("deadline")
        .optional({ values: "null" })
        .custom((value) => {
          if (value === "" || value === null || value === undefined) {
            return true;
          }
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return true;
          }
          throw new Error("Deadline must be YYYY-MM-DD or empty");
        }),
      body("priority").isIn(["low", "medium", "high"]),
      body("estimatedHours")
        .isFloat({ min: 0 })
        .withMessage("Estimated hours must be zero or more")
        .toFloat(),
      body("status").isIn(["not_started", "in_progress", "completed"]),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      const deadline =
        req.body.deadline === "" || req.body.deadline == null
          ? null
          : String(req.body.deadline).slice(0, 10);

      const task = TaskService.UpdateTask(db, req.session.userId, req.params.id, {
        title: req.body.title,
        course: req.body.course ?? "",
        deadline,
        priority: req.body.priority,
        estimatedHours: Number(req.body.estimatedHours),
        status: req.body.status,
      });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.json(task);
    }
  );

  r.delete("/:id", param("id").isInt({ min: 1 }).toInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const ok = TaskService.DeleteTask(db, req.session.userId, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(204).send();
  });

  return r;
}