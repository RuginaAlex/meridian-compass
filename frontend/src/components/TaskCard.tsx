import { useState } from "react";
import { CalendarDays, User, CheckCircle2, AlertOctagon } from "lucide-react";
import type { BlockerReason, OnboardingTask } from "../types";
import { StatusBadge } from "./StatusBadge";
import { BlockTaskModal } from "./BlockTaskModal";
import { formatRelativeDate } from "../utils/date";

interface Props {
  task: OnboardingTask;
  onComplete: (taskId: number) => Promise<void>;
  onBlock: (taskId: number, reason: BlockerReason, message: string) => Promise<void>;
}

export function TaskCard({ task, onComplete, onBlock }: Props) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const isActionable = task.status === "Not started" || task.status === "In progress";
  const isDone = task.status === "Completed";

  const handleComplete = async () => {
    setBusy(true);
    try {
      await onComplete(task.id);
    } finally {
      setBusy(false);
    }
  };

  const handleBlockSubmit = async (reason: BlockerReason, message: string) => {
    await onBlock(task.id, reason, message);
    setShowBlockModal(false);
  };

  return (
    <div className={`task-card ${task.status === "Blocked" ? "is-blocked" : ""}`}>
      <div className="task-card-top">
        <span className="task-card-title">{task.title}</span>
        <StatusBadge status={task.status} />
      </div>

      <p className="task-card-description">{task.description}</p>

      <div className="task-card-why">
        <strong>Why this matters: </strong>
        {task.why_this_matters}
      </div>

      <div className="task-card-meta">
        <span className="task-card-meta-item task-card-due">
          <CalendarDays size={13} />
          Due {formatRelativeDate(task.due_date)}
          {task.is_overdue && <span className="badge badge-overdue">Overdue</span>}
        </span>
        {task.contact_person && (
          <span className="task-card-meta-item">
            <User size={13} />
            {task.contact_person.name}
          </span>
        )}
      </div>

      {task.status === "Blocked" && (
        <div className="blocker-banner">
          <AlertOctagon size={15} />
          <span>
            You marked this as blocked. HR has been notified and will follow up.
          </span>
        </div>
      )}

      {isActionable && (
        <div className="task-card-actions">
          <button className="btn btn-primary btn-sm" onClick={handleComplete} disabled={busy}>
            <CheckCircle2 size={14} />
            Mark complete
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setShowBlockModal(true)}
            disabled={busy}
          >
            <AlertOctagon size={14} />
            I'm blocked
          </button>
        </div>
      )}

      {isDone && (
        <div className="task-card-actions">
          <span className="text-muted" style={{ fontSize: 12.5 }}>
            Nice work - this one's done.
          </span>
        </div>
      )}

      {showBlockModal && (
        <BlockTaskModal
          task={task}
          onClose={() => setShowBlockModal(false)}
          onSubmit={handleBlockSubmit}
        />
      )}
    </div>
  );
}
