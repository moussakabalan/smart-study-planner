//? Stops the request if nobody is logged in
export function RequireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You need to log in first" });
  }
  next();
}