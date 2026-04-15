//? Creates the SQLite file (if needed) and applies schema.sql. Used to reproduce on another machine!
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const repoRoot = path.resolve(__dirname, "..");

const dbPath = process.env.DATABASE_PATH
  ? path.isAbsolute(process.env.DATABASE_PATH)
    ? process.env.DATABASE_PATH
    : path.join(repoRoot, process.env.DATABASE_PATH)
  : path.join(__dirname, "app.sqlite");

const schemaPath = path.join(__dirname, "schema.sql");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
const sql = fs.readFileSync(schemaPath, "utf8");
db.exec(sql);
db.close();

process.stdout.write(`Database ready at ${dbPath}\n`);
