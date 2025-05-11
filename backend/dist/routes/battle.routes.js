"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const battle_controller_1 = require("../controllers/battle.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const battleController = new battle_controller_1.BattleController();
router.get('/cards', auth_middleware_1.authMiddleware, battleController.getBattleCards);
router.post('/vote', auth_middleware_1.authMiddleware, battleController.voteBattle);
router.get('/history', auth_middleware_1.authMiddleware, battleController.getBattleHistory);
router.get('/top-cards', battleController.getTopRankedCards);
exports.default = router;
