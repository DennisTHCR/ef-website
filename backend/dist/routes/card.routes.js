"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const card_controller_1 = require("../controllers/card.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const cardController = new card_controller_1.CardController();
router.get('/', auth_middleware_1.authMiddleware, cardController.getUserCards);
router.get('/:id', cardController.getCardById);
router.get('/type/:type', cardController.getCardByType);
router.post('/open-pack', auth_middleware_1.authMiddleware, cardController.openPack);
router.post('/claim-daily', auth_middleware_1.authMiddleware, cardController.claimDailyPack);
router.post('/upgrade', auth_middleware_1.authMiddleware, cardController.upgradeCard);
router.post('/sell', auth_middleware_1.authMiddleware, cardController.sellCard);
router.post('/buy-pack', auth_middleware_1.authMiddleware, cardController.buyPack);
exports.default = router;
