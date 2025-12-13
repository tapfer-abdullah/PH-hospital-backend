class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string | undefined, stuck = "") {
    super(message);
    this.statusCode = statusCode;

    if (stuck) {
      this.stack = stuck;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
