import { Router } from 'express';
import { UserController } from './controllers/user.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new UserController();

router.get('/', authenticate, controller.getAllUsers);
router.get('/:id', authenticate, controller.getUserById);
router.post('/', authenticate, controller.createUser);
router.put('/:id', authenticate, controller.updateUser);
router.delete('/:id', authenticate, controller.deleteUser);

export default router;

