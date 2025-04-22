import express from 'express';
import { TradeController } from '../controllers/trade.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const tradeController = new TradeController();

router.post('/create', authMiddleware, tradeController.createTradeOffer);
router.post('/accept', authMiddleware, tradeController.acceptTradeOffer);
router.post('/cancel', authMiddleware, tradeController.cancelTradeOffer);
router.get('/offers', authMiddleware, tradeController.getTradeOffers);
router.get('/history', authMiddleware, tradeController.getUserTradeHistory);

export default router;
