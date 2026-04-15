import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div>
      <header>
        <p>
          <b>Smart Study Planner</b>
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
        </nav>
      </header>

      <hr />

      <main>{children}</main>

      <hr />

      <footer>
        <small>Looking better now... :).</small>
      </footer>
    </div>
  );
}