/**
 * Logger utility for consistent logging across the application
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  constructor(level = 'info') {
    this.level = level;
  }

  /**
   * Format log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  format(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {any} data - Additional data
   */
  error(message, data) {
    if (LOG_LEVELS[this.level] >= LOG_LEVELS.error) {
      console.error(this.format('error', message, data));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {any} data - Additional data
   */
  warn(message, data) {
    if (LOG_LEVELS[this.level] >= LOG_LEVELS.warn) {
      console.warn(this.format('warn', message, data));
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {any} data - Additional data
   */
  info(message, data) {
    if (LOG_LEVELS[this.level] >= LOG_LEVELS.info) {
      console.log(this.format('info', message, data));
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {any} data - Additional data
   */
  debug(message, data) {
    if (LOG_LEVELS[this.level] >= LOG_LEVELS.debug) {
      console.log(this.format('debug', message, data));
    }
  }
}

export default new Logger(process.env.LOG_LEVEL || 'info');
