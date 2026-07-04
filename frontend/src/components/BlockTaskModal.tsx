import { useState } from "react";
import { X } from "lucide-react";
import { BLOCKER_REASONS, type BlockerReason, type OnboardingTask } from "../types";

interface Props {
  task: OnboardingTask;
  onClose: () => void;
  onSubmit: (reason: BlockerReason, message: string) => Promise<void>;
}

export function BlockTaskModal({ task, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<BlockerReason>(BLOCKER_REASONS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(reason, message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 className="modal-title">I'm blocked</h3>
            <p className="modal-subtitle">{task.title}</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: 6 }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="block-reason">
            What's stopping you?
          </label>
          <select
            id="block-reason"
            className="form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value as BlockerReason)}
          >
            {BLOCKER_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="block-message">
            Add a short explanation (optional)
          </label>
          <textarea
            id="block-message"
            className="form-textarea"
            placeholder="Give HR a bit more context so they can help faster..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Reporting..." : "Report blocker"}
          </button>
        </div>
      </div>
    </div>
  );
}
