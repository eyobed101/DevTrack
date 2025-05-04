import { Router } from 'express';
import { AnalyticsController } from './controllers/analytics.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new AnalyticsController();

router.get('/productivity', authenticate, controller.getProductivityAnalytics);
router.get('/time-tracking', authenticate, controller.getTimeTrackingAnalytics);

export default router;