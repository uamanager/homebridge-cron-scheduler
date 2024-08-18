<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

# ⏰ Homebridge Cron Scheduler [![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

[![Support Ukraine Badge](https://bit.ly/support-ukraine-now)](https://github.com/support-ukraine/support-ukraine)
[![Base Donate](https://img.shields.io/badge/Base-Donate-uamanager?style=flat&logo=cat&labelColor=ffffff&color=724aee&link=https%3A%2F%2Fbase.monobank.ua%2FCtKsNyepTkQVRD)](https://base.monobank.ua/CtKsNyepTkQVRD)

[![npm](https://img.shields.io/npm/v/homebridge-cron-scheduler.svg)](https://www.npmjs.com/package/homebridge-cron-scheduler)
[![npm](https://img.shields.io/npm/dt/homebridge-cron-scheduler.svg)](https://www.npmjs.com/package/homebridge-cron-scheduler)
[![npm](https://img.shields.io/npm/dm/homebridge-cron-scheduler.svg)](https://www.npmjs.com/package/homebridge-cron-scheduler)

**Creating and maintaining Homebridge plugins consume a lot of time and effort, if you
would like to share your appreciation, feel free to "Star" or donate.**

[Click here](https://github.com/uamanager) to review more of my plugins.

## Info

Cron Scheduler plugin for Homebridge, which allows scheduling of triggers using cron expressions.

## Installation

After [Homebridge](https://github.com/nfarina/homebridge) has been installed:

```
sudo npm install -g --unsafe-perm homebridge-cron-scheduler@latest
```

## Example Config

```json lines
{
  //...
  "platforms": [
    {
      "platform": "CronScheduler",
      "debug": true,
      "tasks": [
        {
          "taskName": "min-1-default",
          // uses default `taskActive` with value `true`
          // uses default `taskCronExpression` with value `* * * * *`
          // uses default `taskStateResetInterval` with value `0`
        },
        {
          "taskName": "min-3-inactive",
          "taskActive": false,
          // task will be inactive, but can be activated using Home app by switching corresponding switch
          "taskCronExpression": "*/3 * * * *"
          // task will be triggered every 3 minutes
        },
        {
          "taskName": "min-3-reset-1",
          // uses default `taskActive` with value `true`
          "taskCronExpression": "*/3 * * * *",
          // task will be triggered every 3 minutes
          "taskStateResetInterval": 1
          // task will be reset every 1 minute after it was triggered
        },
        {
          "taskName": "working-day-toggle",
          // uses default `taskActive` with value `true`
          "taskCronExpression": "0 9,17 * * *",
          // task will be triggered at 9:00 and 17:00
          "taskStateResetInterval": -1
          // task will toggle sensor state when triggered, so sensor will be active from 9:00 to 17:00 every day
        },
        {
          "taskName": "next-ny-once",
          // uses default `taskActive` with value `true`
          "taskCronExpression": "0 0 31 12 *",
          // 31st of December at 00:00
          "taskMaxRuns": 1
          // task will be triggered only once at next 31st of December at 00:00
        }
      ]
    }
  ]
}
```

| Config Field | Description                                                                                       | Default           | Required |
|--------------|---------------------------------------------------------------------------------------------------|-------------------|----------|
| platform     | Must always be `CronScheduler`.                                                                   | `"CronScheduler"` | Yes      |
| debug        | Enable for displaying debug messages.                                                             | `false`           | No       |
| timezone     | Timezone in 'Europe/Kiev' format to use for all tasks. Leave blank for using the system timezone. | `undefined`       | No       |
| tasks        | Array of cron tasks.                                                                              | `[]`              | No       |

| Task Config Field      | Description                                                                                                                               | Default        | Required |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|----------------|----------|
| taskActive             | Defines whether the task is active or not.                                                                                                | `true`         | No       |
| taskName               | A unique name for the task. Will be used as the accessory name.                                                                           | `"task-name1"` | Yes      |
| taskCronExpression     | The cron expression to use for the task.                                                                                                  | `* * * * *`    | No       |
| taskMaxRuns            | Maximum number of times the task can run. Leave blank for unlimited.                                                                      | `Infinite`     | No       |
| taskStateResetInterval | The interval in minutes after which the task state will be reset. Leave '0' for immediate reset, change to '-1' for enabling toggle mode. | `0`            | No       |
| taskStartAt            | Time at which the task should start. Leave blank for immediate start. ISO 8601 formatted datetime (2021-10-17T23:43:00) in local time.    | `undefined`    | No       |
| taskStopAt             | Time at which the task should stop. Leave blank for no stop. ISO 8601 formatted datetime (2021-10-17T23:43:00) in local time.             | `undefined`    | No       |
| timezone               | Timezone override in 'Europe/Kiev' format to use for this tasks. Leave blank for using the global timezone.                               | `undefined`    | No       |

## Cron Expression

* Cron expressions support the following additional modifiers

- *?* A question mark is substituted with cron initialization time, as an example - `? * * * *` would be substituted
  with `8 * * * *` if time is `<any hour>:08`. The question mark can be used in any field.
- *L* L can be used in the day of month field, to specify the last day of the month.

```javascript
// ┌────────────── minute (0 - 59)
// │ ┌──────────── hour (0 - 23)
// │ │ ┌────────── day of month (1 - 31)
// │ │ │ ┌──────── month (1 - 12, JAN-DEC)
// │ │ │ │ ┌────── day of week (0 - 6, SUN-Mon) 
// │ │ │ │ │       (0 to 6 are Sunday to Saturday; 7 is Sunday, the same as 0)
// │ │ │ │ │
// * * * * *
```

| Field        | Required | Allowed values  | Allowed special characters | Remarks                                                     |
|--------------|----------|-----------------|----------------------------|-------------------------------------------------------------|
| Minutes      | Yes      | 0-59            | * , - / ?                  |                                                             |
| Hours        | Yes      | 0-23            | * , - / ?                  |                                                             |
| Day of Month | Yes      | 1-31            | * , - / ? L                |                                                             |
| Month        | Yes      | 1-12 or JAN-DEC | * , - / ?                  |                                                             |
| Day of Week  | Yes      | 0-7 or SUN-MON  | * , - / ?                  | 0 to 6 are Sunday to Saturday<br>7 is Sunday, the same as 0 |

> **Note**
> Weekday and month names are case insensitive. Both MON and mon works.


> See [Cron Expression](https://github.com/Hexagon/croner/blob/master/README.md) for more details.

# Contributing

You can contribute to this homebridge plugin in following ways:

- Report issues and help verify fixes as they are checked in.
- Review the source code changes.
- Contribute bug fixes.
- Contribute changes to extend the capabilities
- Pull requests are accepted.

See [CONTRIBUTING](https://github.com/uamanager/homebridge-cron-scheduler/blob/master/CONTRIBUTING.md)
