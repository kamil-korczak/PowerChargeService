import express, { Express } from "express";
import httpContext from "express-http-context";
import cookieParser from 'cookie-parser';
import ruid from "express-ruid";
import expressWinston from "express-winston";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { config, configToPrint } from "./config";
import util from 'util';
import logger from "./logger";

logger.debug(`Config: ${util.inspect(configToPrint, { depth: null })}`);

const app: Express = express();

// Use httpContext, required by ruid
app.use(cookieParser());
app.use(httpContext.middleware);


// Configure Request-ID (ruid)
app.use(
  ruid({
    setInContext: true,
    attribute: "Request-ID",
    prefixRoot: "",
    prefixSeparator: "",
  }),
);

// Parse JSON bodies of incoming requests.
app.use(express.json());

// Configure winston for express
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: false, // Collecting additional information, such as URL, HTTP method, etc.
    expressFormat: true,
    colorize: true,
  }),
);

// Parse URL-encoded bodies of incoming requests.
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing.
app.use(cors());

// Enhance the security of the application by setting various HTTP headers.
app.use(helmet());

// Add routes
app.use(routes);

app.listen(config.APP_PORT, () => {
  logger.info(`Server listening on port ${config.APP_PORT}`);
});

export default app;
