import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AlertOctagon, Clock, ArrowRight } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { getEmployee } from "../api/employees";
import { getTasksForEmployee, completeTask, blockTask } from "../api/tasks";
import type { BlockerReason, EmployeeDetail, OnboardingTask } from "../types";
import { LoadingState, ErrorState } from "../components/StateBlocks";
import { WaypointProgress } from "../components/WaypointProgress";
import { TaskCard } from "../components/TaskCard";
import { getCurrentStage, formatDate } from "../utils/date";

export function EmployeeDashboard() {
  const { employeeId } = useRole();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [employeeData, taskData] = await Promise.all([
        getEmployee(employeeId),
        getTasksForEmployee(employeeId),
      ]);
      setEmployee(employeeData);
      setTasks(taskData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (taskId: number) => {
    await completeTask(taskId);
    await load();
  };

  const handleBlock = async (taskId: number, reason: BlockerReason, message: string) => {
    await blockTask(taskId, reason, message);
    await load();
  };

  if (loading) return <LoadingState label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} />;
  if (!employee) return null;

  const currentStage = getCurrentStage(tasks);
  const blockedTasks = tasks.filter((t) => t.status === "Blocked");
  const overdueTasks = tasks.filter((t) => t.is_overdue);
  const priorityTasks = tasks
    .filter((t) => t.status === "Not started" || t.status === "In progress")
    .slice(0, 3);

  const allDone = tasks.length > 0 && tasks.every((t) => t.status === "Completed");

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Dashboard</span>
        <h1 className="page-title">Welcome, {employee.first_name}.</h1>
        <p className="page-subtitle">
          {employee.job_title} · {employee.department} · Started {formatDate(employee.start_date)}
        </p>
      </div>

      <div className="card mb-24">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            Your onboarding route
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

      {allDone && (
        <div className="card mb-24" style={{ background: "var(--color-success-bg)", borderColor: "transparent" }}>
          <strong style={{ color: "var(--color-success)" }}>
            You've completed every onboarding task. Welcome to the team!
          </strong>
        </div>
      )}

      {blockedTasks.length > 0 && (
        <div className="card mb-24" style={{ borderColor: "#ecc3b8" }}>
          <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertOctagon size={17} color="var(--color-warning)" />
            Blocked tasks
          </h3>
          {blockedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} onBlock={handleBlock} />
          ))}
        </div>
      )}

      {overdueTasks.length > 0 && (
        <div className="card mb-24" style={{ borderColor: "#ecc3b8" }}>
          <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={17} color="var(--color-warning)" />
            Overdue
          </h3>
          {overdueTasks.map((task) => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} onBlock={handleBlock} />
          ))}
        </div>
      )}

      <div className="card mb-24">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            What to do next
          </h3>
          <Link to="/journey" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
            View full journey <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-24">
          {priorityTasks.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 13.5 }}>
              No pending tasks right now - check your full journey for what's coming up.
            </p>
          ) : (
            priorityTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} onBlock={handleBlock} />
            ))
          )}
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <p className="stat-card-label">Manager</p>
          {employee.manager ? (
            <>
              <p style={{ fontWeight: 600, marginTop: 4 }}>{employee.manager.name}</p>
              <p className="text-muted" style={{ fontSize: 13 }}>{employee.manager.job_title}</p>
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: 13 }}>Not assigned yet - check with HR.</p>
          )}
        </div>
        <div className="card">
          <p className="stat-card-label">Onboarding buddy</p>
          {employee.buddy ? (
            <>
              <p style={{ fontWeight: 600, marginTop: 4 }}>{employee.buddy.name}</p>
              <p className="text-muted" style={{ fontSize: 13 }}>{employee.buddy.job_title}</p>
            </>
          ) : (
            <p className="text-muted" style={{ fontSize: 13 }}>Not assigned yet - check with HR.</p>
          )}
        </div>
      </div>
    </div>
  );
}
