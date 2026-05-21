import type { ITaskRepository, CreateTaskParams } from '@core/ports/ITaskRepository';
import type { Task } from '@core/domain/entities/Task';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(params: CreateTaskParams): Promise<Task> {
    return this.taskRepository.createTask(params);
  }
}
