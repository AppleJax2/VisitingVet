/**
 * Custom error response class to extend the native Error class
 * with additional properties (statusCode)
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse; 