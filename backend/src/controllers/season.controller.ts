import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Season } from '../models/season.model';
import { Card } from '../models/card.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class SeasonController {
  // Get all seasons
  async getAllSeasons(req: Request, res: Response): Promise<void> {
    try {
      const seasonRepository = getRepository(Season);
      const seasons = await seasonRepository.find({
        order: { id: 'DESC' },
      });

      res.status(200).json({ seasons });
    } catch (error) {
      console.error('Get all seasons error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get current active season
  async getCurrentSeason(req: Request, res: Response): Promise<void> {
    try {
      const seasonRepository = getRepository(Season);
      const currentSeason = await seasonRepository.findOne({
        where: { isActive: true },
      });

      if (!currentSeason) {
        res.status(404).json({ message: 'No active season found' });
        return;
      }

      res.status(200).json({ season: currentSeason });
    } catch (error) {
      console.error('Get current season error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get season leaderboard
  async getSeasonLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { seasonId } = req.params;

      const cardRepository = getRepository(Card);
      const seasonRepository = getRepository(Season);

      // Check if the season exists
      const season = await seasonRepository.findOne({
        where: { id: Number(seasonId) },
      });

      if (!season) {
        res.status(404).json({ message: 'Season not found' });
        return;
      }

      // Get top rated cards for the season
      const topCards = await cardRepository.find({
        where: { season: { id: Number(seasonId) } },
        relations: ['owner'],
        order: { rating: 'DESC' },
        take: 100,
      });

      res.status(200).json({
        season,
        leaderboard: topCards,
      });
    } catch (error) {
      console.error('Get season leaderboard error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
