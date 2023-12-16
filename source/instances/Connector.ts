import { DataTypes } from "sequelize";
import sequelize from "../db";


// TODO: create SQL function using ORM
// TODO: unique together custom message

export const Connector = sequelize.define(
  "Connector",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "connector",
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: "idx_unique_priority",
        fields: ["charging_station_id"],
        where: {
          priority: true,
        },
      },
      {
        unique: true,
        name: "unique_name_charging_station",
        fields: ["name", "charging_station_id"],
      },
    ],
  },
);
