import { GameSession, GameEvent, ChatMessage, DiceRoll } from '../models/index.js';
import logger from '../utils/logger.js';

class GameSessionService {
  /**
   * Create a new game session
   * @param {Object} sessionData - Game session data
   * @returns {Promise<Object>} - Created session
   */
  async createGameSession(sessionData) {
    try {
      const session = new GameSession({
        baseCampaignId: sessionData.baseCampaignId,
        dungeonMasterId: sessionData.dungeonMasterId,
        playerIds: sessionData.playerIds || [],
        currentZone: sessionData.currentZone || null,
        gameState: sessionData.gameState || {},
        playersProgress: sessionData.playersProgress || {},
        availableCharacters: sessionData.availableCharacters || {},
      });

      await session.save();
      logger.info(`Game session created: ${session._id}`);
      return session;
    } catch (error) {
      logger.error('Failed to create game session:', error.message);
      throw error;
    }
  }

  /**
   * Get game session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Game session
   */
  async getGameSession(sessionId) {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }
      return session;
    } catch (error) {
      logger.error(`Failed to get game session ${sessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all active game sessions
   * @returns {Promise<Array>} - Array of active sessions
   */
  async getActiveSessions() {
    try {
      const sessions = await GameSession.find({ status: 'active' });
      return sessions;
    } catch (error) {
      logger.error('Failed to get active sessions:', error.message);
      throw error;
    }
  }

  /**
   * Update game session
   * @param {string} sessionId - Session ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated session
   */
  async updateGameSession(sessionId, updateData) {
    try {
      const session = await GameSession.findByIdAndUpdate(sessionId, updateData, { new: true });
      if (!session) {
        throw new Error('Game session not found');
      }
      logger.info(`Game session updated: ${sessionId}`);
      return session;
    } catch (error) {
      logger.error(`Failed to update game session ${sessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Add player to game session
   * @param {string} sessionId - Session ID
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} - Updated session
   */
  async addPlayerToSession(sessionId, playerId) {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }

      if (session.playerIds.includes(playerId)) {
        throw new Error('Player already in session');
      }

      session.playerIds.push(playerId);
      await session.save();
      logger.info(`Player ${playerId} added to session ${sessionId}`);
      return session;
    } catch (error) {
      logger.error(`Failed to add player to session:`, error.message);
      throw error;
    }
  }

  /**
   * Remove player from game session
   * @param {string} sessionId - Session ID
   * @param {string} playerId - Player ID
   * @returns {Promise<Object>} - Updated session
   */
  async removePlayerFromSession(sessionId, playerId) {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }

      session.playerIds = session.playerIds.filter(id => id !== playerId);
      await session.save();
      logger.info(`Player ${playerId} removed from session ${sessionId}`);
      return session;
    } catch (error) {
      logger.error(`Failed to remove player from session:`, error.message);
      throw error;
    }
  }

  /**
   * End game session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Ended session
   */
  async endGameSession(sessionId) {
    try {
      const session = await GameSession.findByIdAndUpdate(
        sessionId,
        { status: 'ended' },
        { new: true }
      );
      if (!session) {
        throw new Error('Game session not found');
      }
      logger.info(`Game session ended: ${sessionId}`);
      return session;
    } catch (error) {
      logger.error(`Failed to end game session:`, error.message);
      throw error;
    }
  }

  /**
   * Get sessions by dungeon master ID
   * @param {string} dmId - Dungeon Master ID
   * @returns {Promise<Array>} - Array of sessions
   */
  async getSessionsByDungeonMaster(dmId) {
    try {
      const sessions = await GameSession.find({ dungeonMasterId: dmId });
      return sessions;
    } catch (error) {
      logger.error(`Failed to get sessions for DM ${dmId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get sessions by player ID
   * @param {string} playerId - Player ID
   * @returns {Promise<Array>} - Array of sessions
   */
  async getSessionsByPlayer(playerId) {
    try {
      const sessions = await GameSession.find({ playerIds: playerId, status: 'active' });
      return sessions;
    } catch (error) {
      logger.error(`Failed to get sessions for player ${playerId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update player progress in session
   * @param {string} sessionId - Session ID
   * @param {string} playerId - Player ID
   * @param {Object} progressData - Progress data
   * @returns {Promise<Object>} - Updated session
   */
  async updatePlayerProgress(sessionId, playerId, progressData) {
    try {
      const session = await GameSession.findById(sessionId);
      if (!session) {
        throw new Error('Game session not found');
      }

      if (!session.playersProgress) {
        session.playersProgress = {};
      }

      session.playersProgress[playerId] = {
        ...session.playersProgress[playerId],
        ...progressData,
      };

      await session.save();
      logger.info(`Player progress updated for ${playerId} in session ${sessionId}`);
      return session;
    } catch (error) {
      logger.error(`Failed to update player progress:`, error.message);
      throw error;
    }
  }
}

export default new GameSessionService();
