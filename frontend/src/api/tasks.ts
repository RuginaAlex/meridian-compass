import { apiGet, apiPost } from "./client";
import type { Blocker, BlockerReason, OnboardingTask } from "../types";

export const getTasksForEmployee = (employeeId: number) =>
  apiGet<OnboardingTask[]>(`/tasks/employee/${employeeId}`);

export const completeTask = (taskId: number) =>
  apiPost<OnboardingTask>(`/tasks/${taskId}/complete`);

interface BlockTaskResponse {
  task: OnboardingTask;
  blocker: Blocker;
}

export const blockTask = (taskId: number, reason: BlockerReason, message: string) =>
  apiPost<BlockTaskResponse>(`/tasks/${taskId}/block`, { reason, message });
