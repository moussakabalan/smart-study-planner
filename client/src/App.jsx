import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import WeeklyPlanner from "./pages/WeeklyPlanner.jsx";
import Notes from "./pages/Notes.jsx";
import Analytics from "./pages/Analytics.jsx";

//? Wires each route so you can move around the app before the API exists
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/planner" element={<WeeklyPlanner />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Layout>
  );
}
