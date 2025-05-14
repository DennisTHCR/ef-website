import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Battle } from '../models/battle.model';
import { Card } from '../models/card.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { EloService } from '../services/elo.service';
import { Season } from '../models/season.model';
import { DealtCard } from '../models/dealt_card.model';

export class BattleController {
  // Get battle cards for voting
  async getBattleCards(_: AuthRequest, res: Response): Promise<void> {
    try {
      const cardRepository = getRepository(Card);
      const seasonRepository = getRepository(Season);

      const currentSeason = await seasonRepository.findOne({
        where: { isActive: true }
      });

      // Find two random cards with similar ratings
      // Ideally, we'd implement a more sophisticated matching algorithm
      const cards = await cardRepository.find({
        order: { rating: 'ASC' },
        take: 100, // Take a pool of cards to choose from
        where: { season: { id: currentSeason!.id } }
      });

      if (cards.length < 2) {
        res.status(404).json({ message: 'Not enough cards for a battle' });
        return;
      }

      // Randomly select two cards
      const randomIndex1 = Math.floor(Math.random() * cards.length);
      let randomIndex2;
      do {
        randomIndex2 = Math.floor(Math.random() * cards.length);
      } while (randomIndex1 === randomIndex2);

      const card1 = cards[randomIndex1];
      const card2 = cards[randomIndex2];

      res.status(200).json({
        card1,
        card2,
      });
    } catch (error) {
      console.error('Get battle cards error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Vote on a battle
  async voteBattle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { card1Id, card2Id, winnerId } = req.body;

      if (!card1Id || !card2Id || !winnerId) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      if (winnerId !== card1Id && winnerId !== card2Id) {
        res.status(400).json({ message: 'Winner must be one of the battle cards' });
        return;
      }

      const cardRepository = getRepository(Card);
      const dealtCardRepository = getRepository(DealtCard);
      const userRepository = getRepository(User);
      const battleRepository = getRepository(Battle);

      // Get the cards
      const card1 = await cardRepository.findOne({ where: { type: card1Id } });
      const card2 = await cardRepository.findOne({ where: { type: card2Id } });

      if (!card1 || !card2) {
        res.status(404).json({ message: 'One or both cards not found' });
        return;
      }

      // Create the battle record
      const battle = battleRepository.create({
        card1,
        card2,
        winnerId,
        voter: req.user,
      });

      await battleRepository.save(battle);

      // Determine winner and loser cards
      const winner = winnerId === card1Id ? card1 : card2;
      const loser = winnerId === card1Id ? card2 : card1;

      // Calculate new Elo ratings
      const { winnerNewRating, loserNewRating } = new EloService().calculateNewRatings(
        winner.rating,
        loser.rating
      );

      // Find all users who own these cards

      const winnerDealtCards = await dealtCardRepository.find({
        where: { type: winner.type },
        relations: ['owner']
      });

      const loserDealtCards = await dealtCardRepository.find({
        where: { type: loser.type },
        relations: ['owner']
      });

      // Update each user's rating
      const usersToUpdate = new Map<string, User>();

      // Process winner card owners

      for (const dealtCard of winnerDealtCards) {
        const user = dealtCard.owner;
        if (!usersToUpdate.has(user.id)) {
          usersToUpdate.set(user.id, user);
        }
      }


      // Process loser card owners
      for (const dealtCard of loserDealtCards) {
        const user = dealtCard.owner;
        if (!usersToUpdate.has(user.id)) {
          usersToUpdate.set(user.id, user);
        }
      }

      // Update winner stats
      winner.rating = winnerNewRating;
      winner.wins += 1;
      await cardRepository.save(winner);

      // Update loser stats
      loser.rating = loserNewRating;
      loser.losses += 1;
      await cardRepository.save(loser);

      // Update all affected users' ratings
      for (const user of usersToUpdate.values()) {
        if (!user) continue;
        // Get all cards owned by this user
        const userCards = await dealtCardRepository.find({
          where: { owner: { id: user.id } }
        });

        // Calculate total rating
        let totalRating = 0;

        for (const dealtCard of userCards) {
          const cardInfo = await cardRepository.findOne({
            where: { type: dealtCard.type },
            relations: ['season']
          });


          if (cardInfo && cardInfo.season.isActive) {
            // Apply card level multiplier to rating
            totalRating += cardInfo.rating * dealtCard.level;
          }
        }

        // Update user rating
        user.rating = totalRating;
        await userRepository.save(user);
      }

      // Give the voter some coins as a reward
      if (req.user) {
        const user = await userRepository.findOne({ where: { id: req.user.id } });

        if (user) {
          user.coins += 10; // Reward for voting
          await userRepository.save(user);
        }
      }

      res.status(200).json({
        message: 'Vote recorded successfully',
        battleResult: {
          battle,
          winnerNewRating,
          loserNewRating,
          coinsEarned: 10,
        },
      });
    } catch (error) {
      console.error('Vote battle error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Helper method to recalculate a user's rating based on their cards
  async recalculateUserRating(userId: string): Promise<void> {
    const userRepository = getRepository(User);
    const dealtCardRepository = getRepository(DealtCard);
    const cardRepository = getRepository(Card);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    // Get all cards owned by this user
    const userCards = await dealtCardRepository.find({
      where: { owner: { id: userId } }
    });

    // Calculate total rating
    let totalRating = 0;

    for (const dealtCard of userCards) {
      const cardInfo = await cardRepository.findOne({
        where: { type: dealtCard.type },
        relations: ['season']
      });


      if (cardInfo && cardInfo.season.isActive) {
        // Apply card level multiplier to rating
        totalRating += cardInfo.rating * dealtCard.level;
      }
    }

    // Update user rating
    user.rating = totalRating;
    await userRepository.save(user);
  }


  // Get battle history
  async getBattleHistory(_: AuthRequest, res: Response): Promise<void> {
    try {
      const battleRepository = getRepository(Battle);

      const battles = await battleRepository.find({
        relations: ['card1', 'card2', 'voter'],
        order: { battleDate: 'DESC' },
        take: 50, // Limit to the most recent 50 battles
      });

      res.status(200).json({ battles });
    } catch (error) {
      console.error('Get battle history error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get top ranked cards
  async getTopRankedCards(_: Request, res: Response): Promise<void> {
    try {
      const cardRepository = getRepository(Card);
      const seasonRepository = getRepository(Season);

      // Check if the season exists
      const season = await seasonRepository.findOne({
        where: { isActive: true },
      });

      if (!season) {
        res.status(404).json({ message: 'Season not found' });
        return;
      }

      const seasonId = season.id;

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
}
