import GameEventService from '../../services/GameEventService.js';
import GameSessionService from '../../services/GameSessionService.js';
import logger from '../../utils/logger.js';

class GameEventHandlers {
  /**
   * Handle chat message event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {Object} messageData - Message data
   */
  static async handleChatMessage(socket, io, sessionId, messageData) {
    try {
      const { messageContent } = messageData;
      const senderId = socket.userId;

      if (!messageContent || messageContent.trim() === '') {
        socket.emit('error', { message: 'Message content cannot be empty' });
        return;
      }

      // Save to database
      //await GameEventService.saveChatMessage(sessionId, senderId, messageContent);

      // Broadcast to all clients in the room (including sender)
      const eventData = {
        senderId,
        messageContent,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('chat-message-sent', eventData);

      logger.debug(`Chat message from ${senderId} in session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle chat message:', error.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle zone update event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {Object} zoneData - Zone data
   */
  static async handleZoneUpdate(socket, io, sessionId, zoneData) {
    try {
      const { zoneName, description, imgUrl } = zoneData;
      const senderId = socket.userId;

      // Update game session
      await GameSessionService.updateGameSession(sessionId, {
        currentZone: zoneName,
      });

      // Save event to database
      await GameEventService.saveGameEvent(sessionId, 'zone-update', senderId, {
        zoneName,
        description,
        imgUrl,
      });

      // Broadcast to all clients in the room (including sender)
      const eventData = {
        zoneName,
        description,
        imgUrl,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('zone-updated', eventData);

      logger.debug(`Zone updated to ${zoneName} in session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle zone update:', error.message);
      socket.emit('error', { message: 'Failed to update zone' });
    }
  }

  /**
   * Handle dice roll event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {Object} rollData - Dice roll data
   */
  static async handleDiceRoll(socket, io, sessionId, rollData) {
    try {
      const { expression } = rollData;
      const senderId = socket.userId;

      if (!expression || expression.trim() === '') {
        socket.emit('error', { message: 'Dice expression cannot be empty' });
        return;
      }

      // Validate expression
      if (!GameEventService.validateDiceExpression(expression)) {
        socket.emit('error', { message: 'Invalid dice expression format' });
        return;
      }

      // Roll dice
      const result = GameEventService.rollDice(expression);

      // Save to database
      //await GameEventService.saveDiceRoll(sessionId, senderId, expression, result);

      // Broadcast to all clients in the room (including sender)
      const eventData = {
        senderId,
        expression,
        result,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('dice-rolled', eventData);

      logger.debug(`Dice roll ${expression}=${result} from ${senderId} in session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle dice roll:', error.message);
      socket.emit('error', { message: 'Failed to roll dice' });
    }
  }

  /**
   * Handle character update event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {Object} characterData - Character data
   */
  static async handleCharacterUpdate(socket, io, sessionId, characterData) {
    try {
      const senderId = socket.userId;

      // Save event to database
      await GameEventService.saveGameEvent(sessionId, 'character-update', senderId, characterData);

      // Broadcast to all clients in the room (including sender)
      const eventData = {
        senderId,
        characterData,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('character-updated', eventData);

      logger.debug(`Character updated from ${senderId} in session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle character update:', error.message);
      socket.emit('error', { message: 'Failed to update character' });
    }
  }

  /**
   * Handle level up event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {Object} levelUpData - Level up data
   */
  static async handleLevelUp(socket, io, sessionId, levelUpData) {
    try {
      const { playerId, attributeLevelUp } = levelUpData;
      const senderId = socket.userId;

      // Update player progress
      await GameSessionService.updatePlayerProgress(sessionId, playerId, {
        attributeLevelUp,
        leveledUpAt: new Date(),
      });

      // Save event to database
      await GameEventService.saveGameEvent(sessionId, 'level-up', senderId, {
        playerId,
        attributeLevelUp,
      });

      // Broadcast to all clients in the room (including sender)
      const eventData = {
        playerId,
        attributeLevelUp,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('level-up-success', eventData);

      logger.debug(`Player ${playerId} leveled up in session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle level up:', error.message);
      socket.emit('error', { message: 'Failed to level up character' });
    }
  }

  /**
   * Handle player join event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {string} playerId - Player ID
   */
  static async handlePlayerJoin(socket, io, sessionId, playerId) {
    try {
      // Add player to session
      const session = await GameSessionService.addPlayerToSession(sessionId, playerId);

      // Join socket to room
      socket.join(`game-session-${sessionId}`);

      // Broadcast player joined to all clients (including new player)
      const eventData = {
        playerId,
        session,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('player-joined', eventData);

      logger.info(`Player ${playerId} joined session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle player join:', error.message);
      socket.emit('error', { message: 'Failed to join session' });
    }
  }

  /**
   * Handle player leave event
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {string} sessionId - Game session ID
   * @param {string} playerId - Player ID
   */
  static async handlePlayerLeave(socket, io, sessionId, playerId) {
    try {
      // Remove player from session
      await GameSessionService.removePlayerFromSession(sessionId, playerId);

      // Leave socket from room
      socket.leave(`game-session-${sessionId}`);

      // Broadcast player left to remaining clients
      const eventData = {
        playerId,
        timestamp: new Date(),
      };

      io.to(`game-session-${sessionId}`).emit('player-left', eventData);

      logger.info(`Player ${playerId} left session ${sessionId}`);
    } catch (error) {
      logger.error('Failed to handle player leave:', error.message);
    }
  }
}

export default GameEventHandlers;
