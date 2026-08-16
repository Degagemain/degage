export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(code: string, message: string, httpStatus: number) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('not_found', message, 404);
  }
}
