import express from "express";
import controller from "../../controllers/ChargingStationsType";
import auth from "../../middleware/auth";


const router = express.Router();

router.get("/", auth.authenticateToken, controller.getChargingStationTypes);
router.post("/", auth.authenticateToken, controller.addChargingStationType);

router.get("/:id", auth.authenticateToken, controller.getChargingStationType);
router.put("/:id", auth.authenticateToken, controller.updateChargingStationType);
router.delete("/:id", auth.authenticateToken, controller.deleteChargingStationType);

export = router;
