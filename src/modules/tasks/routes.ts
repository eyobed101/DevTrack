import { Router } from 'express';
import { TaskController } from './controllers/task.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new TaskController();

router.get('/', authenticate, controller.getAllTasks);
router.get('/:id', authenticate, controller.getTaskById);
router.post('/', authenticate, controller.createTask);
router.put('/:id', authenticate, controller.updateTask);
router.delete('/:id', authenticate, controller.deleteTask);

export default router;