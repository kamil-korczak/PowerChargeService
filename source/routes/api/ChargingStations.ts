import express from "express";
import controller from "../../controllers/ChargingStations";
import auth from "../../middleware/auth";


const router = express.Router();

router.get("/", auth.authenticateToken, controller.getChargingStations);
router.post("/", auth.authenticateToken, controller.addChargingStation);

router.get("/:id", auth.authenticateToken, controller.getChargingStation);
router.put("/:id", auth.authenticateToken, controller.updateChargingStation);
router.delete("/:id", auth.authenticateToken, controller.deleteChargingStation);

export = router;
