"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trade_controller_1 = require("../controllers/trade.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const tradeController = new trade_controller_1.TradeController();
router.post('/create', auth_middleware_1.authMiddleware, tradeController.createTradeOffer);
router.post('/accept', auth_middleware_1.authMiddleware, tradeController.acceptTradeOffer);
router.post('/cancel', auth_middleware_1.authMiddleware, tradeController.cancelTradeOffer);
router.get('/offers', auth_middleware_1.authMiddleware, tradeController.getTradeOffers);
router.get('/history', auth_middleware_1.authMiddleware, tradeController.getUserTradeHistory);
exports.default = router;
