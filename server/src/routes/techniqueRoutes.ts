import { Router } from "express";
import {
  getTechniques,
  createTechnique,
  updateTechnique,
  deleteTechnique,
} from "../controllers/techniqueController";

const router = Router();

router.get("/", getTechniques);
router.post("/", createTechnique);
router.put("/:id", updateTechnique);
router.delete("/:id", deleteTechnique);

export default router;
