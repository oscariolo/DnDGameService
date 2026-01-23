import AuthService from '../services/AuthService.js';
import GameEventHandlers from './handlers/gameEventHandlers.js';
import logger from '../utils/logger.js';

class SocketManager {
  constructor() {
    this.connectedClients = new Map();
  }

  /**
   * Initialize WebSocket server
   * @param {Object} io - Socket.IO instance
   */
  initializeSocket(io) {
    io.on('connection', (socket) => {
      logger.info(`New connection attempt: ${socket.id}`);

      // Authenticate on connection
      socket.on('authenticate', async (data) => {
        await this.handleAuthentication(socket, io, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });

    logger.info('WebSocket server initialized');
  }

  /**
   * Handle client authentication
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   * @param {Object} data - Authentication data
   */
  async handleAuthentication(socket, io, data) {
    try {
      const { token, userId, gameSessionId } = data;

      // Validate with Spring Boot
      const isTokenValid = await AuthService.validateToken(token);
      // Validate if game session exists

      if (!isTokenValid) {
        socket.emit('auth-error', { message: 'Authentication failed' });
        return;
      }

      if(!userId || !gameSessionId) {
        socket.emit('auth-error', { message: 'Missing userId or gameSessionId' });
        return;
      }

      socket.gameSessionId = gameSessionId;

      // Store client info
      this.connectedClients.set(socket.id, {
        userId,
        gameSessionId,
        connectedAt: new Date(),
      });

      // Join game session room
      socket.join(`game-session-${gameSessionId}`);

      // Send success response
      socket.emit('auth-success', { userId, gameSessionId });

      logger.info(`User ${userId} authenticated for session ${gameSessionId}`);

      // Register event listeners after authentication
      this.registerEventListeners(socket, io);
    } catch (error) {
      logger.error('Authentication failed:', error.message);
      socket.emit('auth-error', { message: 'Authentication failed' });
    }
  }

  /**
   * Register WebSocket event listeners after authentication
   * @param {Object} socket - Socket.IO socket
   * @param {Object} io - Socket.IO instance
   */
  registerEventListeners(socket, io) {
    const sessionId = socket.gameSessionId;

    // Chat message event
    socket.on('chat-message', (data) => {
      GameEventHandlers.handleChatMessage(socket, io, sessionId, data);
    });

    // Zone update event
    socket.on('zone-update', (data) => {
      GameEventHandlers.handleZoneUpdate(socket, io, sessionId, data);
    });

    // Dice roll event
    socket.on('dice-roll', (data) => {
      GameEventHandlers.handleDiceRoll(socket, io, sessionId, data);
    });

    // Character update event
    socket.on('character-update', (data) => {
      GameEventHandlers.handleCharacterUpdate(socket, io, sessionId, data);
    });

    // Level up event
    socket.on('level-up', (data) => {
      GameEventHandlers.handleLevelUp(socket, io, sessionId, data);
    });

    // Player join event (for joining mid-session)
    socket.on('player-join', (data) => {
      GameEventHandlers.handlePlayerJoin(socket, io, sessionId, data.playerId);
    });

    // Player leave event
    socket.on('player-leave', () => {
      GameEventHandlers.handlePlayerLeave(socket, io, sessionId, socket.userId);
    });

    // Get session state event
    socket.on('get-session-state', async () => {
      await this.handleGetSessionState(socket);
    });
  }

  /**
   * Handle disconnection
   * @param {Object} socket - Socket.IO socket
   */
  handleDisconnection(socket) {
    const clientInfo = this.connectedClients.get(socket.id);

    if (clientInfo) {
      const { userId, gameSessionId } = clientInfo;
      this.connectedClients.delete(socket.id);

      // Notify other players
      socket.to(`game-session-${gameSessionId}`).emit('player-disconnected', {
        userId,
        timestamp: new Date(),
      });

      logger.info(`User ${userId} disconnected from session ${gameSessionId}`);
    }
  }

  /**
   * Handle get session state request
   * @param {Object} socket - Socket.IO socket
   */
  async handleGetSessionState(socket) {
    try {
      // Client can request current session state
      // This is useful for recovering state after reconnection
      socket.emit('session-state-requested', {
        message: 'Session state request received. Implement in parent controller.',
      });
    } catch (error) {
      logger.error('Failed to get session state:', error.message);
      socket.emit('error', { message: 'Failed to get session state' });
    }
  }

  /**
   * Get connected clients count for a session
   * @param {string} gameSessionId - Game session ID
   * @returns {number} - Number of connected clients
   */
  getConnectedClientsForSession(gameSessionId) {
    let count = 0;
    for (const clientInfo of this.connectedClients.values()) {
      if (clientInfo.gameSessionId === gameSessionId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get all connected sessions
   * @returns {Array} - Array of session IDs with client count
   */
  getActiveSessions() {
    const sessions = new Map();

    for (const clientInfo of this.connectedClients.values()) {
      const { gameSessionId } = clientInfo;
      sessions.set(gameSessionId, (sessions.get(gameSessionId) || 0) + 1);
    }

    return Array.from(sessions.entries()).map(([sessionId, count]) => ({
      sessionId,
      connectedClients: count,
    }));
  }
}

export default new SocketManager();
