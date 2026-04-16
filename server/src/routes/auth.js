import { Router } from "express";
import { body, validationResult } from "express-validator";
import * as UserService from "../services/userService.js";

function SendValidationError(res, req) {
  const e = validationResult(req);
  const first = e.array({ onlyFirstError: true })[0];
  return res.status(400).json({ error: first?.msg || "Invalid input" });
}

//? Register, login, logout, and who am I
export function AuthRouter(db) {
  const r = Router();

  r.get("/me", (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }
    const user = UserService.GetUserPublic(db, req.session.userId);
    return res.json({ user });
  });

  r.post(
    "/register",
    [
      body("email").trim().isEmail().withMessage("Valid email required"),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters"),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      const created = UserService.CreateUser(db, {
        email: req.body.email,
        password: req.body.password,
      });

      if (!created) {
        return res.status(409).json({ error: "That email is already taken" });
      }

      req.session.userId = created.id;
      return res.status(201).json({ user: { id: created.id, email: created.email } });
    }
  );

  r.post(
    "/login",
    [
      body("email").trim().isEmail().withMessage("Valid email required"),
      body("password").notEmpty().withMessage("Password required"),
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) {
        return SendValidationError(res, req);
      }

      const row = UserService.GetUserByEmail(db, req.body.email);
      if (!row || !UserService.PasswordMatches(req.body.password, row.password_hash)) {
        return res.status(401).json({ error: "Wrong email or password" });
      }

      req.session.userId = row.id;
      return res.json({ user: { id: row.id, email: row.email } });
    }
  );

  r.post("/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(204).send();
    });
  });

  return r;
}