type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

class Logger {
  private format(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  info(message: string, meta?: unknown) {
    console.log(this.format("INFO", message, meta));
  }

  warn(message: string, meta?: unknown) {
    console.warn(this.format("WARN", message, meta));
  }

  error(message: string, meta?: unknown) {
    console.error(this.format("ERROR", message, meta));
  }

  debug(message: string, meta?: unknown) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("DEBUG", message, meta));
    }
  }
}

export const logger = new Logger();
