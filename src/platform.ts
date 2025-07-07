import { API, DynamicPlatformPlugin, Logger, PlatformAccessory } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { Config, IConfig } from './configs/config';
import { AccessoriesManager } from 'homebridge-util-accessory-manager';
import { IAccessoryContext } from './accessories/accessory.context';
import { CSLogger } from './logger';
import { TaskAccessory } from './accessories/task.accessory';
import { TaskHandler } from './task.handler';

export type TPlatformAccessories = TaskAccessory;

export class Platform implements DynamicPlatformPlugin {
  taskHandlers: TaskHandler[] = [];
  config: Config = new Config();
  readonly $_logger: Logger;
  readonly $_accessoryManager: AccessoriesManager<TPlatformAccessories, IAccessoryContext>;

  constructor(
    private readonly $_homebridgeLogger: Logger,
    private readonly _rawConfig: IConfig,
    private readonly $_api: API,
  ) {
    this.$_logger = new CSLogger($_homebridgeLogger, _rawConfig.debug);

    this.$_accessoryManager = new AccessoriesManager(
      PLUGIN_NAME,
      PLATFORM_NAME,
      this.$_api,
      this.$_logger,
    );

    this.$_logger.info('Finished initializing platform:', PLATFORM_NAME);

    this.$_api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.$_logger.debug('Loading accessory from cache:', accessory.displayName);
    this.$_accessoryManager.cache(accessory.UUID, accessory as PlatformAccessory<IAccessoryContext>);
  }

  didFinishLaunching() {
    this.config = new Config(this._rawConfig);
    this.taskHandlers = this.config.tasks.map((task) => {
      return new TaskHandler(
        this.$_api,
        task,
        this.$_accessoryManager,
        this.$_logger,
      );
    });

    this.$_accessoryManager.clean();
  }
}
