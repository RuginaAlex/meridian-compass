import { Compass, Inbox, AlertTriangle } from "lucide-react";

// Three small, reusable states so every page handles "still loading",
// "loaded but nothing to show", and "something went wrong" the same way,
// instead of each page inventing its own ad-hoc handling (or forgetting
// to handle one of them).

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="state-block" role="status">
      <Compass size={28} />
      <p className="state-description">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="state-block">
      <Inbox size={28} />
      <p className="state-title">{title}</p>
      <p className="state-description">{description}</p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="state-block">
      <AlertTriangle size={28} />
      <p className="state-title">Something went wrong</p>
      <p className="state-description">{message}</p>
    </div>
  );
}
