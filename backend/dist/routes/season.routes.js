"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const season_controller_1 = require("../controllers/season.controller");
const router = express_1.default.Router();
const seasonController = new season_controller_1.SeasonController();
router.get('/', seasonController.getAllSeasons);
router.get('/current', seasonController.getCurrentSeason);
router.get('/:seasonId/leaderboard', seasonController.getSeasonLeaderboard);
exports.default = router;
