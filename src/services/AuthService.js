import axios from 'axios';
import env from '../config/environment.js';
import logger from '../utils/logger.js';

class AuthService {
  /**
   * Decode token locally without validation
   * Extracts user info from JWT payload
   * @param {string} token - JWT token
   * @returns {Object|null} - Decoded token data or null if invalid format
   */
  decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // JWT format: header.payload.signature (at least 3 parts)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      return {
        userId: payload.sub || payload.user_id,
        username: payload.preferred_username || payload.username,
        email: payload.email,
      };
    } catch (error) {
      logger.error('Failed to decode token locally:', error.message);
      return null;
    }
  }

  /**
   * Validate token with Spring Boot backend
   * @param {string} token - JWT token from client
   * @returns {Promise<Object>} - User data if valid
   */
  async validateToken(token) {
    try {
      if (!token) {
        logger.warn('Token validation: token is required');
        return false;
      }

      const response = await axios.get(
        env.SPRINGBOOT_AUTH_URL,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
      if(response.status !== 200) {
        logger.warn(`Token validation failed with status ${response.status}`);
        return false;
      }
      logger.debug('Token validated successfully');
      return true;
    } catch (error) {
      logger.warn('Token validation failed:', error.message);
      return false;
    }
  }

  /**
   * Extract token from request headers
   * @param {Object} headers - Request headers (Express converts to lowercase)
   * @returns {string|null} - Token or null
   */
  extractTokenFromHeaders(headers) {
    const authHeader = headers.authorization;
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }

    return null;
  }

  /**
   * Authenticate WebSocket connection
   * @param {Object} socket - Socket.IO socket
   * @returns {Promise<Object>} - User data if valid
   */
  async authenticateSocket(socket) {
    try {
      const token = this.extractTokenFromHeaders(socket.handshake.headers);

      if (!token) {
        throw new Error('Missing or invalid token credentials');
      }

      const userData = await this.validateToken(token);
      return { ...userData};
    } catch (error) {
      logger.error('Socket authentication failed:', error.message);
      throw error;
    }
  }
}

export default new AuthService();
