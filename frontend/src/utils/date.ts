import { TASK_STAGES, type OnboardingTask, type TaskStage } from "../types";

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Human phrasing like "in 3 days" / "2 days ago" / "today", used so the
 * new employee doesn't have to do date math in their head to know if a
 * task is urgent. */
export function formatRelativeDate(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate + "T00:00:00");
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "yesterday";
  if (diffDays > 1) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/** The stage the employee is "currently in": the stage of the earliest
 * task that isn't Completed yet. If every task is done, they're
 * considered to be at the final stage. If there are no tasks at all,
 * they're at the first stage by default. */
export function getCurrentStage(tasks: OnboardingTask[]): TaskStage {
  if (tasks.length === 0) return TASK_STAGES[0];

  const sorted = [...tasks].sort(
    (a, b) => TASK_STAGES.indexOf(a.stage) - TASK_STAGES.indexOf(b.stage) || a.order - b.order
  );

  const firstUnfinished = sorted.find((t) => t.status !== "Completed");
  return firstUnfinished ? firstUnfinished.stage : TASK_STAGES[TASK_STAGES.length - 1];
}

export function groupTasksByStage(
  tasks: OnboardingTask[]
): Record<TaskStage, OnboardingTask[]> {
  const grouped: Record<TaskStage, OnboardingTask[]> = {
    "Before the first day": [],
    "First day": [],
    "First week": [],
    "First month": [],
  };

  for (const task of tasks) {
    grouped[task.stage].push(task);
  }

  for (const stage of TASK_STAGES) {
    grouped[stage].sort((a, b) => a.order - b.order);
  }

  return grouped;
}
