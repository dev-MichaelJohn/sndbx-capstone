import path from "node:path";
import winston from "winston";

/**
 * Configured Winston logger for the app. Logs to the console (colorized)
 * and to `logs/combined.txt` (all levels down to the current threshold)
 * and `logs/error.txt` (errors only). Log level scales with `NODE_ENV`:
 * `debug` in development, `info` in production, `error` in test.
 */

/** Custom log levels, in order of severity (lower = more severe). */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/** Console colors matching each log level, for the colorized console transport. */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

/**
 * Determines the active log level based on `NODE_ENV`: `info` in
 * production, `error` in test (to keep test output quiet), and `debug`
 * otherwise (development).
 */
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return 'info';
  if (env === 'test') return 'error';
  return 'debug';
};

/** Colorized, human-readable format used for console output. */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `[${info.timestamp}] [${info.level}]: ${info.message}`)
);

/** Plain (non-colorized) format used for file output. */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.uncolorize(),
  winston.format.printf((info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`)
);

/**
 * Shared logger instance. Import and use as `logger.info(...)`,
 * `logger.error(...)`, etc. throughout the app instead of `console.log`.
 */
export const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),

    new winston.transports.File({
      filename: path.join('logs', 'combined.txt'),
      level: getLogLevel(),
      format: fileFormat
    }),

    new winston.transports.File({
      filename: path.join('logs', 'error.txt'),
      level: 'error',
      format: fileFormat
    }),
  ],
});
