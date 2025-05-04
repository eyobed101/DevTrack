import { Router } from 'express';
import { ProjectController } from './controllers/project.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new ProjectController();

router.get('/', authenticate, controller.getAllProjects);
router.get('/:id', authenticate, controller.getProjectById);
router.post('/', authenticate, controller.createProject);
router.put('/:id', authenticate, controller.updateProject);
router.delete('/:id', authenticate, controller.deleteProject);

export default router;