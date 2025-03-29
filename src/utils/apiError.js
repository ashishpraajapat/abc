class apiError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],
      stack = "",
      data = null // Optional data field
    ) {
      super(message);
      this.statusCode = statusCode;
      this.message = message;
      this.success = false;
      this.errors = errors;
      this.data = data; // Attach data if necessary
  
      // Validate statusCode to ensure it's a valid HTTP status code
      if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
        throw new Error("Invalid statusCode. It must be a number between 100 and 599.");
      }
  
      // Set the stack trace if not provided
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export { apiError };
  