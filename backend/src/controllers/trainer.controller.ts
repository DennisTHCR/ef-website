import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/user.model';

export class TrainerController {
  // Get top trainers
  async getTopTrainers(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 100 } = req.query;

      const userRepository = getRepository(User);
      const topTrainers = await userRepository.find({
        order: { rating: 'DESC' },
        take: Number(limit),
      });

      // For each trainer, get their best card
      const trainerData = await Promise.all(
        topTrainers.map(async (trainer) => {
          return {
            id: trainer.id,
            username: trainer.username,
            rating: trainer.rating,
          };
        })
      );

      res.status(200).json({ trainers: trainerData });
    } catch (error) {
      console.error('Get top trainers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
