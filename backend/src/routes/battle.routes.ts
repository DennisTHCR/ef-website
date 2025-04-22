import express from 'express';
import { BattleController } from '../controllers/battle.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const battleController = new BattleController();

router.get('/cards', authMiddleware, battleController.getBattleCards);
router.post('/vote', authMiddleware, battleController.voteBattle);
router.get('/history', authMiddleware, battleController.getBattleHistory);
router.get('/top-cards', battleController.getTopRankedCards);

export default router;
