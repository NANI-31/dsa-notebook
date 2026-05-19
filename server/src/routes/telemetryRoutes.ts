import { Router } from 'express';
import { createTelemetryLogs, getTelemetryLogs } from '../controllers/telemetryController';

const router = Router();

router.post('/', createTelemetryLogs);
router.get('/', getTelemetryLogs);

export default router;
