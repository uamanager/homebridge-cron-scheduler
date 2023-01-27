import { TaskConfig } from '../configs/task.config';
import { IBaseAccessoryContext } from 'homebridge-util-accessory-manager';

export interface IAccessoryContext extends IBaseAccessoryContext {
  taskConfig: TaskConfig;
}
