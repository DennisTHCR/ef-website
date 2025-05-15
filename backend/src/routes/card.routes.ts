import express from 'express';
import { CardController } from '../controllers/card.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const cardController = new CardController();

router.get('/', authMiddleware, cardController.getUserCards);
router.get('/:id', cardController.getCardById);
router.get('/type/:type', cardController.getCardByType);
router.post('/open-pack', authMiddleware, cardController.openPack);
router.post('/claim-daily', authMiddleware, cardController.claimDailyPack);
router.post('/sell', authMiddleware, cardController.sellCard);
router.post('/buy-pack', authMiddleware, cardController.buyPack);

export default router;
