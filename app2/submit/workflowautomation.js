// backend/services/workflowEngine.js
const { CronJob } = require('cron');
const logger = require('../utils/logger');
const EmailService = require('./emailService');
const SlackService = require('./slackIntegration');
const CalendarService = require('./calendarService');

class WorkflowEngine {
  constructor() {
    this.scheduledJobs = new Map();
    this.services = {
      email: new EmailService(),
      slack: new SlackService(),
      calendar: new CalendarService()
    };
  }

  async createScheduledTask(taskConfig) {
    const job = new CronJob(
      taskConfig.schedule,
      async () => {
        try {
          await this.executeTask(taskConfig);
          logger.info(`Task executed: ${taskConfig.name}`);
        } catch (error) {
          logger.error(`Task failed: ${taskConfig.name} - ${error.message}`);
        }
      },
      null,
      true,
      'UTC'
    );
    
    this.scheduledJobs.set(taskConfig.id, job);
    return job;
  }

  async executeTask(taskConfig) {
    switch(taskConfig.type) {
      case 'email_reminder':
        await this.services.email.sendReminder(taskConfig.parameters);
        break;
      case 'slack_daily_report':
        await this.services.slack.postDailyReport(taskConfig.parameters);
        break;
      case 'calendar_sync':
        await this.services.calendar.syncEvents(taskConfig.parameters);
        break;
      default:
        throw new Error(`Unknown task type: ${taskConfig.type}`);
    }
  }
}