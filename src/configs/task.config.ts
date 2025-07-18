import { Config } from './config.js';

export interface ITaskConfig {
  taskActive: boolean;
  taskName: string;
  taskCronExpression?: string;
  taskMaxRuns?: number;
  taskStateResetInterval?: number;
  taskStartAt?: string;
  taskStopAt?: string;
  timezone?: string;
}

export class TaskConfig implements ITaskConfig {
  readonly taskActive: boolean;
  readonly taskName: string;
  readonly taskCronExpression: string;
  readonly taskMaxRuns: number;
  readonly taskStateResetInterval: number;
  readonly taskStartAt?: string;
  readonly taskStopAt?: string;
  readonly timezone?: string;

  constructor(_config: Config, task: ITaskConfig) {
    this.taskActive = task.taskActive !== undefined ? task.taskActive : true;
    this.taskName = task.taskName;
    this.taskCronExpression = task.taskCronExpression || '* * * * *';
    this.taskMaxRuns = task.taskMaxRuns || Infinity;
    this.taskStateResetInterval = task.taskStateResetInterval || 0;
    this.taskStartAt = task.taskStartAt;
    this.taskStopAt = task.taskStartAt;
    this.timezone = task.timezone || _config.timezone;
  }

  get id(): string {
    return `${this.taskName}`;
  }
}
