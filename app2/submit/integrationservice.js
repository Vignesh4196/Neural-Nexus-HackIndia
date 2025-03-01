// backend/services/slackIntegration.js
const { WebClient } = require('@slack/web-api');
const logger = require('../utils/logger');

class SlackService {
  constructor() {
    this.client = new WebClient(process.env.SLACK_TOKEN);
    this.channelCache = new Map();
  }

  async postMessage(channel, message, options = {}) {
    try {
      const channelId = await this.resolveChannelName(channel);
      const result = await this.client.chat.postMessage({
        channel: channelId,
        text: message,
        ...options
      });
      
      logger.info(`Message posted to ${channel}: ${message}`);
      return result;
    } catch (error) {
      logger.error(`Slack Error: ${error.message}`);
      throw new Error('Failed to post message');
    }
  }

  async resolveChannelName(channelName) {
    if (this.channelCache.has(channelName)) {
      return this.channelCache.get(channelName);
    }

    const response = await this.client.conversations.list({ types: 'public_channel,private_channel' });
    const channel = response.channels.find(c => c.name === channelName);
    
    if (!channel) throw new Error(`Channel ${channelName} not found`);
    
    this.channelCache.set(channelName, channel.id);
    return channel.id;
  }

  async handleSlackEvent(event) {
    // Process Slack events (message reactions, mentions, etc.)
    switch(event.type) {
      case 'message':
        return this.handleNewMessage(event);
      case 'reaction_added':
        return this.handleReaction(event);
      default:
        logger.warn(`Unhandled Slack event type: ${event.type}`);
    }
  }
}