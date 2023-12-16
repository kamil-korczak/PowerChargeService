import express from "express";
import controller from "../../controllers/Connectors";
import auth from "../../middleware/auth";


const router = express.Router();

router.get("/", auth.authenticateToken, controller.getConnectors);
router.post("/", auth.authenticateToken, controller.addConnector);

router.get("/:id", auth.authenticateToken, controller.getConnector);
router.put("/:id", auth.authenticateToken, controller.updateConnector);
router.delete("/:id", auth.authenticateToken, controller.deleteConnector);

export = router;
