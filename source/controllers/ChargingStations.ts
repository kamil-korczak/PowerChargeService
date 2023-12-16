import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { ChargingStation } from "../instances/ChargingStation";
import logger from "../logger";
import util from "util";
import { config } from "../config";

const getChargingStations = async (
  req: Request | any,
  res: Response,
  next: NextFunction,
) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(
    parseInt(req.query.limit) || config.PAGINATION.DEFAULT_PAGE_SIZE,
    config.PAGINATION.MAX_PAGE_SIZE,
  );
  const { name, device_id, ip_address, firmware_version } = req.query;

  const where_condition: any = {};

  if (name) {
    where_condition.name = { [Op.substring]: [name] };
  }

  if (device_id) {
    where_condition.device_id = { [Op.eq]: device_id };
  }

  if (ip_address) {
    where_condition.ip_address = { [Op.eq]: ip_address };
  }

  if (firmware_version) {
    where_condition.firmware_version = { [Op.eq]: firmware_version };
  }

  try {
    const { count, rows: charging_stations } =
      await ChargingStation.findAndCountAll({
      // NOTE: `include` option brings the associated data along with the instance
        //     include: [
        //         {
        //             model: ChargingStationType,
        //             required: false,
        //             as: "charging_station_type",
        //         },
        //         {
        //             model: Connector,
        //             required: false
        //         }
        //     ]
        where: where_condition,
        offset: (page - 1) * limit,
        limit: limit,
      });
    logger.info(`getChargingStations, found: ${count}`);
    return res.status(200).json({
      charging_stations: charging_stations,
      count: count,
      page: page,
      limit: limit,
      total_pages: Math.ceil(count / limit),
    });
  } catch (error) {
    logger.error("Error getChargingStations", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getChargingStation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  try {
    const charging_station = await ChargingStation.findOne({
      where: { id: id },
      // include: {
      //     model: ChargingStationType,
      //     as: "charging_station_type",
      //     required: false
      // }
    });
    logger.info(
      `getChargingStation id: ${id}: ${util.inspect(charging_station, {
        depth: null,
      })}`,
    );
    const status_code: number = charging_station ? 200 : 404;
    return res.status(status_code).json({
      charging_station: charging_station,
    });
  } catch (error) {
    logger.error("Error getChargingStation", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteChargingStation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  try {
    const deleted = await ChargingStation.destroy({
      where: {
        id: id,
      },
      force: true,
    });
    const status_code: number = deleted ? 204 : 404;
    logger.info(`deleteChargingStation id: ${id}: ${deleted}`);
    return res.status(status_code).send();
  } catch (error) {
    logger.error("Error deleteChargingStation", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addChargingStation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(`addChargingStation: ${util.inspect(req.body, { depth: null })}`);
  try {
    const charging_station = await ChargingStation.create(req.body);
    logger.info(
      `added ChargingStation: ${util.inspect(charging_station, {
        depth: null,
      })}`,
    );
    return res.status(200).json({ charging_station: charging_station });
  } catch (error: any) {
    logger.info(
      `Error addChargingStation: ${
        error.message
      }, additional errors info: ${util.inspect(error.errors, {
        depth: null,
      })}`,
    );
    return res.status(400).json({ error: error.message });
  }
};

const updateChargingStation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.params.id;
  logger.info(
    `updateChargingStation, id: ${id}, body: ${util.inspect(req.body, {
      depth: null,
    })}`,
  );
  try {
    const query_lookup = { id: id };
    const charging_station_updated = await ChargingStation.update(req.body, {
      where: query_lookup,
    });
    logger.info(`Updated ChargingStation: ${charging_station_updated}`);
    if (charging_station_updated[0] < 1) {
      return res.status(400).send();
    }
    return res.status(204).send();
  } catch (error: any) {
    logger.info(
      `Error updateChargingStation: ${
        error.message
      }, additional errors info: ${util.inspect(error.errors, {
        depth: null,
      })}`,
    );
    return res.status(400).json({ error: error.message });
  }
};

export default {
  addChargingStation,
  getChargingStations,
  getChargingStation,
  deleteChargingStation,
  updateChargingStation,
};
