import type { TaskStatus } from "../types";

const STATUS_CLASS: Record<TaskStatus, string> = {
  "Not started": "badge-not-started",
  "In progress": "badge-in-progress",
  Blocked: "badge-blocked",
  Completed: "badge-completed",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{status}</span>;
}
