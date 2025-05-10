import { Router } from 'express';
import { ReportController } from './controllers/report.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new ReportController();

router.get('/', authenticate, controller.getAllReports);
router.post('/export', authenticate, controller.exportReport);

export default router;