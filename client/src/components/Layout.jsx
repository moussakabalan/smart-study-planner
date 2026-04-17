import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const ok = window.confirm("Are you sure you want to log out?");
    if (!ok) {
      return;
    }
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="brand-title">Smart Study Planner</p>
          {user?.email ? <p className="brand-subtitle">Signed in as {user.email}</p> : null}
        </div>
        <nav aria-label="Main" className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
            Dashboard
          </NavLink>
          <span className="sep">|</span>
          <NavLink to="/tasks" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Tasks
          </NavLink>
          <span className="sep">|</span>
          <NavLink to="/planner" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Weekly Planner
          </NavLink>
          <span className="sep">|</span>
          <NavLink to="/notes" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Notes
          </NavLink>
          <span className="sep">|</span>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Analytics
          </NavLink>
          <span className="sep">|</span>
          <button type="button" className="link-button" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <small>Built for real student workflow, one week at a time.</small>
      </footer>
    </div>
  );
}