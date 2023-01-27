import { TaskAccessory } from './accessories/task.accessory';
import { TPlatformAccessories } from './platform';
import { PLATFORM_MANUFACTURER, PLATFORM_VERSION } from './settings';
import { IAccessoryContext } from './accessories/accessory.context';
import { TaskConfig } from './configs/task.config';
import { API, Logger } from 'homebridge';
import { AccessoriesManager, IBaseAccessoryCtor } from 'homebridge-util-accessory-manager';
import { Cron } from 'croner';

export class TaskHandler {
  private _taskResetJob: Cron | undefined;
  private _taskCronJob: Cron | undefined;

  constructor(
    private readonly $_api: API,
    private readonly taskConfig: TaskConfig,
    readonly $_accessoryManager: AccessoriesManager<TPlatformAccessories, IAccessoryContext>,
    private readonly $_logger?: Logger,
  ) {
    this.$_logger && this.$_logger.debug(
      'Finished initializing task handler:',
      this.taskConfig.taskName,
    );

    this.init();
  }

  init() {
    this._initAccessories();

    this._initCronJobs();
  }

  private _initAccessories() {
    const _taskContext = this._prepareContext(
      this.taskConfig.id,
      this.taskConfig.taskName,
      this.taskConfig,
    );

    this.$_accessoryManager.register(
      _taskContext.serialNumber,
      TaskAccessory as IBaseAccessoryCtor<TPlatformAccessories>,
      _taskContext,
    );

    this.$_accessoryManager.get(
      this._generateSerialNumber(this.taskConfig.id),
    )
      ?.registerActiveStateHandler((activeState: boolean) => {
        return this._handleActiveStateChange(activeState);
      });
  }

  private _initCronJobs() {
    this._taskCronJob = new Cron(
      this.taskConfig.taskCronExpression,
      {
        legacyMode: false,
        paused: !this.taskConfig.taskActive,
        maxRuns: this.taskConfig.taskMaxRuns,
        startAt: this.taskConfig.taskStartAt,
        stopAt: this.taskConfig.taskStopAt,
        timezone: this.taskConfig.timezone,
      },
      this._handleCronJob.bind(this),
    );

    const _nextDate = this._taskCronJob.next();

    if (_nextDate) {
      this.$_logger && this.$_logger.debug(
        'Next cron job execution date:',
        this.taskConfig.taskName,
        _nextDate,
      );
    }
  }

  private _handleCronJob() {
    this.$_logger && this.$_logger.debug(
      'Executed cron job:',
      this.taskConfig.taskName,
    );

    const _taskAccessory = this.$_accessoryManager.get(
      this._generateSerialNumber(this.taskConfig.id),
    );

    if (this.taskConfig.taskStateResetInterval > 0) {
      _taskAccessory?.setSensorState(true);
      setTimeout(() => {
        _taskAccessory?.setSensorState(false);
      }, 1000);

      if (this._taskResetJob) {
        this.$_logger && this.$_logger.debug(
          'Rewrite previous task accessory reset handler:',
          this.taskConfig.taskName,
        );
        this._taskResetJob.stop();
      }

      const _resetInterval = parseInt(this.taskConfig.taskStateResetInterval.toString(), 10);

      this._taskResetJob = new Cron(
        `*/${_resetInterval} * * * *`,
        {
          legacyMode: false,
          paused: false,
          maxRuns: 1,
          timezone: this.taskConfig.timezone,
        },
        () => {
          this.$_logger && this.$_logger.debug(
            'Executed task accessory state reset:',
            this.taskConfig.taskName,
          );
          _taskAccessory?.setSensorState(true);
        },
      );

      const _nextDate = this._taskResetJob.next();

      if (_nextDate) {
        this.$_logger && this.$_logger.debug(
          'Task accessory reset date:',
          this.taskConfig.taskName,
          _nextDate,
        );
      }
    } else if (this.taskConfig.taskStateResetInterval === 0) {
      _taskAccessory?.setSensorState(true);
      setTimeout(() => {
        this.$_logger && this.$_logger.debug(
          'Immediate task accessory state reset:',
          this.taskConfig.taskName,
        );
        _taskAccessory?.setSensorState(false);
        setTimeout(() => {
          _taskAccessory?.setSensorState(true);
        }, 1000);
      }, 1000);
    } else {
      this.$_logger && this.$_logger.debug(
        'Toggle task accessory state instead of reset:',
        this.taskConfig.taskName,
      );
      setTimeout(() => {
        _taskAccessory?.setSensorState(!_taskAccessory?.getRawSensorState());
      }, 1000);
    }
  }

  private _handleActiveStateChange(activeState: boolean) {
    if (activeState) {
      if (this._taskCronJob && !this._taskCronJob.running()) {
        this.$_logger && this.$_logger.debug(
          'Start cron job:',
          this.taskConfig.taskName,
        );
        this._taskCronJob.resume();

        const _nextDate = this._taskCronJob.next();

        if (_nextDate) {
          this.$_logger && this.$_logger.debug(
            'Next cron job execution date:',
            this.taskConfig.taskName,
            _nextDate,
          );
        }
      }
    } else {
      this.$_logger && this.$_logger.debug(
        'Stop cron job:',
        this.taskConfig.taskName,
      );
      this._taskCronJob?.pause();
      this._taskResetJob?.stop();
    }
  }

  private _generateSerialNumber(id: string): string {
    return this.$_api.hap.uuid.generate(id);
  }

  private _prepareContext(
    id: string,
    name: string,
    taskConfig: TaskConfig,
  ): IAccessoryContext {
    return {
      manufacturer: PLATFORM_MANUFACTURER,
      model: id,
      name: name,
      serialNumber: this._generateSerialNumber(id),
      version: PLATFORM_VERSION,
      taskConfig,
    };
  }
}
