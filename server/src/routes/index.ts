import { Router } from "express";
import problemRoutes from "./problemRoutes";
import executionRoutes from "./executionRoutes";
import settingRoutes from "./settingRoutes";
import categoryRoutes from "./categoryRoutes";
import techniqueRoutes from "./techniqueRoutes";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use("/problems", problemRoutes);
router.use("/execute", executionRoutes);
router.use("/settings", settingRoutes);
router.use("/categories", categoryRoutes);
router.use("/techniques", techniqueRoutes);

export default router;
