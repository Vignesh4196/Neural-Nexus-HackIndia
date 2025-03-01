// backend/services/aiProcessor.js
const { OpenAI } = require('openai');
const dialogflow = require('@google-cloud/dialogflow');
const rasa = require('rasa-node');
const logger = require('../utils/logger');

class AIProcessor {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.dialogflowClient = new dialogflow.SessionsClient();
    this.rasaEndpoint = process.env.RASA_ENDPOINT;
  }

  async processInput(userInput, context) {
    try {
      // Intent Detection
      const intent = await this.detectIntent(userInput);
      
      // Model Routing
      let response;
      switch(intent) {
        case 'task_automation':
          response = await this.handleTaskAutomation(userInput, context);
          break;
        case 'information_query':
          response = await this.handleGPT4Query(userInput);
          break;
        case 'conversational':
          response = await this.handleRasaConversation(userInput);
          break;
        default:
          response = await this.handleDefaultResponse(userInput);
      }

      return {
        ...response,
        context: this.updateContext(context, intent),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`AI Processing Error: ${error.message}`);
      throw new Error('Failed to process request');
    }
  }

  async detectIntent(text) {
    const sessionPath = this.dialogflowClient.projectAgentSessionPath(
      process.env.GOOGLE_PROJECT_ID,
      'unique-session-id'
    );
    
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: text,
          languageCode: 'en-US',
        },
      },
    };

    const [response] = await this.dialogflowClient.detectIntent(request);
    return response.queryResult.intent.displayName;
  }

  async handleGPT4Query(prompt) {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return {
      text: completion.choices[0].message.content,
      source: 'GPT-4',
      confidence: 0.95
    };
  }
}