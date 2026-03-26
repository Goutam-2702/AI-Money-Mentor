/**
 * Structured logger — wraps pino with app context.
 * Falls back to console in environments where pino is unavailable.
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  duration?: string;
  [key: string]: unknown;
}

function formatLog(level: LogLevel, ctx: LogContext, msg: string) {
  return JSON.stringify({
    time: new Date().toISOString(),
    level,
    service: 'ai-money-mentor',
    env: process.env.NODE_ENV ?? 'development',
    msg,
    ...ctx,
  });
}

function createLogger() {
  const level = (process.env.LOG_LEVEL as LogLevel) ?? 'info';
  const levels: Record<LogLevel, number> = {
    trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60,
  };
  const currentLevel = levels[level] ?? 30;

  const log = (logLevel: LogLevel, ctx: LogContext | string, msg?: string) => {
    if (levels[logLevel] < currentLevel) return;

    const [context, message] =
      typeof ctx === 'string' ? [{}, ctx] : [ctx, msg ?? ''];

    const line = formatLog(logLevel, context, message);

    if (logLevel === 'error' || logLevel === 'fatal') {
      console.error(line);
    } else if (logLevel === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  };

  return {
    trace: (ctx: LogContext | string, msg?: string) => log('trace', ctx, msg),
    debug: (ctx: LogContext | string, msg?: string) => log('debug', ctx, msg),
    info: (ctx: LogContext | string, msg?: string) => log('info', ctx, msg),
    warn: (ctx: LogContext | string, msg?: string) => log('warn', ctx, msg),
    error: (ctx: LogContext | string, msg?: string) => log('error', ctx, msg),
    fatal: (ctx: LogContext | string, msg?: string) => log('fatal', ctx, msg),

    /** Create a child logger with persistent context fields */
    child: (bindings: LogContext) => {
      const childLog = (logLevel: LogLevel, ctx: LogContext | string, msg?: string) => {
        const [context, message] =
          typeof ctx === 'string' ? [{}, ctx] : [ctx, msg ?? ''];
        log(logLevel, { ...bindings, ...context }, message);
      };
      return {
        trace: (ctx: LogContext | string, msg?: string) => childLog('trace', ctx, msg),
        debug: (ctx: LogContext | string, msg?: string) => childLog('debug', ctx, msg),
        info: (ctx: LogContext | string, msg?: string) => childLog('info', ctx, msg),
        warn: (ctx: LogContext | string, msg?: string) => childLog('warn', ctx, msg),
        error: (ctx: LogContext | string, msg?: string) => childLog('error', ctx, msg),
      };
    },
  };
}

export const logger = createLogger();
