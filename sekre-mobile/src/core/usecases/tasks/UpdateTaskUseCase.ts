import type { ITaskRepository, UpdateTaskParams } from '@core/ports/ITaskRepository';
import type { Task, TaskId } from '@core/domain/entities/Task';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: TaskId, params: UpdateTaskParams): Promise<Task> {
    return this.taskRepository.updateTask(id, params);
  }
}
