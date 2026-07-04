// These types mirror the to_dict() output of the Flask models exactly.
// Keeping them in one file means every page/component agrees on what
// shape the data has, and TypeScript catches it immediately if the
// backend response ever changes shape.

export type Department = "Engineering" | "Sales" | "Marketing" | "HR" | "Finance";

export type PersonType = "HR" | "Manager" | "Buddy" | "IT" | "Colleague";

export type OnboardingStatus = "Not started" | "In progress" | "Completed";

export type TaskStage =
  | "Before the first day"
  | "First day"
  | "First week"
  | "First month";

export type TaskStatus = "Not started" | "In progress" | "Blocked" | "Completed";

export type BlockerReason =
  | "I do not have access"
  | "I do not know who to contact"
  | "I need more information"
  | "Technical issue"
  | "Other";

export type BlockerStatus = "Open" | "Resolved";

export interface Person {
  id: number;
  name: string;
  job_title: string;
  department: Department | null;
  email: string;
  slack_username: string | null;
  ask_me_about: string | null;
  type: PersonType;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  job_title: string;
  department: Department;
  start_date: string; // ISO date, e.g. "2026-06-30"
  onboarding_status: OnboardingStatus;
  manager: Person | null;
  buddy: Person | null;
  // Present only on list / dashboard responses, not on the base object.
  progress?: number;
  blocked_count?: number;
  overdue_count?: number;
}

export interface EmployeeDetail extends Employee {
  progress: number;
  blocked_tasks: OnboardingTask[];
  overdue_tasks: OnboardingTask[];
}

export interface OnboardingTask {
  id: number;
  employee_id: number;
  title: string;
  description: string;
  why_this_matters: string;
  stage: TaskStage;
  order: number;
  due_date: string;
  status: TaskStatus;
  is_overdue: boolean;
  contact_person: Person | null;
}

export interface Blocker {
  id: number;
  task_id: number;
  employee_id: number;
  reason: BlockerReason;
  message: string | null;
  status: BlockerStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  category: string;
  link: string | null;
}

export const TASK_STAGES: TaskStage[] = [
  "Before the first day",
  "First day",
  "First week",
  "First month",
];

export const BLOCKER_REASONS: BlockerReason[] = [
  "I do not have access",
  "I do not know who to contact",
  "I need more information",
  "Technical issue",
  "Other",
];
