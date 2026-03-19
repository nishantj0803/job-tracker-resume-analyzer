/**
 * Centralized logging utility for consistent error tracking and debugging
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export enum LogCategory {
  API = "API",
  SERVER_ACTION = "SERVER_ACTION",
  DATABASE = "DATABASE",
  GEMINI = "GEMINI",
  CLIENT = "CLIENT",
  AUTH = "AUTH",
  RESUME = "RESUME",
}

interface LogContext {
  userId?: string;
  jobId?: string;
  error?: unknown;
  [key: string]: unknown;
}

class Logger {
  private formatMessage(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${category}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  private serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      const serialized: Record<string, unknown> = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      // Check for cause property (ES2022+)
      if ("cause" in error && error.cause) {
        serialized.cause = this.serializeError(error.cause);
      }
      return serialized;
    }

    if (typeof error === "object" && error !== null) {
      try {
        return {
          type: Object.prototype.toString.call(error),
          details: JSON.parse(JSON.stringify(error)),
        };
      } catch {
        return {
          type: Object.prototype.toString.call(error),
          details: String(error),
        };
      }
    }

    return {
      type: typeof error,
      value: String(error),
    };
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: LogContext
  ): void {
    const enrichedContext = context ? { ...context } : undefined;

    if (enrichedContext?.error) {
      enrichedContext.errorDetails = this.serializeError(enrichedContext.error);
      delete enrichedContext.error;
    }

    const formattedMessage = this.formatMessage(level, category, message, enrichedContext);

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        console.log(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  debug(category: LogCategory, message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, category, message, context);
  }

  info(category: LogCategory, message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, category, message, context);
  }

  warn(category: LogCategory, message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, category, message, context);
  }

  error(category: LogCategory, message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, category, message, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper function to serialize errors for API responses
export function serializeErrorForResponse(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    const result: {
      message: string;
      name?: string;
      stack?: string;
      cause?: unknown;
    } = {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
    // Check for cause property (ES2022+)
    if ("cause" in error && error.cause) {
      result.cause = serializeErrorForResponse(error.cause);
    }
    return result;
  }

  if (typeof error === "object" && error !== null) {
    try {
      return {
        message: "Non-Error object thrown",
        details: JSON.parse(JSON.stringify(error)),
      };
    } catch {
      return {
        message: String(error),
      };
    }
  }

  return {
    message: String(error) || "Unknown error occurred",
  };
}
