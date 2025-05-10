import { Router } from 'express';
import { NotificationController } from './controllers/notification.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new NotificationController();

router.get('/', authenticate, controller.getAllNotifications);
router.post('/', authenticate, controller.sendNotification);

export default router;