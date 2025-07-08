import { API, CharacteristicValue, Logger, PlatformAccessory, Service } from 'homebridge';
import { IAccessoryContext } from './accessory.context.js';
import { BaseAccessory } from 'homebridge-util-accessory-manager';


export class TaskAccessory extends BaseAccessory<IAccessoryContext> {
  protected _contactSensorState = true;
  protected _activeState = true;
  protected _activeStateHandler: (activeState: boolean) => void;
  protected $_contactSensorService: Service;
  protected $_switchService?: Service;

  constructor(
    protected readonly $_api: API,
    protected readonly _accessory: PlatformAccessory<IAccessoryContext>,
    protected readonly $_logger?: Logger,
  ) {
    super($_api, _accessory, $_logger);

    this._activeStateHandler = () => undefined;

    this._setAccessoryInformation(
      this._accessory.context.manufacturer,
      this._accessory.context.model,
      this._accessory.context.serialNumber,
      this._accessory.context.version,
    );

    this.$_contactSensorService = this._getService(
      this._accessory.context.name,
      this.$_api.hap.Service.ContactSensor,
    );

    this.$_contactSensorService.getCharacteristic(this.$_api.hap.Characteristic.ContactSensorState)
      .onGet(this.getSensorState.bind(this));

    this.$_switchService = this._getService(
      `${this._accessory.context.name} Active State`,
      this.$_api.hap.Service.Switch,
    );

    this.setActiveState(this._accessory.context.taskConfig.taskActive);

    this.$_switchService.getCharacteristic(this.$_api.hap.Characteristic.On)
      .onGet(this.getActiveState.bind(this))
      .onSet(this.setActiveState.bind(this));
  }

  registerActiveStateHandler(handler: (activeState: boolean) => void) {
    this._activeStateHandler = handler;
  }

  getRawSensorState(): boolean {
    return this._contactSensorState;
  }

  async getSensorState(): Promise<CharacteristicValue> {
    const state = this._contactSensorState
      ? this.$_api.hap.Characteristic.ContactSensorState.CONTACT_DETECTED
      : this.$_api.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;

    this.$_logger?.debug(
      `[${this._accessory.context.name}] Get SensorState On ->`,
      this._contactSensorState ? 'CONTACT_DETECTED' : 'CONTACT_NOT_DETECTED',
    );

    return state;
  }

  async setSensorState(state: boolean) {
    const _state = state
      ? this.$_api.hap.Characteristic.ContactSensorState.CONTACT_DETECTED
      : this.$_api.hap.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;

    if (state !== this._contactSensorState) {
      this._contactSensorState = state;

      this.$_logger?.debug(
        `[${this._accessory.context.name}] Set SensorState On ->`,
        state ? 'CONTACT_DETECTED' : 'CONTACT_NOT_DETECTED',
      );

      this.$_contactSensorService.updateCharacteristic(
        this.$_api.hap.Characteristic.ContactSensorState,
        _state,
      );
    }
  }

  async getActiveState(): Promise<CharacteristicValue> {
    return this._activeState;
  }

  async setActiveState(state: unknown) {
    this.$_logger?.debug(
      `[${this._accessory.context.name}] Set ActiveState On ->`,
      state ? 'ON' : 'OFF',
    );

    this._activeState = !!state;
    this._contactSensorState = true;

    return this._activeStateHandler(this._activeState);
  }
}
