import { DataTypes } from "sequelize";
import sequelize from "../db";
import { ChargingStationType } from "./ChargingStationType";
import { Connector } from "./Connector";
// TODO: customize ForeignKeyConstraintError message

export const ChargingStation = sequelize.define(
  "ChargingStation",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "name_unique",
        msg: "'name' is already taken.",
      },
    },
    device_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: false,
    },
    firmware_version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "charging_station",
    timestamps: false,
  },
);

ChargingStationType.hasMany(ChargingStation, {
  foreignKey: "charging_station_type_id",
});
ChargingStation.belongsTo(ChargingStationType, {
  foreignKey: "charging_station_type_id",
  onDelete: "CASCADE",
  as: "charging_station_type",
});

ChargingStation.hasMany(Connector, {
  foreignKey: "charging_station_id",
});
Connector.belongsTo(ChargingStation, {
  foreignKey: "charging_station_id",
  onDelete: "CASCADE",
  as: "charging_station",
});
