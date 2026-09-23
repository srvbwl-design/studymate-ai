import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Global Error Handler]', err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
}
