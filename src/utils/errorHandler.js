/**
 * Error handling utilities
 */

class ApplicationError extends Error {
  constructor(message, code = 500, details = null) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApplicationError';
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

class ValidationError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 401, details);
    this.name = 'AuthenticationError';
  }
}

class NotFoundError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 404, details);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends ApplicationError {
  constructor(message, details = null) {
    super(message, 409, details);
    this.name = 'ConflictError';
  }
}

export {
  ApplicationError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
};
