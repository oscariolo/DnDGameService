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
      logger.warn('Authentication failed: no token provided');
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid Authorization header',
      });
    }

    logger.debug('Authenticating request with token:', token.substring(0, 20) + '...');
    
    // Validate token with Spring Boot backend
    const isTokenValid = await AuthService.validateToken(token);
    logger.debug('Token validation result:', isTokenValid);
    
    if (!isTokenValid) {
      logger.warn('Authentication failed: token validation failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    logger.debug('Token is valid, decoding token data...');
    const userData = AuthService.decodeToken(token);
    logger.debug('Decoded userData:', userData);

    if (!userData) {
      logger.warn('Authentication failed: could not decode token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    logger.info('Request authenticated for user:', userData.userId);

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
