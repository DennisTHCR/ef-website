import express from 'express';
import { SeasonController } from '../controllers/season.controller';

const router = express.Router();
const seasonController = new SeasonController();

router.get('/', seasonController.getAllSeasons);
router.get('/current', seasonController.getCurrentSeason);
router.get('/:seasonId/leaderboard', seasonController.getSeasonLeaderboard);

export default router;
