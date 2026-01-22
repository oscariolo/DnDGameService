import axios from 'axios';
import env from '../config/environment.js';
import logger from '../utils/logger.js';

class AuthService {
  /**
   * Validate token with Spring Boot backend
   * @param {string} token - JWT token from client
   * @returns {Promise<Object>} - User data if valid
   */
  async validateToken(token) {
    try {
      if (!token) {
        throw new Error('Token is required');
      }

      const response = await axios.post(
        env.SPRINGBOOT_AUTH_URL,
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 5000,
        }
      );

      logger.debug('Token validated successfully');
      return response.data;
    } catch (error) {
      logger.error('Token validation failed:', error.message);
      throw new Error('Token validation failed');
    }
  }

  /**
   * Extract token from WebSocket handshake headers
   * @param {Object} headers - Socket handshake headers
   * @returns {string|null} - Token or null
   */
  extractTokenFromHeaders(headers) {
    const authHeader = headers.authorization || headers.Authorization;
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
      const userId = socket.handshake.auth?.userId;

      if (!token || !userId) {
        throw new Error('Missing authentication credentials');
      }

      const userData = await this.validateToken(token);
      return { ...userData, userId };
    } catch (error) {
      logger.error('Socket authentication failed:', error.message);
      throw error;
    }
  }
}

export default new AuthService();
