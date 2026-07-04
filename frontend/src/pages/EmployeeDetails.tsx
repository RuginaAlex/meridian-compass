import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertOctagon, CheckCircle2 } from "lucide-react";
import { getEmployee } from "../api/employees";
import { getTasksForEmployee } from "../api/tasks";
import { getBlockersForEmployee, resolveBlocker } from "../api/blockers";
import type { Blocker, EmployeeDetail, OnboardingTask } from "../types";
import { TASK_STAGES } from "../types";
import { LoadingState, ErrorState } from "../components/StateBlocks";
import { StatusBadge } from "../components/StatusBadge";
import { WaypointProgress } from "../components/WaypointProgress";
import { formatDate, formatRelativeDate, getCurrentStage, groupTasksByStage } from "../utils/date";

export function EmployeeDetails() {
  const { id } = useParams<{ id: string }>();
  const employeeId = Number(id);

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [employeeData, taskData, blockerData] = await Promise.all([
        getEmployee(employeeId),
        getTasksForEmployee(employeeId),
        getBlockersForEmployee(employeeId),
      ]);
      setEmployee(employeeData);
      setTasks(taskData);
      setBlockers(blockerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this employee.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (blockerId: number) => {
    setResolvingId(blockerId);
    try {
      await resolveBlocker(blockerId);
      await load();
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) return <LoadingState label="Loading employee..." />;
  if (error) return <ErrorState message={error} />;
  if (!employee) return null;

  const currentStage = getCurrentStage(tasks);
  const grouped = groupTasksByStage(tasks);
  const openBlockerByTaskId = new Map<number, Blocker>(
    blockers
      .filter((b) => b.status === "Open")
      .map((b): [number, Blocker] => [b.task_id, b])
  );

  return (
    <div>
      <Link
        to="/hr"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 16 }}
      >
        <ArrowLeft size={14} /> Back to HR dashboard
      </Link>

      <div className="page-header">
        <span className="page-eyebrow">Employee</span>
        <h1 className="page-title">{employee.full_name}</h1>
        <p className="page-subtitle">
          {employee.job_title} · {employee.department} · Started {formatDate(employee.start_date)}
        </p>
      </div>

      <div className="card mb-24">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            Onboarding route
          </h3>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {employee.progress}% complete
          </span>
        </div>
        <div className="progress-bar-track mt-24">
          <div className="progress-bar-fill" style={{ width: `${employee.progress}%` }} />
        </div>
        <WaypointProgress currentStage={currentStage} />
      </div>

      <div className="card-grid mb-24">
        <div className="card">
          <p className="stat-card-label">Manager</p>
          {employee.manager ? (
            <>
              <p style={{ fontWeight: 600, marginTop: 4 }}>{employee.manager.name}</p>
              <p className="text-muted" style={{ fontSize: 13 }}>{employee.manager.email}</p>
            </>
          ) : (
            <p style={{ color: "var(--color-warning)", fontSize: 13, marginTop: 4 }}>
              Not assigned yet
            </p>
          )}
        </div>
        <div className="card">
          <p className="stat-card-label">Onboarding buddy</p>
          {employee.buddy ? (
            <>
              <p style={{ fontWeight: 600, marginTop: 4 }}>{employee.buddy.name}</p>
              <p className="text-muted" style={{ fontSize: 13 }}>{employee.buddy.email}</p>
            </>
          ) : (
            <p style={{ color: "var(--color-warning)", fontSize: 13, marginTop: 4 }}>
              Not assigned yet
            </p>
          )}
        </div>
      </div>

      {employee.blocked_tasks.length > 0 && (
        <div className="card mb-24" style={{ borderColor: "#ecc3b8" }}>
          <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertOctagon size={17} color="var(--color-warning)" />
            Blocked - needs your help
          </h3>
          {employee.blocked_tasks.map((task) => {
            const blocker = openBlockerByTaskId.get(task.id);
            return (
              <div key={task.id} className="task-card is-blocked">
                <div className="task-card-top">
                  <span className="task-card-title">{task.title}</span>
                  <StatusBadge status={task.status} />
                </div>
                {blocker && (
                  <>
                    <p style={{ fontSize: 13, marginBottom: 4 }}>
                      <strong>Reason:</strong> {blocker.reason}
                    </p>
                    {blocker.message && (
                      <p className="task-card-description" style={{ marginBottom: 10 }}>
                        "{blocker.message}"
                      </p>
                    )}
                    <div className="task-card-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleResolve(blocker.id)}
                        disabled={resolvingId === blocker.id}
                      >
                        <CheckCircle2 size={14} />
                        {resolvingId === blocker.id ? "Resolving..." : "Mark as resolved"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="card">
        <h3 className="section-title">All onboarding tasks</h3>
        {TASK_STAGES.map((stage) => {
          const stageTasks = grouped[stage];
          if (stageTasks.length === 0) return null;
          return (
            <div key={stage} className="stage-section">
              <div className="stage-title">{stage}</div>
              {stageTasks.map((task) => (
                <div key={task.id} className={`task-card ${task.status === "Blocked" ? "is-blocked" : ""}`}>
                  <div className="task-card-top">
                    <span className="task-card-title">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="task-card-meta">
                    <span className="task-card-meta-item task-card-due">
                      Due {formatRelativeDate(task.due_date)}
                      {task.is_overdue && <span className="badge badge-overdue">Overdue</span>}
                    </span>
                    {task.contact_person && (
                      <span className="task-card-meta-item">{task.contact_person.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
