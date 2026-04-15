import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OpenDb } from "./db.js";
import { CreateApp } from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(repoRoot, ".env") });

const db = OpenDb();
const app = CreateApp(db);
const port = Number(process.env.PORT) || 3001;

app.listen(port); //! What starts it all!