import { useEffect, useState, useCallback } from "react";
import { useRole } from "../context/RoleContext";
import { getTasksForEmployee, completeTask, blockTask } from "../api/tasks";
import type { BlockerReason, OnboardingTask } from "../types";
import { TASK_STAGES } from "../types";
import { LoadingState, ErrorState, EmptyState } from "../components/StateBlocks";
import { TaskCard } from "../components/TaskCard";
import { groupTasksByStage } from "../utils/date";

export function OnboardingJourney() {
  const { employeeId } = useRole();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await getTasksForEmployee(employeeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your onboarding journey.");
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

  if (loading) return <LoadingState label="Loading your onboarding journey..." />;
  if (error) return <ErrorState message={error} />;

  if (tasks.length === 0) {
    return (
      <div>
        <div className="page-header">
          <span className="page-eyebrow">Journey</span>
          <h1 className="page-title">My Onboarding Journey</h1>
        </div>
        <EmptyState
          title="No onboarding plan yet"
          description="Your plan hasn't been generated yet. Reach out to HR if this seems unexpected."
        />
      </div>
    );
  }

  const grouped = groupTasksByStage(tasks);

  return (
    <div>
      <div className="page-header">
        <span className="page-eyebrow">Journey</span>
        <h1 className="page-title">My Onboarding Journey</h1>
        <p className="page-subtitle">
          Everything on your plan, grouped by stage. Mark tasks complete as you go, or flag
          one as blocked if something's in your way.
        </p>
      </div>

      {TASK_STAGES.map((stage) => {
        const stageTasks = grouped[stage];
        if (stageTasks.length === 0) return null;

        const doneCount = stageTasks.filter((t) => t.status === "Completed").length;

        return (
          <div key={stage} className="stage-section">
            <div className="stage-title">
              {stage}
              <span>
                ({doneCount}/{stageTasks.length})
              </span>
            </div>
            {stageTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleComplete} onBlock={handleBlock} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
