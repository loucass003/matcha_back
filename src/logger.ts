import { NextFunction } from '@decorators/socket';
import { Response } from 'express';
import { createLogger, format, transports } from 'winston';
import { AppRequest } from './types';

// Import Functions
const { File, Console } = transports;

// Init Logger
const logger = createLogger({
  level: 'info',
});

/**
 * For production write to all logs with level `info` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
const fileFormat = format.combine(format.timestamp(), format.json());
const errTransport = new File({
  filename: './logs/error.log',
  format: fileFormat,
  level: 'error',
});
const infoTransport = new File({
  filename: './logs/combined.log',
  format: fileFormat,
});
logger.add(errTransport);
logger.add(infoTransport);

const errorStackFormat = format((info) => {
  if (info.stack) {
    // tslint:disable-next-line:no-console
    console.log(info.stack);
    return false;
  }
  return info;
});
const consoleTransport = new Console({
  format: format.combine(
    format.colorize(),
    format.simple(),
    errorStackFormat(),
  ),
});
logger.add(consoleTransport);

export function loggerMiddleware(): any {
  const getRequestDuration = (start: [number, number]) => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };

  return (req: AppRequest, res: Response, next: NextFunction) => {
    const { method, url } = req;
    const { statusCode } = res;
    const start = process.hrtime();
    res.on('finish', () => {
      const durationInMilliseconds = getRequestDuration(start);
      logger.info(
        `${method} ${url} ${statusCode} ${durationInMilliseconds.toLocaleString()} ms`,
      );
    });
    next();
  };
}

export { logger };
