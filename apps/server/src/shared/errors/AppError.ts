export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string | undefined;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(400, message, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(409, message, code);
  }

  static unauthorized(message = "Unauthorized", code?: string): AppError {
    return new AppError(401, message, code);
  }

  static notFound(message = "Not found", code?: string): AppError {
    return new AppError(404, message, code);
  }

  static internal(message = "Internal server error", code?: string): AppError {
    return new AppError(500, message, code);
  }
}
