import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { ChargingStationType } from "../instances/ChargingStationType";
import logger from "../logger";
import util from "util";
import { config } from "../config";

const getChargingStationTypes = async (
  req: Request | any,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(
    parseInt(req.query.limit) || config.PAGINATION.DEFAULT_PAGE_SIZE,
    config.PAGINATION.MAX_PAGE_SIZE,
  );
  const { name, current_type } = req.query;
  const where_condition: any = {};

  if (name) {
    where_condition.name = { [Op.substring]: [name] };
  }

  if (current_type) {
    where_condition.current_type = { [Op.eq]: current_type };
  }

  try {
    const { count, rows: charging_station_types } =
      await ChargingStationType.findAndCountAll({
        where: where_condition,
        offset: (page - 1) * limit,
        limit: limit,
      });
    logger.info(`getChargingStationTypes, found: ${count}`);
    return res.status(200).json({
      charging_station_types: charging_station_types,
      count: count,
      page: page,
      limit: limit,
      total_pages: Math.ceil(count / limit),
    });
  } catch (error) {
    logger.error("Error getChargingStationTypes", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getChargingStationType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  try {
    const charging_station_type = await ChargingStationType.findByPk(id);
    logger.info(
      `getChargingStationType id: ${id}: ${util.inspect(charging_station_type, {
        depth: null,
      })}`,
    );
    const status_code: number = charging_station_type ? 200 : 404;
    return res.status(status_code).json({
      charging_station_type: charging_station_type,
    });
  } catch (error) {
    logger.error("Error getChargingStationType", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteChargingStationType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  try {
    const deleted = await ChargingStationType.destroy({
      where: {
        id: id,
      },
      force: true,
    });
    const status_code: number = deleted ? 204 : 404;
    logger.info(`deleteChargingStationType id: ${id}: ${deleted}`);
    return res.status(status_code).send();
  } catch (error) {
    logger.error("Error deleteChargingStationType", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addChargingStationType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(`addChargingStation: ${util.inspect(req.body, { depth: null })}`);
  try {
    const charging_station_type = await ChargingStationType.create(req.body);
    logger.info(
      `added ChargingStation: ${util.inspect(charging_station_type, {
        depth: null,
      })}`,
    );
    return res
      .status(200)
      .json({ charging_station_type: charging_station_type });
  } catch (error: any) {
    logger.info(
      `Error addChargingStationType: ${
        error.message
      }, additional errors info: ${util.inspect(error.errors, {
        depth: null,
      })}`,
    );
    return res.status(400).json({ error: error.message });
  }
};

const updateChargingStationType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  logger.info(
    `updateChargingStationType, id: ${id}, body: ${util.inspect(req.body, {
      depth: null,
    })}`,
  );
  try {
    const query_lookup = { id: id };
    const charging_station_updated = await ChargingStationType.update(
      req.body,
      { where: query_lookup },
    );
    logger.info(`Updated ChargingStation: ${charging_station_updated}`);
    if (charging_station_updated[0] < 1) {
      return res.status(400).send();
    }
    return res.status(204).send();
  } catch (error: any) {
    logger.info(
      `Error updateChargingStationType: ${
        error.message
      }, additional errors info: ${util.inspect(error.errors, {
        depth: null,
      })}`,
    );
    return res.status(400).json({ error: error.message });
  }
};

export default {
  addChargingStationType,
  getChargingStationTypes,
  getChargingStationType,
  deleteChargingStationType,
  updateChargingStationType,
};
