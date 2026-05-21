import type { ITaskRepository } from '@core/ports/ITaskRepository';
import type { TaskListResult, TaskFilter } from '@core/domain/entities/Task';

export class GetTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(filter?: TaskFilter): Promise<TaskListResult> {
    return this.taskRepository.getTasks(filter);
  }
}
