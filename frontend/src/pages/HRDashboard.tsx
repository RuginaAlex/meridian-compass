import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AlertOctagon, Clock, UserX, Users, UserPlus, ChevronRight } from "lucide-react";
import { getHrDashboard } from "../api/hr";
import type { Employee, HrDashboardData, NeedsAttentionEntry } from "../types";
import { LoadingState, ErrorState } from "../components/StateBlocks";
import { formatDate } from "../utils/date";

type AttentionKind = "blocked" | "overdue" | "missing_manager" | "missing_buddy";

const ATTENTION_META: Record<
  AttentionKind,
  { icon: typeof AlertOctagon; label: (e: Employee, count?: number) => string }
> = {
  blocked: {
    icon: AlertOctagon,
    label: (e, count) => `${e.full_name} has ${count} blocked task${count === 1 ? "" : "s"}`,
  },
  overdue: {
    icon: Clock,
    label: (e, count) => `${e.full_name} has ${count} overdue task${count === 1 ? "" : "s"}`,
  },
  missing_manager: {
    icon: UserX,
    label: (e) => `${e.full_name} has no manager assigned`,
  },
  missing_buddy: {
    icon: Users,
    label: (e) => `${e.full_name} has no onboarding buddy assigned`,
  },
};

export function HRDashboard() {
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getHrDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the HR dashboard."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading HR dashboard..." />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { employees, needs_attention } = data;

  // Flatten the four buckets into one feed, so HR sees one prioritized
  // list instead of four separate boxes to scan independently.
  const attentionItems: { kind: AttentionKind; entry: NeedsAttentionEntry }[] = [
    ...needs_attention.blocked.map((entry) => ({ kind: "blocked" as const, entry })),
    ...needs_attention.overdue.map((entry) => ({ kind: "overdue" as const, entry })),
    ...needs_attention.missing_manager.map((entry) => ({ kind: "missing_manager" as const, entry })),
    ...needs_attention.missing_buddy.map((entry) => ({ kind: "missing_buddy" as const, entry })),
  ];

  const totalBlocked = employees.filter((e) => (e.blocked_count ?? 0) > 0).length;
  const totalOverdue = employees.filter((e) => (e.overdue_count ?? 0) > 0).length;
  const needsSetup = new Set([
    ...needs_attention.missing_manager.map((e) => e.employee.id),
    ...needs_attention.missing_buddy.map((e) => e.employee.id),
  ]).size;

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <span className="page-eyebrow">HR</span>
          <h1 className="page-title">HR Dashboard</h1>
          <p className="page-subtitle">Everyone currently onboarding, and who needs your attention.</p>
        </div>
        <Link to="/hr/add-employee" className="btn btn-primary">
          <UserPlus size={15} />
          Add employee
        </Link>
      </div>

      <div className="card-grid mb-24">
        <div className="card stat-card">
          <span className="stat-card-label">In onboarding</span>
          <span className="stat-card-value">{employees.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-card-label">Blocked</span>
          <span className="stat-card-value" style={{ color: totalBlocked ? "var(--color-warning)" : undefined }}>
            {totalBlocked}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-card-label">Overdue</span>
          <span className="stat-card-value" style={{ color: totalOverdue ? "var(--color-warning)" : undefined }}>
            {totalOverdue}
          </span>
        </div>
        <div className="card stat-card">
          <span className="stat-card-label">Missing setup</span>
          <span className="stat-card-value">{needsSetup}</span>
        </div>
      </div>

      <div className="card mb-24">
        <h3 className="section-title">Needs attention</h3>
        {attentionItems.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13.5 }}>
            Nothing needs your attention right now - everyone's on track.
          </p>
        ) : (
          attentionItems.map(({ kind, entry }, i) => {
            const Icon = ATTENTION_META[kind].icon;
            return (
              <Link
                key={`${kind}-${entry.employee.id}-${i}`}
                to={`/hr/employees/${entry.employee.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 4px",
                  borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                  color: "var(--color-ink)",
                  textDecoration: "none",
                  fontSize: 13.5,
                }}
              >
                <Icon size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>
                  {ATTENTION_META[kind].label(entry.employee, entry.count)}
                </span>
                <ChevronRight size={15} color="var(--color-ink-faint)" />
              </Link>
            );
          })
        )}
      </div>

      <div className="card">
        <h3 className="section-title">All employees in onboarding</h3>
        {employees.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 13.5 }}>
            No one is currently onboarding. Add an employee to get started.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {employees.map((employee) => (
              <Link
                key={employee.id}
                to={`/hr/employees/${employee.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 1.4fr 70px 70px 20px",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 8px",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                  color: "var(--color-ink)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{employee.full_name}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {employee.job_title}
                  </div>
                </div>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  {employee.department}
                </span>
                <span className="text-muted" style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>
                  {formatDate(employee.start_date)}
                </span>
                <div>
                  <div className="progress-bar-track" style={{ marginBottom: 4 }}>
                    <div className="progress-bar-fill" style={{ width: `${employee.progress ?? 0}%` }} />
                  </div>
                  <span className="text-muted" style={{ fontSize: 11.5 }}>
                    {employee.progress ?? 0}%
                  </span>
                </div>
                <span>
                  {(employee.blocked_count ?? 0) > 0 && (
                    <span className="badge badge-blocked">{employee.blocked_count}</span>
                  )}
                </span>
                <span>
                  {(employee.overdue_count ?? 0) > 0 && (
                    <span className="badge badge-overdue">{employee.overdue_count}</span>
                  )}
                </span>
                <ChevronRight size={15} color="var(--color-ink-faint)" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
