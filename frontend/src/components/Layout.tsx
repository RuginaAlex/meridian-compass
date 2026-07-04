import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Compass, LayoutDashboard, Map, Users, BookOpen, ShieldCheck } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { getEmployees } from "../api/employees";
import type { Employee } from "../types";

export function Layout() {
  const { role, setRole, employeeId, setEmployeeId } = useRole();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // The employee picker needs a list of names to choose from. This is the
  // one piece of data the whole shell needs regardless of which page is
  // active, so it lives here rather than being re-fetched by every page.
  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <Compass size={17} />
          </div>
          <div>
            <div className="sidebar-brand-name">Meridian Compass</div>
            <div className="sidebar-brand-sub">Onboarding</div>
          </div>
        </div>

        <div className="role-switcher">
          <button className={role === "employee" ? "active" : ""} onClick={() => setRole("employee")}>
            New Employee
          </button>
          <button className={role === "hr" ? "active" : ""} onClick={() => setRole("hr")}>
            HR
          </button>
        </div>

        {role === "employee" && employees.length > 0 && (
          <select
            className="employee-select"
            value={employeeId}
            onChange={(e) => setEmployeeId(Number(e.target.value))}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name} · {e.department}
              </option>
            ))}
          </select>
        )}

        <nav className="sidebar-nav mt-24">
          {role === "employee" ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <LayoutDashboard /> Dashboard
              </NavLink>
              <NavLink to="/journey" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <Map /> My Onboarding Journey
              </NavLink>
              <NavLink to="/people" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <Users /> People
              </NavLink>
              <NavLink to="/resources" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <BookOpen /> Resources
              </NavLink>
            </>
          ) : (
            <NavLink to="/hr" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <ShieldCheck /> HR Dashboard
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <p style={{ fontSize: 11.5, color: "var(--color-ink-faint)" }}>
            Demo mode - no login required.
            <br />
            Switch roles above at any time.
          </p>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
