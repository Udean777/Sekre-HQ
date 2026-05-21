import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { Task, TaskId, TaskStatus } from '@core/domain/entities/Task';

export class UpdateTaskStatusUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: TaskId, status: TaskStatus): Promise<Task> {
    return this.taskRepository.updateTaskStatus(id, status);
  }
}
