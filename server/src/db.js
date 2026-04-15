import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

//? Opens SQLite and makes sure tables from schema.sql exist (santiy check pretty much)
export function OpenDb() {
  const raw = process.env.DATABASE_PATH || path.join("database", "app.sqlite");
  const dbPath = path.isAbsolute(raw) ? raw : path.join(repoRoot, raw);

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  const schemaPath = path.join(repoRoot, "database", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  db.exec(sql);

  return db;
}
