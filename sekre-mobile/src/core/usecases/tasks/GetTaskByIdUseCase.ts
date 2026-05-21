import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { Task, TaskId } from '@core/domain/entities/Task';

export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: TaskId): Promise<Task> {
    return this.taskRepository.getTaskById(id);
  }
}
