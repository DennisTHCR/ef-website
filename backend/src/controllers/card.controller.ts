import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { DealtCard } from '../models/dealt_card.model'
import { User } from '../models/user.model';
import { Season } from '../models/season.model';
import { Pack } from '../models/pack.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Card } from '../models/card.model';

export class CardController {
  // Get all cards for the current user
  async getUserCards(req: AuthRequest, res: Response): Promise<void> {
    try {

      const dealtCardRepository = getRepository(DealtCard);
      const cards = await dealtCardRepository.find({
        where: { owner: { id: req.user?.id } },
      });

      res.status(200).json({ cards });
    } catch (error) {
      console.error('Get user cards error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get information about a card by Type middleware
  async getCardByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const cardRepository = getRepository(Card);
      const card = await cardRepository.findOne({
        where: { type },
        relations: ['season'],
      });

      if (!card) {
        res.status(404).json({ message: 'Card not found' });
        return;
      }

      res.status(200).json({ card });
    } catch (error) {
      console.error('Get card by Type error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get a specific card by ID
  async getCardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dealtCardRepository = getRepository(DealtCard);
      const card = await dealtCardRepository.findOne({
        where: { id },
        relations: ['owner'],
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
      const cardRepository = getRepository(Card);
      const seasonRepository = getRepository(Season);
      const dealtCardRepository = getRepository(DealtCard);
      const userRepository = getRepository(User);

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

      // Get all cards of the current season
      const cards = await cardRepository.find({
        where: {
          season: season
        }
      });

      if (cards.length === 0) {
        res.status(404).json({ message: 'No cards found in database' });
        return;
      }

      // Select 3 random cards
      const drawnCards = [];
      for (let i = 0; i < 3; i++) {
        // Select a random card
        const randomIndex = Math.floor(Math.random() * cards.length);
        const card = cards[randomIndex];
        drawnCards.push(card);
      }

      // Mark the pack as opened
      pack.isOpened = true;
      await packRepository.save(pack);

      // First, save all drawn cards to the user
      const newDealtCards = [];
      for (const drawnCard of drawnCards) {
        const newDealtCard = dealtCardRepository.create({
          type: drawnCard.type,
          owner: pack.owner,
          level: 1
        });
        await dealtCardRepository.save(newDealtCard);
        newDealtCards.push(newDealtCard);
      }

      // Now get all cards the user has, including the newly added ones
      const allUserCards = await dealtCardRepository.find({
        where: { owner: { id: req.user?.id } },
      });

      // Group cards by type
      const cardsByType: { [key: string]: DealtCard[] } = {};
      allUserCards.forEach(card => {
        if (!cardsByType[card.type]) {
          cardsByType[card.type] = [];
        }
        cardsByType[card.type].push(card);
      });

      // Process duplicates - for each type that has multiple cards
      const processedCards = [];
      const typesProcessed = new Set<string>();

      for (const type in cardsByType) {
        const cardsOfType = cardsByType[type];

        if (cardsOfType.length > 1 && !typesProcessed.has(type)) {
          typesProcessed.add(type);


          // Calculate total level
          const totalLevel = cardsOfType.reduce((sum, card) => sum + card.level, 0);

          // Keep the first card and update its level
          const cardToKeep = cardsOfType[0];
          const oldLevel = cardToKeep.level;
          cardToKeep.level = totalLevel;
          await dealtCardRepository.save(cardToKeep);

          // Remove other duplicates
          const cardsToRemove = cardsOfType.slice(1);
          await dealtCardRepository.remove(cardsToRemove);

          // Only add to processed cards if it was from this pack opening
          const isNewCard = newDealtCards.some(card => card.type === type);
          if (isNewCard) {
            // Get the original card info to return to frontend
            const cardInfo = cards.find(c => c.type === type);
            if (cardInfo) {
              processedCards.push({
                ...cardInfo,
                id: cardToKeep.id,
                level: totalLevel,
                oldLevel: oldLevel,
                wasUpgraded: totalLevel > 1
              });
            }
          }
        } else if (!typesProcessed.has(type)) {
          typesProcessed.add(type);

          // If this card is from the current pack, add it to the response
          const isNewCard = newDealtCards.some(card => card.type === type);
          if (isNewCard) {
            const cardInfo = cards.find(c => c.type === type);
            if (cardInfo) {
              processedCards.push({
                ...cardInfo,
                id: cardsOfType[0].id,
                level: cardsOfType[0].level,
                wasUpgraded: false
              });
            }
          }
        }
      }

      // Recalculate the user's rating
      if (req.user) {
        const user = (await userRepository.findOne({ where: { id: req.user.id } }))!;

        const userCards = await dealtCardRepository.find({
          where: { owner: { id: req.user.id } }
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

      res.status(200).json({
        message: 'Pack opened successfully',
        cards: processedCards
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

  // Sell a card
  async sellCard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cardId } = req.body;

      const dealtCardRepository = getRepository(DealtCard);
      const userRepository = getRepository(User);
      const cardRepository = getRepository(Card);

      // Get the card
      const card = await dealtCardRepository.findOne({
        where: { id: cardId, owner: { id: req.user?.id } },
      });

      if (!card) {
        res.status(404).json({ message: 'Card not found or not owned by user' });
        return;
      }

      // Update user votes
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

      user.votesToday -= 1;
      await userRepository.save(user);

      card.level -= 1;
      await dealtCardRepository.save(card);
      if (card.level <= 0) {
        // Remove the card
        await dealtCardRepository.remove(card);
      }

      // Recalculate the user's rating
      if (req.user) {
        const user = (await userRepository.findOne({ where: { id: req.user.id } }))!;

        const userCards = await dealtCardRepository.find({
          where: { owner: { id: req.user.id } }
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

      res.status(200).json({
        message: 'Card sold successfully',
      });
    } catch (error) {
      console.error('Sell card error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Buy pack
  async buyPack(req: AuthRequest, res: Response): Promise<void> {
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

      // Check if the user has enough balance
      if (user.coins < 100) {
        res.status(404).json({ message: 'Not enough balance' });

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

      // Update the user coins
      user.coins -= 100;
      await userRepository.save(user);

      res.status(200).json({
        message: 'Pack bought successfully',
        pack: newPack,
        new_balance: user.coins,
      });
    } catch (error) {
      console.error('Buy pack error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
