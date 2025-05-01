import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Battle } from '../models/battle.model';
import { Card } from '../models/card.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { EloService } from '../services/elo.service';
import { DealtCard } from '../models/dealt_card.model';

export class BattleController {
  private eloService = new EloService();

  // Get battle cards for voting
  async getBattleCards(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cardRepository = getRepository(Card);

      // Find two random cards with similar ratings
      // Ideally, we'd implement a more sophisticated matching algorithm
      const cards = await cardRepository.find({
        order: { rating: 'ASC' },
        take: 100, // Take a pool of cards to choose from
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

      const dealtCardRepository = getRepository(DealtCard);
      const cardRepository = getRepository(Card);
      const battleRepository = getRepository(Battle);

      // Get the cards
      const card1 = await dealtCardRepository.findOne({ where: { id: card1Id } });
      const card2 = await dealtCardRepository.findOne({ where: { id: card2Id } });

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

      // Update card ratings
      const winner = (await cardRepository.findOne({ where: { type: winnerId === card1Id ? card1.type : card2.type } }))!;
      const loser = (await cardRepository.findOne({ where: { type: winnerId === card1Id ? card2.type : card1.type } }))!;

      const { winnerNewRating, loserNewRating } = this.eloService.calculateNewRatings(
        winner.rating,
        loser.rating
      );

      // Update winner stats
      winner.rating = winnerNewRating;
      winner.wins += 1;
      await dealtCardRepository.save(winner);

      // Update loser stats
      loser.rating = loserNewRating;
      loser.losses += 1;
      await dealtCardRepository.save(loser);

      // Give the voter some coins as a reward
      if (req.user) {
        const userRepository = getRepository(User);
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

  // Get battle history
  async getBattleHistory(req: AuthRequest, res: Response): Promise<void> {
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
  async getTopRankedCards(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, seasonId } = req.query;

      const cardRepository = getRepository(Card);
      let query = cardRepository
        .createQueryBuilder('card')
        .leftJoinAndSelect('card.owner', 'owner')
        .leftJoinAndSelect('card.season', 'season')
        .orderBy('card.rating', 'DESC')
        .take(Number(limit));

      if (seasonId) {
        query = query.where('card.season.id = :seasonId', { seasonId });
      }

      const cards = await query.getMany();

      res.status(200).json({ cards });
    } catch (error) {
      console.error('Get top ranked cards error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
