import { Router } from 'express';
import { TeamController } from './controllers/team.controller';
import { authenticate } from '../../middlewares/authenticate';

const router = Router();
const controller = new TeamController();

router.get('/', authenticate, controller.getAllTeams);
router.get('/:id', authenticate, controller.getTeamById);
router.post('/', authenticate, controller.createTeam);
router.put('/:id', authenticate, controller.updateTeam);
router.delete('/:id', authenticate, controller.deleteTeam);

export default router