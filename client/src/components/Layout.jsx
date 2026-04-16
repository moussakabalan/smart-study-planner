import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <header>
        <p>
          <b>Smart Study Planner</b>
          {user?.email ? (
            <>
              {" "}
              <small>({user.email})</small>
            </>
          ) : null}
        </p>
        <nav aria-label="Main">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
            Dashboard
          </NavLink>
          <span className="sep">|</span>
          <NavLink to="/tasks" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Tasks
          </NavLink>
          <span className="sep">|</span>
          <NavLink to="/planner" className={({ isActive }) => (isActive ? "active" : undefined)}>
            Weekly planner
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
            Log out
          </button>
        </nav>
      </header>

      <hr />

      <main>
        <Outlet />
      </main>

      <hr />

      <footer>
        <small>Looking better now... :).</small>
      </footer>
    </div>
  );
}