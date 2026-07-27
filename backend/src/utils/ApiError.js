class ApiError extends Error {
    constructor(
        statusCode,
        message,
        errors = [],
        isOperational = true
    ) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;