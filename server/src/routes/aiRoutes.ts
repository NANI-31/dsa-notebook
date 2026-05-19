import { Router } from "express";
import { reviewCode, generateHint, reviewCodeStream, generateHintStream } from "../controllers/aiController";

const router = Router();

router.post("/review", reviewCode);
router.post("/hint", generateHint);
router.post("/review/stream", reviewCodeStream);
router.post("/hint/stream", generateHintStream);

export default router;
