import { Router } from "express";
import problemRoutes from "./problemRoutes";
import executionRoutes from "./executionRoutes";
import settingRoutes from "./settingRoutes";
import categoryRoutes from "./categoryRoutes";
import techniqueRoutes from "./techniqueRoutes";
import folderRoutes from "./folderRoutes";
import activityRoutes from "./activityRoutes";
import telemetryRoutes from "./telemetryRoutes";
import aiRoutes from "./aiRoutes";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use("/problems", problemRoutes);
router.use("/execute", executionRoutes);
router.use("/settings", settingRoutes);
router.use("/categories", categoryRoutes);
router.use("/techniques", techniqueRoutes);
router.use("/folders", folderRoutes);
router.use("/activities", activityRoutes);
router.use("/telemetry", telemetryRoutes);
router.use("/ai", aiRoutes);

export default router;
