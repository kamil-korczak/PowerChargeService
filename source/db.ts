import { Sequelize } from "sequelize";
import { config } from "./config";
import logger from "./logger";

const sequelize = new Sequelize(
  `postgres://${config.DB.USER}:${config.DB.PASSWORD}@${config.DB.HOST}:${config.DB.PORT}/${config.DB.NAME}`,
);

(async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connection to database has been established successfully.");
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
})();

export = sequelize;
