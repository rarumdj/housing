export default class AppError extends Error {
  constructor(
    public message: string,
    public httpStatusCode = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
