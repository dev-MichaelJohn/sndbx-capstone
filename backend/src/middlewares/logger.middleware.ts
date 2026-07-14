import morgan, { type StreamOptions } from 'morgan';
import { logger } from '@/utils/logger.util.js';

/** Routes Morgan's HTTP request logs through Winston's "http" log level. */
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

/** Skips HTTP request logging entirely while running tests, to keep test output clean. */
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

/**
 * Express middleware that logs each incoming request (method, URL, status,
 * response size, and response time) through the shared Winston logger.
 * Register early in the middleware chain so it captures every request:
 * ```ts
 * app.use(loggerMiddleware);
 * ```
 */
export const loggerMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);
