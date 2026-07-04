import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createEmployee } from "../api/employees";
import { getPeople } from "../api/people";
import { ApiError } from "../api/client";
import type { Department, NewEmployeeInput, Person } from "../types";

const DEPARTMENTS: Department[] = ["Engineering", "Sales", "Marketing", "HR", "Finance"];

const emptyForm: NewEmployeeInput = {
  first_name: "",
  last_name: "",
  email: "",
  job_title: "",
  department: "Engineering",
  start_date: "",
  manager_id: null,
  buddy_id: null,
};

export function AddEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState<NewEmployeeInput>(emptyForm);
  const [people, setPeople] = useState<Person[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPeople()
      .then(setPeople)
      .catch(() => setPeople([]));
  }, []);

  // Managers come from people explicitly marked as Manager. Buddies can
  // reasonably be a Buddy-type person or a regular Colleague - HR isn't
  // going to assign the IT contact or another HR person as someone's
  // day-to-day buddy.
  const managers = people.filter((p) => p.type === "Manager");
  const buddyCandidates = people.filter((p) => p.type === "Buddy" || p.type === "Colleague");

  const update = <K extends keyof NewEmployeeInput>(key: K, value: NewEmployeeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const employee = await createEmployee(form);
      navigate(`/hr/employees/${employee.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create this employee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <Link
        to="/hr"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to HR dashboard
      </Link>

      <div className="page-header">
        <span className="page-eyebrow">HR</span>
        <h1 className="page-title">Add employee</h1>
        <p className="page-subtitle">
          A default onboarding plan is generated automatically once you save.
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="card-grid mb-24" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="first_name">First name</label>
            <input
              id="first_name"
              className="form-select"
              required
              value={form.first_name}
              onChange={(e) => update("first_name", e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              className="form-select"
              required
              value={form.last_name}
              onChange={(e) => update("last_name", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-select"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="job_title">Job title</label>
          <input
            id="job_title"
            className="form-select"
            required
            value={form.job_title}
            onChange={(e) => update("job_title", e.target.value)}
          />
        </div>

        <div className="card-grid mb-24" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="department">Department</label>
            <select
              id="department"
              className="form-select"
              value={form.department}
              onChange={(e) => update("department", e.target.value as Department)}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="start_date">Start date</label>
            <input
              id="start_date"
              type="date"
              className="form-select"
              required
              value={form.start_date}
              onChange={(e) => update("start_date", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="manager_id">Manager (optional)</label>
          <select
            id="manager_id"
            className="form-select"
            value={form.manager_id ?? ""}
            onChange={(e) => update("manager_id", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Not assigned yet</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.name} · {m.department}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="buddy_id">Onboarding buddy (optional)</label>
          <select
            id="buddy_id"
            className="form-select"
            value={form.buddy_id ?? ""}
            onChange={(e) => update("buddy_id", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Not assigned yet</option>
            {buddyCandidates.map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.department ?? p.job_title}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="blocker-banner mb-24" style={{ marginTop: 0 }}>
            {error}
          </div>
        )}

        <div className="modal-actions" style={{ justifyContent: "flex-start" }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Create employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
