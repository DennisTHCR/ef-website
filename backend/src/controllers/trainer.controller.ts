import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/user.model';
import { Card } from '../models/card.model';
import { AuthRequest } from '../middleware/auth.middleware';

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
          const cardRepository = getRepository(Card);
          const bestCard = await cardRepository.findOne({
            where: { owner: { id: trainer.id } },
            order: { rating: 'DESC' },
          });

          return {
            id: trainer.id,
            username: trainer.username,
            rating: trainer.rating,
            bestCard,
          };
        })
      );

      res.status(200).json({ trainers: trainerData });
    } catch (error) {
      console.error('Get top trainers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Update user's trainer rating
  async updateTrainerRating(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRepository = getRepository(User);
      const cardRepository = getRepository(Card);

      // Get all cards for the user
      const cards = await cardRepository.find({
        where: { owner: { id: req.user?.id } },
      });

      if (cards.length === 0) {
        res.status(200).json({ message: 'No cards found for rating calculation' });
        return;
      }

      // Calculate the total rating based on top 10 cards
      const sortedCards = cards.sort((a, b) => b.rating - a.rating);
      const topCards = sortedCards.slice(0, 10);

      const totalRating = topCards.reduce((sum, card) => sum + card.rating, 0);
      const averageRating = Math.floor(totalRating / topCards.length);

      // Update the user's rating
      if (req.user) {
        const user = await userRepository.findOne({ where: { id: req.user.id } });

        if (user) {
          user.rating = averageRating;
          await userRepository.save(user);

          res.status(200).json({
            message: 'Trainer rating updated successfully',
            rating: user.rating,
            topCards,
          });
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } else {
        res.status(401).json({ message: 'Not authenticated' });
      }
    } catch (error) {
      console.error('Update trainer rating error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
