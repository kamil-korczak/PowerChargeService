import * as _ from "lodash";

export const config = {
  APP_PORT: parseInt(process.env.APP_PORT as string, 10) || 3000,
  DB: {
    HOST: process.env.DB_HOST as string,
    NAME: process.env.DB_NAME as string,
    USER: process.env.DB_USER as string,
    PASSWORD: process.env.DB_PASSWORD as string,
    PORT: parseInt(process.env.DB_PORT as string),
  },
  LOGGER_LEVEL: process.env.LOGGER_LEVEL as string,
  TOKEN: {
    ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY as string,
    REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY as string,
    ACCESS_TOKEN_EXPIRATION: "120s",
    ACCESS_TOKEN_CACHE_IN_SECONDS: 120,
    REFRESH_TOKEN_EXPIRATION: "1d",
    REFRESH_TOKEN_COOKIE_MAX_AGE: 24 * 60 * 60 * 1000,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 25,
  },
};

// Create a copy of the config object to log config without confidential information
export const configToPrint = _.cloneDeep(config);
const SECRET_STRING = '**SECRET**'
configToPrint.DB.PASSWORD = SECRET_STRING
configToPrint.TOKEN.ACCESS_SECRET_KEY = SECRET_STRING
configToPrint.TOKEN.REFRESH_SECRET_KEY = SECRET_STRING
