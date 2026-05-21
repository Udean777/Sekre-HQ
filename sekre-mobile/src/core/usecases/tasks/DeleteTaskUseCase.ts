import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { TaskId } from '@core/domain/entities/Task';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: TaskId): Promise<void> {
    return this.taskRepository.deleteTask(id);
  }
}
