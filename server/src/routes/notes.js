import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { RequireAuth } from "../middleware/requireAuth.js";
import * as NoteService from "../services/noteService.js";

function SendValidationError(res, req) {
  const e = validationResult(req);
  const first = e.array({ onlyFirstError: true })[0];
  return res.status(400).json({ error: first?.msg || "Invalid input" });
}

//? Notes CRUD and search endpoints
export function NotesRouter(db) {
  const r = Router();
  r.use(RequireAuth);

  r.get(
    "/",
    [
      query("q").optional({ checkFalsy: true }).trim(),
      query("taskId").optional({ checkFalsy: true }).isInt({ min: 1 }).toInt(),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      const notes = NoteService.GetNotes(db, req.session.userId, {
        q: req.query.q,
        taskId: req.query.taskId,
      });
      return res.json(notes);
    }
  );

  r.get("/:id", param("id").isInt({ min: 1 }).toInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const note = NoteService.GetNoteById(db, req.session.userId, req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json(note);
  });

  const saveValidators = [
    body("taskId").optional({ values: "null" }).isInt({ min: 1 }).toInt(),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("body").optional().isString(),
    body("format").isIn(["plain", "markdown"]),
  ];

  r.post("/", saveValidators, (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const taskId = req.body.taskId ?? null;
    if (taskId != null) {
      const exists = db
        .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
        .get(taskId, req.session.userId);
      if (!exists) {
        return res.status(400).json({ error: "Task does not exist" });
      }
    }

    const note = NoteService.CreateNote(db, req.session.userId, {
      taskId,
      title: req.body.title,
      body: req.body.body ?? "",
      format: req.body.format,
    });

    return res.status(201).json(note);
  });

  r.put("/:id", param("id").isInt({ min: 1 }).toInt(), saveValidators, (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const taskId = req.body.taskId ?? null;
    if (taskId != null) {
      const exists = db
        .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
        .get(taskId, req.session.userId);
      if (!exists) {
        return res.status(400).json({ error: "Task does not exist" });
      }
    }

    const note = NoteService.UpdateNote(db, req.session.userId, req.params.id, {
      taskId,
      title: req.body.title,
      body: req.body.body ?? "",
      format: req.body.format,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.json(note);
  });

  r.delete("/:id", param("id").isInt({ min: 1 }).toInt(), (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return SendValidationError(res, req);
    }

    const ok = NoteService.DeleteNote(db, req.session.userId, req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Note not found" });
    }

    return res.status(204).send();
  });

  return r;
}