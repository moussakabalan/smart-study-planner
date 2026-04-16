import express from "express";
import cors from "cors";
import { TasksRouter } from "./routes/tasks.js";
import { SessionsRouter } from "./routes/sessions.js";

//? Builds the Express app and mounts REST routes on the given DB handle
export function CreateApp(db) {
  const app = express();
  app.disable("x-powered-by");

  const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
  app.use(cors({ origin: clientOrigin }));

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/tasks", TasksRouter(db));
  app.use("/api/sessions", SessionsRouter(db));

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}