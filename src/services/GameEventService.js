import { GameEvent, ChatMessage, DiceRoll } from '../models/index.js';
import logger from '../utils/logger.js';

class GameEventService {
  /**
   * Save chat message event
   * @param {string} gameSessionId - Game session ID
   * @param {string} senderId - Sender ID
   * @param {string} messageContent - Message content
   * @returns {Promise<Object>} - Saved chat message
   */
  async saveChatMessage(gameSessionId, senderId, messageContent) {
    try {
      const message = new ChatMessage({
        gameSessionId,
        senderId,
        messageContent,
      });

      const savedMessage = await message.save();
      logger.debug(`Chat message saved for session ${gameSessionId}`);
      return savedMessage;
    } catch (error) {
      logger.error('Failed to save chat message:', error.message);
      throw error;
    }
  }

  /**
   * Save dice roll event
   * @param {string} gameSessionId - Game session ID
   * @param {string} senderId - Sender ID
   * @param {string} expression - Dice expression (e.g., "1d20", "2d6+3")
   * @param {number} result - Roll result
   * @returns {Promise<Object>} - Saved dice roll
   */
  async saveDiceRoll(gameSessionId, senderId, expression, result) {
    try {
      const roll = new DiceRoll({
        gameSessionId,
        senderId,
        expression,
        result,
      });

      const savedRoll = await roll.save();
      logger.debug(`Dice roll saved for session ${gameSessionId}`);
      return savedRoll;
    } catch (error) {
      logger.error('Failed to save dice roll:', error.message);
      throw error;
    }
  }

  /**
   * Save generic game event
   * @param {string} gameSessionId - Game session ID
   * @param {string} type - Event type
   * @param {string} senderId - Sender ID
   * @param {Object} data - Event data
   * @returns {Promise<Object>} - Saved event
   */
  async saveGameEvent(gameSessionId, type, senderId, data) {
    try {
      const event = new GameEvent({
        gameSessionId,
        type,
        senderId,
        data,
      });

      const savedEvent = await event.save();
      logger.debug(`Game event ${type} saved for session ${gameSessionId}`);
      return savedEvent;
    } catch (error) {
      logger.error(`Failed to save game event ${type}:`, error.message);
      throw error;
    }
  }

  /**
   * Get session events by type
   * @param {string} gameSessionId - Game session ID
   * @param {string} eventType - Event type to filter
   * @param {number} limit - Max results
   * @returns {Promise<Array>} - Array of events
   */
  async getEventsByType(gameSessionId, eventType, limit = 50) {
    try {
      const events = await GameEvent.find({
        gameSessionId,
        type: eventType,
      })
        .limit(limit)
        .sort({ createdAt: -1 });

      return events;
    } catch (error) {
      logger.error(`Failed to get events for session ${gameSessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all events for a session
   * @param {string} gameSessionId - Game session ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>} - Array of events
   */
  async getSessionEvents(gameSessionId, limit = 100) {
    try {
      const events = await GameEvent.find({ gameSessionId })
        .limit(limit)
        .sort({ createdAt: -1 });

      return events;
    } catch (error) {
      logger.error(`Failed to get session events for ${gameSessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get chat messages for a session
   * @param {string} gameSessionId - Game session ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>} - Array of chat messages
   */
  async getChatMessages(gameSessionId, limit = 50) {
    try {
      const messages = await ChatMessage.find({ gameSessionId })
        .limit(limit)
        .sort({ createdAt: -1 });

      return messages;
    } catch (error) {
      logger.error(`Failed to get chat messages for ${gameSessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get dice rolls for a session
   * @param {string} gameSessionId - Game session ID
   * @param {number} limit - Max results
   * @returns {Promise<Array>} - Array of dice rolls
   */
  async getDiceRolls(gameSessionId, limit = 50) {
    try {
      const rolls = await DiceRoll.find({ gameSessionId })
        .limit(limit)
        .sort({ createdAt: -1 });

      return rolls;
    } catch (error) {
      logger.error(`Failed to get dice rolls for ${gameSessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Validate dice roll expression
   * @param {string} expression - Dice expression
   * @returns {boolean} - Is valid
   */
  validateDiceExpression(expression) {
    // Matches patterns like: 1d20, 2d6+3, 1d8-1, etc.
    const diceRegex = /^(\d+d\d+|\d+)(\+(\d+d\d+|\d+))*(-(\d+d\d+|\d+))*$/;
    return diceRegex.test(expression);
  }

  /**
   * Roll dice based on expression
   * @param {string} expression - Dice expression (e.g., "1d20", "2d6+3")
   * @returns {number} - Roll result
   */
  rollDice(expression) {
    try {
      // Split by + and -
      const parts = expression.match(/[+-]?(\d+d\d+|\d+)/g) || [];
      let total = 0;

      for (const part of parts) {
        if (part.includes('d')) {
          // Dice roll (e.g., "2d6")
          const [count, sides] = part.replace(/[+-]/g, '').split('d').map(Number);
          let rollSum = 0;
          for (let i = 0; i < count; i++) {
            rollSum += Math.floor(Math.random() * sides) + 1;
          }
          total += part[0] === '-' ? -rollSum : rollSum;
        } else {
          // Regular number
          const num = parseInt(part, 10);
          total += num;
        }
      }

      return Math.max(total, 0);
    } catch (error) {
      logger.error('Dice roll failed:', error.message);
      throw new Error('Invalid dice expression');
    }
  }
}

export default new GameEventService();
