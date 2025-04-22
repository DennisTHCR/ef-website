import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Card } from '../models/card.model';
import { User } from '../models/user.model';
import { Season } from '../models/season.model';
import { Pack } from '../models/pack.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class CardController {
  // Get all cards for the current user
  async getUserCards(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cardRepository = getRepository(Card);
      const cards = await cardRepository.find({
        where: { owner: { id: req.user?.id } },
        relations: ['season'],
      });

      res.status(200).json({ cards });
    } catch (error) {
      console.error('Get user cards error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get a specific card by ID
  async getCardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cardRepository = getRepository(Card);
      const card = await cardRepository.findOne({
        where: { id },
        relations: ['season', 'owner'],
      });

      if (!card) {
        res.status(404).json({ message: 'Card not found' });
        return;
      }

      res.status(200).json({ card });
    } catch (error) {
      console.error('Get card by ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Open a pack
  async openPack(req: AuthRequest, res: Response): Promise<void> {
    try {
      const packRepository = getRepository(Pack);
      const userRepository = getRepository(User);
      const cardRepository = getRepository(Card);
      const seasonRepository = getRepository(Season);

      // Find an unopened pack owned by the user
      const pack = await packRepository.findOne({
        where: {
          owner: { id: req.user?.id },
          isOpened: false,
        },
        relations: ['owner'],
      });

      if (!pack) {
        res.status(404).json({ message: 'No unopened packs available' });
        return;
      }

      // Get the current active season
      const season = await seasonRepository.findOne({
        where: { id: pack.seasonId },
      });

      if (!season) {
        res.status(404).json({ message: 'Season not found' });
        return;
      }

      // Generate 3 random cards
      const newCards = [];
      const teachers = ['Mr. Smith', 'Ms. Johnson', 'Dr. Lee', 'Mrs. Garcia', 'Prof. Williams', 'Dr. Miller'];
      const subjects = ['Math', 'Science', 'History', 'English', 'Art', 'Music', 'PE', 'Computer Science'];
      const quotes = [
        'Education is not the filling of a pail, but the lighting of a fire.',
        'The beautiful thing about learning is that no one can take it away from you.',
        'Education is the most powerful weapon which you can use to change the world.',
        'The mind is not a vessel to be filled, but a fire to be kindled.',
        'Knowledge is power.',
        'Learning is a treasure that will follow its owner everywhere.',
        'The more that you read, the more things you will know.',
        'Education is the passport to the future.',
        'A good education is a foundation for a better future.',
        'The roots of education are bitter, but the fruit is sweet.'
      ];

      for (let i = 0; i < 3; i++) {
        const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const card = cardRepository.create({
          teacherName: randomTeacher,
          subject: randomSubject,
          quote: randomQuote,
          owner: req.user,
          season,
        });

        await cardRepository.save(card);
        newCards.push(card);
      }

      // Mark the pack as opened
      pack.isOpened = true;
      await packRepository.save(pack);

      res.status(200).json({
        message: 'Pack opened successfully',
        cards: newCards
      });
    } catch (error) {
      console.error('Open pack error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Claim daily pack
  async claimDailyPack(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRepository = getRepository(User);
      const packRepository = getRepository(Pack);
      const seasonRepository = getRepository(Season);

      const user = await userRepository.findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Check if the user has already claimed a pack today
      const lastClaim = new Date(user.lastPackClaim);
      const now = new Date();

      if (
        lastClaim.getDate() === now.getDate() &&
        lastClaim.getMonth() === now.getMonth() &&
        lastClaim.getFullYear() === now.getFullYear()
      ) {
        res.status(400).json({ message: 'Daily pack already claimed' });
        return;
      }

      // Get current active season
      const currentSeason = await seasonRepository.findOne({
        where: { isActive: true },
      });

      if (!currentSeason) {
        res.status(404).json({ message: 'No active season found' });
        return;
      }

      // Create a new pack
      const newPack = packRepository.create({
        owner: user,
        seasonId: currentSeason.id,
      });

      await packRepository.save(newPack);

      // Update the last claim date
      user.lastPackClaim = now;
      await userRepository.save(user);

      res.status(200).json({
        message: 'Daily pack claimed successfully',
        pack: newPack,
      });
    } catch (error) {
      console.error('Claim daily pack error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Upgrade a card
  async upgradeCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId, sacrificeCardIds } = req.body;

      if (!sacrificeCardIds || !Array.isArray(sacrificeCardIds) || sacrificeCardIds.length === 0) {
        res.status(400).json({ message: 'No sacrifice cards provided' });
        return;
      }

      const cardRepository = getRepository(Card);

      // Get the card to upgrade
      const card = await cardRepository.findOne({
        where: { id: cardId, owner: { id: req.user?.id } },
      });

      if (!card) {
        res.status(404).json({ message: 'Card not found or not owned by user' });
        return;
      }

      // Get all sacrifice cards
      const sacrificeCards = await cardRepository.find({
        where: sacrificeCardIds.map(id => ({ id, owner: { id: req.user?.id } })),
      });

      if (sacrificeCards.length !== sacrificeCardIds.length) {
        res.status(400).json({ message: 'One or more sacrifice cards not found or not owned by user' });
        return;
      }

      // Ensure we're not sacrificing the same card we're upgrading
      if (sacrificeCardIds.includes(cardId)) {
        res.status(400).json({ message: 'Cannot sacrifice the card being upgraded' });
        return;
      }

      // Ensure all sacrifice cards are of the same teacher and subject
      for (const sacrificeCard of sacrificeCards) {
        if (sacrificeCard.teacherName !== card.teacherName || sacrificeCard.subject !== card.subject) {
          res.status(400).json({
            message: 'All sacrifice cards must have the same teacher and subject as the card being upgraded'
          });
          return;
        }
      }

      // Update the card level
      card.level += sacrificeCards.length;
      await cardRepository.save(card);

      // Remove the sacrifice cards
      await cardRepository.remove(sacrificeCards);

      res.status(200).json({
        message: 'Card upgraded successfully',
        card,
      });
    } catch (error) {
      console.error('Upgrade card error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Sell a card
  async sellCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId } = req.body;

      const cardRepository = getRepository(Card);
      const userRepository = getRepository(User);

      // Get the card
      const card = await cardRepository.findOne({
        where: { id: cardId, owner: { id: req.user?.id } },
      });

      if (!card) {
        res.status(404).json({ message: 'Card not found or not owned by user' });
        return;
      }

      // Calculate the sell value based on level and rating
      const baseValue = 50;
      const levelBonus = (card.level - 1) * 25;
      const ratingBonus = Math.max(0, (card.rating - 1000) / 10);
      const sellValue = Math.floor(baseValue + levelBonus + ratingBonus);

      // Update user coins
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const user = await userRepository.findOne({
        where: { id: req.user.id },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user.coins += sellValue;
      await userRepository.save(user);

      // Remove the card
      await cardRepository.remove(card);

      res.status(200).json({
        message: 'Card sold successfully',
        coinsEarned: sellValue,
        totalCoins: user.coins,
      });
    } catch (error) {
      console.error('Sell card error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
