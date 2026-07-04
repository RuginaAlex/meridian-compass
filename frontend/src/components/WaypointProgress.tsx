import { TASK_STAGES, type TaskStage } from "../types";

const SHORT_LABEL: Record<TaskStage, string> = {
  "Before the first day": "Before day 1",
  "First day": "Day 1",
  "First week": "First week",
  "First month": "First month",
};

export function WaypointProgress({ currentStage }: { currentStage: TaskStage }) {
  const currentIndex = TASK_STAGES.indexOf(currentStage);

  return (
    <div className="waypoint-track" aria-label="Onboarding route">
      {TASK_STAGES.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div
            key={stage}
            className={`waypoint-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
          >
            <div className="waypoint-line" />
            <div className="waypoint-dot" />
            <span className="waypoint-label">{SHORT_LABEL[stage]}</span>
          </div>
        );
      })}
    </div>
  );
}
