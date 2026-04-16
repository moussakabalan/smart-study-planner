import bcrypt from "bcryptjs";

const saltRounds = 10;

//? Saves a new user after hashing the password
export function CreateUser(db, { email, password }) {
  const normalized = String(email).trim().toLowerCase();
  const hash = bcrypt.hashSync(password, saltRounds);

  try {
    const info = db
      .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
      .run(normalized, hash);

    return { id: info.lastInsertRowid, email: normalized };
  } catch (e) {
    if (String(e.message || "").includes("UNIQUE")) {
      return null;
    }
    throw e;
  }
}

//? Looks up a user by email for login
export function GetUserByEmail(db, email) {
  const normalized = String(email).trim().toLowerCase();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(normalized);
}

//? Checks password at login time
export function PasswordMatches(plain, hash) {
  return bcrypt.compareSync(plain, hash);
}

//? Small public profile for /me
export function GetUserPublic(db, id) {
  const row = db.prepare("SELECT id, email FROM users WHERE id = ?").get(id);
  return row || null;
}