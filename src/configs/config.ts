import { PlatformConfig } from 'homebridge';
import { PLATFORM_NAME } from '../settings';
import { TaskConfig, ITaskConfig } from './task.config';

export interface IConfig extends PlatformConfig {
  debug?: boolean;
  timezone?: string;
  tasks?: ITaskConfig[];
}

export const CONFIG_DEFAULT: IConfig = {
  platform: PLATFORM_NAME,
};

export class Config implements IConfig {
  readonly platform: string;
  readonly debug: boolean;
  readonly timezone?: string;
  readonly tasks: TaskConfig[];

  constructor(config: IConfig = CONFIG_DEFAULT) {
    this.platform = config.platform;
    this.debug = !!config.debug;
    this.timezone = config.timezone;
    this.tasks = (config.tasks || [])
      .map((task) => {
        return new TaskConfig(this, task);
      });
  }
}
