import AuthService from '../services/AuthService.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate HTTP requests
 * Validates JWT token from Authorization header
 * Token validation happens implicitly when making requests to Spring Boot
 */
const authenticateRequest = async (req, res, next) => {
  try {
    const token = AuthService.extractTokenFromHeaders(req.headers);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid Authorization header',
      });
    }

    // Extract user info from token (decode without validation)
    const userData = AuthService.decodeTokenLocally(token);
    
    if (!userData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    req.user = userData;
    req.token = token; // Store token for downstream requests to Spring Boot
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
