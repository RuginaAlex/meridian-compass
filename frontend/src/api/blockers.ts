import { apiGet, apiPost } from "./client";
import type { Blocker } from "../types";

export const getBlockersForEmployee = (employeeId: number) =>
  apiGet<Blocker[]>(`/blockers/employee/${employeeId}`);

export const resolveBlocker = (blockerId: number) =>
  apiPost<Blocker>(`/blockers/${blockerId}/resolve`);
