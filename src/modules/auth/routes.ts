import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validator';
import { loginSchema, registerSchema } from './auth.schema';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new AuthController();

router.post('/login', validate(loginSchema), controller.login);
router.post('/register', validate(registerSchema), controller.register);
router.post('/logout', authenticate, controller.logout);
router.post('/refresh-token', controller.refreshToken);
router.get('/me', authenticate, controller.getCurrentUser);

export { router as authRouter };