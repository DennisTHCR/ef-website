import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Season } from '../models/season.model';
import { Card } from '../models/card.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Quote } from '../models/quote.model';
import { Teacher } from '../models/teacher.model';

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

  async startNewSeason(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      if (!name) {
        res.status(400).json({ message: 'Season name is required' });
        return;
      }

      const seasonRepository = getRepository(Season);
      const teacherRepository = getRepository(Teacher);
      const cardRepository = getRepository(Card);

      // Set all current active seasons to inactive
      await seasonRepository
        .createQueryBuilder()
        .update(Season)
        .set({ isActive: false })
        .where("isActive = :isActive", { isActive: true })
        .execute();

      // Create new season
      const season = seasonRepository.create({
        name,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7))
      });

      await seasonRepository.save(season);

      const teachers = await teacherRepository.find({
        relations: ['subjects', 'quotes'],
      });

      for (const teacher of teachers) {
        if (teacher.subjects && teacher.subjects.length > 0) {
          for (const subject of teacher.subjects) {
            let randomQuote: Quote | null = null;
            if (teacher.quotes && teacher.quotes.length > 0) {
              const randomIndex = Math.floor(Math.random() * teacher.quotes.length);
              randomQuote = teacher.quotes[randomIndex];
              teacher.quotes = teacher.quotes.filter((_, index) => index != randomIndex);
            }

            let card = new Card();
            card.teacherName = teacher.name;
            card.subject = subject.name;
            card.quote = randomQuote?.text!;
            card.season = season;

            cardRepository.save(card);
          }
        }
      }

      res.status(201).json({
        message: 'New season started successfully',
        season
      });
    } catch (error) {
      console.error('Create new season error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
