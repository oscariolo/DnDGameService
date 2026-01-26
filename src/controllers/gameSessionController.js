import GameSessionService from '../services/GameSessionService.js';
import GameEventService from '../services/GameEventService.js';
import logger from '../utils/logger.js';

class GameSessionController {
  /**
   * Create a new game session
   * POST /api/game-sessions
   */
  async createGameSession(req, res) {
    try {
      const { baseCampaignId, dungeonMasterId, playerIds, currentZone, status } = req.body;

      if (!baseCampaignId || !dungeonMasterId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: baseCampaignId, dungeonMasterId',
        });
      }

      const session = await GameSessionService.createGameSession({
        baseCampaignId,
        dungeonMasterId,
        playerIds: playerIds || [],
        currentZone: currentZone || null,
        status: status,
      });
      try {
        const backendUrl = process.env.DNDBACKEND_URL || 'http://dndbackend:8080';
        const axios = await import('axios').then(m => m.default || m);
        await axios.post(`${backendUrl}/api/campaigns/game`, {
          gameId: session._id || session.id || session.id,
          baseCampaignId: baseCampaignId,
          dungeonMasterId: dungeonMasterId,
          playerIds: playerIds || [],
        }, { timeout: 3000 });
      } catch (err) {
        logger.warn('Failed to create CampaignRun in backend:', err && err.message ? err.message : err);
      }

      res.status(201).json({
        success: true,
        message: 'Game session created successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to create game session:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to create game session',
        error: error.message,
      });
    }
  }

  /**
   * Get game session by ID
   * GET /api/game-sessions/:sessionId
   */
  async getGameSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await GameSessionService.getGameSession(sessionId);

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      logger.error('Failed to get game session:', error.message);
      res.status(404).json({
        success: false,
        message: 'Game session not found',
        error: error.message,
      });
    }
  }

  /**
   * Get all active game sessions
   * GET /api/game-sessions
   */
  async getActiveSessions(req, res) {
    try {
      const sessions = await GameSessionService.getActiveSessions();

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      logger.error('Failed to get active sessions:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sessions',
        error: error.message,
      });
    }
  }

  /**
   * Update game session
   * PUT /api/game-sessions/:sessionId
   */
  async updateGameSession(req, res) {
    try {
      const { sessionId } = req.params;
      const updateData = req.body;

      const session = await GameSessionService.updateGameSession(sessionId, updateData);

      res.status(200).json({
        success: true,
        message: 'Game session updated successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to update game session:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update game session',
        error: error.message,
      });
    }
  }

  /**
   * End game session
   * DELETE /api/game-sessions/:sessionId
   */
  async endGameSession(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await GameSessionService.endGameSession(sessionId);

      res.status(200).json({
        success: true,
        message: 'Game session ended successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to end game session:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to end game session',
        error: error.message,
      });
    }
  }

  /**
   * Get sessions by dungeon master
   * GET /api/game-sessions/dm/:dmId
   */
  async getSessionsByDungeonMaster(req, res) {
    try {
      const { dmId } = req.params;

      const sessions = await GameSessionService.getSessionsByDungeonMaster(dmId);

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      logger.error('Failed to get sessions for DM:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sessions',
        error: error.message,
      });
    }
  }

  /**
   * Get sessions by player
   * GET /api/game-sessions/player/:playerId
   */
  async getSessionsByPlayer(req, res) {
    try {
      const { playerId } = req.params;

      const sessions = await GameSessionService.getSessionsByPlayer(playerId);

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      logger.error('Failed to get sessions for player:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sessions',
        error: error.message,
      });
    }
  }

  /**
   * Add player to session
   * POST /api/game-sessions/:sessionId/players
   */
  async addPlayerToSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: playerId',
        });
      }

      const session = await GameSessionService.addPlayerToSession(sessionId, playerId);

      res.status(200).json({
        success: true,
        message: 'Player added to session successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to add player to session:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to add player to session',
        error: error.message,
      });
    }
  }

  /**
   * Remove player from session
   * DELETE /api/game-sessions/:sessionId/players/:playerId
   */
  async removePlayerFromSession(req, res) {
    try {
      const { sessionId, playerId } = req.params;

      const session = await GameSessionService.removePlayerFromSession(sessionId, playerId);

      res.status(200).json({
        success: true,
        message: 'Player removed from session successfully',
        data: session,
      });
    } catch (error) {
      logger.error('Failed to remove player from session:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to remove player from session',
        error: error.message,
      });
    }
  }

  /**
   * Get game events for a session
   * GET /api/game-sessions/:sessionId/events
   */
  async getSessionEvents(req, res) {
    try {
      const { sessionId } = req.params;
      const { type, limit = 50 } = req.query;

      let events;
      if (type) {
        events = await GameEventService.getEventsByType(sessionId, type, parseInt(limit));
      } else {
        events = await GameEventService.getSessionEvents(sessionId, parseInt(limit));
      }

      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      logger.error('Failed to get session events:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve events',
        error: error.message,
      });
    }
  }

  /**
   * Get chat messages for a session
   * GET /api/game-sessions/:sessionId/messages
   */
  async getSessionChatMessages(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;

      const messages = await GameEventService.getChatMessages(sessionId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      logger.error('Failed to get chat messages:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve messages',
        error: error.message,
      });
    }
  }

  /**
   * Get dice rolls for a session
   * GET /api/game-sessions/:sessionId/rolls
   */
  async getSessionDiceRolls(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;

      const rolls = await GameEventService.getDiceRolls(sessionId, parseInt(limit));

      res.status(200).json({
        success: true,
        data: rolls,
      });
    } catch (error) {
      logger.error('Failed to get dice rolls:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve rolls',
        error: error.message,
      });
    }
  }
}

export default new GameSessionController();
