import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Trade } from '../models/trade.model';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { DealtCard } from '../models/dealt_card.model';

export class TradeController {
  // Create a trade offer
  async createTradeOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { offeredCardId, requestedCardId, askingPrice } = req.body;

      if (!offeredCardId || (!requestedCardId && askingPrice === undefined)) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      const dealtCardRepository = getRepository(DealtCard);
      const tradeRepository = getRepository(Trade);

      // Check if the offered card belongs to the user
      const offeredCard = await dealtCardRepository.findOne({
        where: { id: offeredCardId, owner: { id: req.user?.id } },
      });

      if (!offeredCard) {
        res.status(404).json({ message: 'Card not found or not owned by user' });
        return;
      }

      let requestedCard = null;
      let offeredTo = null;

      if (requestedCardId) {
        // This is a direct trade offer
        requestedCard = await dealtCardRepository.findOne({
          where: { id: requestedCardId },
          relations: ['owner'],
        });

        if (!requestedCard) {
          res.status(404).json({ message: 'Requested card not found' });
          return;
        }

        offeredTo = requestedCard.owner;

        // Check if the cards are already in a pending trade
        const existingTrade = await tradeRepository.findOne({
          where: [
            { offeredCard: { owner: offeredCardId }, status: 'pending' },
            { requestedCard: { owner: requestedCardId }, status: 'pending' },
          ],
        });

        if (existingTrade) {
          res.status(400).json({ message: 'One or both cards are already in a pending trade' });
          return;
        }
      }

      // Create the trade offer
      const trade = tradeRepository.create({
        offeredBy: req.user,
        offeredTo,
        offeredCard,
        requestedCard,
        askingPrice: askingPrice || 0,
      });

      await tradeRepository.save(trade);

      res.status(201).json({
        message: 'Trade offer created successfully',
        trade,
      });
    } catch (error) {
      console.error('Create trade offer error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Accept a trade offer
  async acceptTradeOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tradeId } = req.body;

      const tradeRepository = getRepository(Trade);
      const dealtCardRepository = getRepository(DealtCard);
      const userRepository = getRepository(User);

      // Get the trade
      const trade = await tradeRepository.findOne({
        where: { id: tradeId, status: 'pending' },
        relations: ['offeredBy', 'offeredTo', 'offeredCard', 'requestedCard'],
      });

      if (!trade) {
        res.status(404).json({ message: 'Trade not found or already completed' });
        return;
      }

      // Check if the user is the one the trade was offered to
      if (trade.offeredTo && trade.offeredTo.id !== req.user?.id) {
        res.status(403).json({ message: 'Not authorized to accept this trade' });
        return;
      }

      // Handle different trade types
      if (trade.requestedCard) {
        // Direct card-for-card trade
        // Check if the requested card still belongs to the user
        const requestedCard = await dealtCardRepository.findOne({
          where: { id: trade.requestedCard.id, owner: { id: req.user?.id } },
        });

        if (!requestedCard) {
          res.status(404).json({ message: 'Requested card no longer owned by user' });
          return;
        }

        // Swap card ownership
        requestedCard.owner = trade.offeredBy;
        trade.offeredCard.owner = req.user!;

        await dealtCardRepository.save(requestedCard);
        await dealtCardRepository.save(trade.offeredCard);
      } else {
        // Card for coins trade
        if (!req.user) {
          res.status(401).json({ message: 'Not authenticated' });
          return;
        }

        const buyer = await userRepository.findOne({ where: { id: req.user.id } });

        if (!buyer) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        // Check if buyer has enough coins
        if (buyer.coins < trade.askingPrice) {
          res.status(400).json({ message: 'Not enough coins to complete this trade' });
          return;
        }

        // Transfer coins and card
        buyer.coins -= trade.askingPrice;
        trade.offeredBy.coins += trade.askingPrice;
        trade.offeredCard.owner = buyer;

        await userRepository.save(buyer);
        await userRepository.save(trade.offeredBy);
        await dealtCardRepository.save(trade.offeredCard);
      }

      // Mark the trade as completed
      trade.status = 'completed';
      await tradeRepository.save(trade);

      res.status(200).json({
        message: 'Trade completed successfully',
        trade,
      });
    } catch (error) {
      console.error('Accept trade offer error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Cancel a trade offer
  async cancelTradeOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tradeId } = req.body;

      const tradeRepository = getRepository(Trade);

      // Get the trade
      const trade = await tradeRepository.findOne({
        where: { id: tradeId, status: 'pending' },
        relations: ['offeredBy'],
      });

      if (!trade) {
        res.status(404).json({ message: 'Trade not found or already completed' });
        return;
      }

      // Check if the user is the one who created the trade
      if (trade.offeredBy.id !== req.user?.id) {
        res.status(403).json({ message: 'Not authorized to cancel this trade' });
        return;
      }

      // Mark the trade as canceled
      trade.status = 'canceled';
      await tradeRepository.save(trade);

      res.status(200).json({
        message: 'Trade canceled successfully',
        trade,
      });
    } catch (error) {
      console.error('Cancel trade offer error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all trade offers
  async getTradeOffers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tradeRepository = getRepository(Trade);

      // Get all pending trades
      const trades = await tradeRepository.find({
        where: [
          { status: 'pending', offeredTo: { id: req.user?.id } }, // Trades offered to the user
        ],
        relations: ['offeredBy', 'offeredTo', 'offeredCard', 'requestedCard'],
      });

      res.status(200).json({ trades });
    } catch (error) {
      console.error('Get trade offers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Get user's trade history
  async getUserTradeHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tradeRepository = getRepository(Trade);

      // Get all trades involving the user
      const trades = await tradeRepository.find({
        where: [
          { offeredBy: { id: req.user?.id } },
          { offeredTo: { id: req.user?.id } },
        ],
        relations: ['offeredBy', 'offeredTo', 'offeredCard', 'requestedCard'],
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({ trades });
    } catch (error) {
      console.error('Get user trade history error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
