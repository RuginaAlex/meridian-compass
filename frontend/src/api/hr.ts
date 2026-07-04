import { apiGet } from "./client";
import type { HrDashboardData } from "../types";

export const getHrDashboard = () => apiGet<HrDashboardData>("/hr/dashboard");
