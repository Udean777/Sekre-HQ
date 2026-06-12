import { UserEntity } from './user.entity';

export interface Task {
  id: string;
  organization_id: string;
  division_id: string;
  assignee_id?: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskEntity {
  task: Task;
  assignee?: UserEntity;
}
