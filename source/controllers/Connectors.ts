import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { Connector } from "../instances/Connector";
import logger from "../logger";
import util from "util";
import { config } from "../config";

const getConnectors = async (
  req: Request | any,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(
    parseInt(req.query.limit) || config.PAGINATION.DEFAULT_PAGE_SIZE,
    config.PAGINATION.MAX_PAGE_SIZE,
  );
  const { name, priority } = req.query;
  const where_condition: any = {};

  if (name) {
    where_condition.name = { [Op.substring]: [name] };
  }

  if (priority) {
    where_condition.priority = { [Op.eq]: priority === "true" };
  }

  try {
    const { count, rows: connectors } = await Connector.findAndCountAll({
      // NOTE: `include` option brings the associated data along with the instance
      //     include: {
      //         model: ChargingStation,
      //         as: "charging_station"
      //     }
      where: where_condition,
      offset: (page - 1) * limit,
      limit: limit,
    });
    logger.info(`getConnectors, found: ${count}`);
    return res.status(200).json({
      connectors: connectors,
      count: count,
      page: page,
      limit: limit,
      total_pages: Math.ceil(count / limit),
    });
  } catch (error) {
    logger.error("Error getConnectors", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getConnector = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  try {
    const connector = await Connector.findByPk(id);
    logger.info(
      `getConnector id: ${id}: ${util.inspect(connector, { depth: null })}`,
    );
    const status_code: number = connector ? 200 : 404;
    return res.status(status_code).json({
      connector: connector,
    });
  } catch (error) {
    logger.error("Error getConnector", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteConnector = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  try {
    const deleted = await Connector.destroy({
      where: {
        id: id,
      },
      force: true,
    });
    const status_code: number = deleted ? 204 : 404;
    logger.info(`deleteConnector id: ${id}: ${deleted}`);
    return res.status(status_code).send();
  } catch (error) {
    logger.error("Error deleteConnector", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addConnector = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(`addConnector: ${util.inspect(req.body, { depth: null })}`);
  try {
    const connector = await Connector.create(req.body);
    logger.info(`added Connector: ${util.inspect(connector, { depth: null })}`);
    return res.status(200).json({ connector: connector });
  } catch (error: any) {
    logger.info(
      `Error addConnector: ${
        error.message
      }, additional errors info: ${util.inspect(error.errors, {
        depth: null,
      })}`,
    );

    // Workaround for more detailed error message from database as parent
    // const error_message = error.message == "Validation error" && error.parent ? error.parent.message : error.message

    return res.status(400).json({ error: error.message });
  }
};

const updateConnector = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  logger.info(
    `updateConnector, id: ${id}, body: ${util.inspect(req.body, {
      depth: null,
    })}`,
  );
  try {
    const query_lookup = { id: id };
    const connector_updated = await Connector.update(req.body, {
      where: query_lookup,
    });
    logger.info(`Updated Connector: ${connector_updated}`);
    if (connector_updated[0] < 1) {
      return res.status(400).send();
    }
    return res.status(204).send();
  } catch (error: any) {
    logger.info(
      `Error updateConnector: ${
        error.message
      }, additional errors info: ${util.inspect(error.errors, {
        depth: null,
      })}`,
    );
    return res.status(400).json({ error: error.message });
  }
};

export default {
  addConnector,
  getConnectors,
  getConnector,
  deleteConnector,
  updateConnector,
};
