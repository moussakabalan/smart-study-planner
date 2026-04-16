import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

//? Sends guests to login before any app screen that needs their data
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="page-lead">Loading…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}