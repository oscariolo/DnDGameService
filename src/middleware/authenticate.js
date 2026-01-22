import AuthService from '../services/AuthService.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate HTTP requests
 * Validates JWT token from Authorization header
 */
const authenticateRequest = async (req, res, next) => {
  try {
    const token = AuthService.extractTokenFromHeaders(req.headers);
    const userId = req.headers['x-user-id'];

    if (!token || !userId) {
      return res.status(401).json({
        success: false,
        message: 'Missing authentication credentials',
      });
    }

    // Validate token with Spring Boot
    const userData = await AuthService.validateToken(token);

    req.user = { ...userData, userId };
    next();
  } catch (error) {
    logger.error('Request authentication failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

export default authenticateRequest;
