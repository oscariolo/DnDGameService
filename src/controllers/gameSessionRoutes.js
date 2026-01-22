import express from 'express';
import gameSessionController from '../controllers/gameSessionController.js';
import authenticateRequest from '../middleware/authenticate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateRequest);

// Game session management
router.post('/', gameSessionController.createGameSession.bind(gameSessionController));
router.get('/', gameSessionController.getActiveSessions.bind(gameSessionController));
router.get('/:sessionId', gameSessionController.getGameSession.bind(gameSessionController));
router.put('/:sessionId', gameSessionController.updateGameSession.bind(gameSessionController));
router.delete('/:sessionId', gameSessionController.endGameSession.bind(gameSessionController));

// Get sessions by user
router.get('/dm/:dmId', gameSessionController.getSessionsByDungeonMaster.bind(gameSessionController));
router.get('/player/:playerId', gameSessionController.getSessionsByPlayer.bind(gameSessionController));

// Player management
router.post('/:sessionId/players', gameSessionController.addPlayerToSession.bind(gameSessionController));
router.delete('/:sessionId/players/:playerId', gameSessionController.removePlayerFromSession.bind(gameSessionController));

// Event history
router.get('/:sessionId/events', gameSessionController.getSessionEvents.bind(gameSessionController));
router.get('/:sessionId/messages', gameSessionController.getSessionChatMessages.bind(gameSessionController));
router.get('/:sessionId/rolls', gameSessionController.getSessionDiceRolls.bind(gameSessionController));

export default router;
