const is_production = process.env.NODE_ENV;
const async_handler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));

const error_handler = (err, _, res, __) => {
  console.log(err);
  return res.status(err.status_code || 400).json({
    success: err.success,
    message: err.message,
    status_code: err.status_code,
    data: null,
  });
};

class Api_Error extends Error {
  constructor(
    status_code = 400,
    message = "Something went wrong!",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.status_code = status_code;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class Api_Response {
  constructor(status_code, data, message = "Success") {
    this.status_code = status_code;
    this.data = data;
    this.message = message;
    this.success = status_code < 400;
  }
}

export { async_handler, Api_Error, Api_Response, error_handler };
