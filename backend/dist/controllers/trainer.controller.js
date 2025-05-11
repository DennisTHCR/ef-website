"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerController = void 0;
const typeorm_1 = require("typeorm");
const user_model_1 = require("../models/user.model");
class TrainerController {
    // Get top trainers
    async getTopTrainers(req, res) {
        try {
            const { limit = 100 } = req.query;
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            const topTrainers = await userRepository.find({
                order: { rating: 'DESC' },
                take: Number(limit),
            });
            // For each trainer, get their best card
            const trainerData = await Promise.all(topTrainers.map(async (trainer) => {
                return {
                    id: trainer.id,
                    username: trainer.username,
                    rating: trainer.rating,
                };
            }));
            res.status(200).json({ trainers: trainerData });
        }
        catch (error) {
            console.error('Get top trainers error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.TrainerController = TrainerController;
