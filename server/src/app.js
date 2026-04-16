import express from "express";
import cors from "cors";
import session from "express-session";
import { TasksRouter } from "./routes/tasks.js";
import { SessionsRouter } from "./routes/sessions.js";
import { NotesRouter } from "./routes/notes.js";
import { AnalyticsRouter } from "./routes/analytics.js";
import { AuthRouter } from "./routes/auth.js";

//? Builds the Express app and mounts REST routes on the given DB handle
export function CreateApp(db) {
  const app = express();
  app.disable("x-powered-by");

  const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  app.use(
    cors({
      origin: clientOrigin,
      credentials: true,
    })
  );

  app.use(express.json());

  app.use(
    session({
      name: "planner.sid",
      secret: process.env.SESSION_SECRET || "dev-secret-change-me-in-env",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", AuthRouter(db));
  app.use("/api/tasks", TasksRouter(db));
  app.use("/api/sessions", SessionsRouter(db));
  app.use("/api/notes", NotesRouter(db));
  app.use("/api/analytics", AnalyticsRouter(db));

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}