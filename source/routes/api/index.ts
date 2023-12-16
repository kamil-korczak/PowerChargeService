import express from "express";
import auth_routes from "../auth";
import charging_stations_routes from "./ChargingStations";
import charging_station_types_routes from "./ChargingStationTypes";
import connectors_routes from "./Connectors";


const router = express.Router();

router.use("/auth", auth_routes);
router.use("/charging_stations", charging_stations_routes);
router.use("/charging_station_types", charging_station_types_routes);
router.use("/connectors", connectors_routes);

export = router;
