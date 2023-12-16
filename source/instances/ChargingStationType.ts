import { DataTypes } from "sequelize";
import sequelize from "../db";


export const ChargingStationType = sequelize.define(
  "ChargingStationType",
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
    plug_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    efficiency: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    current_type: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        isIn: {
          args: [["AC", "DC"]],
          msg: "'current_type' value must be one of ['AC', 'DC']",
        },
      },
    },
  },
  {
    tableName: "charging_station_type",
    timestamps: false,
  },
);
