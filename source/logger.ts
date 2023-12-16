import { createLogger, transports, format } from "winston";
import httpContext from "express-http-context";
import { config } from "./config";

/*
Log to the standard output in order to know what is going on.
Logs structured as [time [log_level] [context]]: msg
*/

const logger = createLogger({
  level: config.LOGGER_LEVEL,
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(
      (info) =>
        `[${info.timestamp}] [${info.level}] [${
          httpContext.get("Request-ID") || "default"
        }]: ${info.message}`,
    ),
  ),
});

export = logger;
