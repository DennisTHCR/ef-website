import express from 'express';
import { TrainerController } from '../controllers/trainer.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const trainerController = new TrainerController();

router.get('/top', trainerController.getTopTrainers);
router.post('/update-rating', authMiddleware, trainerController.updateTrainerRating);

export default router;
