import { User, Organization } from "./index";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  organization_id: string;
  division_id: string;
  assignee_id?: string;
  assignee?: User;
  division?: any; // replace with proper Division type later if needed
  title: string;
  description: string;
  status: TaskStatus;
  due_date?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
