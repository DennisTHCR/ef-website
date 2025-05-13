"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardController = void 0;
const typeorm_1 = require("typeorm");
const dealt_card_model_1 = require("../models/dealt_card.model");
const user_model_1 = require("../models/user.model");
const season_model_1 = require("../models/season.model");
const pack_model_1 = require("../models/pack.model");
const card_model_1 = require("../models/card.model");
class CardController {
    // Get all cards for the current user
    async getUserCards(req, res) {
        try {
            const dealtCardRepository = (0, typeorm_1.getRepository)(dealt_card_model_1.DealtCard);
            const cards = await dealtCardRepository.find({
                where: { owner: { id: req.user?.id } },
            });
            res.status(200).json({ cards });
        }
        catch (error) {
            console.error('Get user cards error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Get information about a card by Type middleware
    async getCardByType(req, res) {
        try {
            const { type } = req.params;
            const cardRepository = (0, typeorm_1.getRepository)(card_model_1.Card);
            const card = await cardRepository.findOne({
                where: { type },
                relations: ['season'],
            });
            if (!card) {
                res.status(404).json({ message: 'Card not found' });
                return;
            }
            res.status(200).json({ card });
        }
        catch (error) {
            console.error('Get card by Type error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Get a specific card by ID
    async getCardById(req, res) {
        try {
            const { id } = req.params;
            const dealtCardRepository = (0, typeorm_1.getRepository)(dealt_card_model_1.DealtCard);
            const card = await dealtCardRepository.findOne({
                where: { id },
                relations: ['owner'],
            });
            if (!card) {
                res.status(404).json({ message: 'Card not found' });
                return;
            }
            res.status(200).json({ card });
        }
        catch (error) {
            console.error('Get card by ID error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Open a pack
    async openPack(req, res) {
        try {
            const packRepository = (0, typeorm_1.getRepository)(pack_model_1.Pack);
            const cardRepository = (0, typeorm_1.getRepository)(card_model_1.Card);
            const seasonRepository = (0, typeorm_1.getRepository)(season_model_1.Season);
            const dealtCardRepository = (0, typeorm_1.getRepository)(dealt_card_model_1.DealtCard);
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
            const cardsByType = {};
            allUserCards.forEach(card => {
                if (!cardsByType[card.type]) {
                    cardsByType[card.type] = [];
                }
                cardsByType[card.type].push(card);
            });
            // Process duplicates - for each type that has multiple cards
            const processedCards = [];
            const typesProcessed = new Set();
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
                }
                else if (!typesProcessed.has(type)) {
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
            res.status(200).json({
                message: 'Pack opened successfully',
                cards: processedCards
            });
        }
        catch (error) {
            console.error('Open pack error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Claim daily pack
    async claimDailyPack(req, res) {
        try {
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            const packRepository = (0, typeorm_1.getRepository)(pack_model_1.Pack);
            const seasonRepository = (0, typeorm_1.getRepository)(season_model_1.Season);
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
            if (lastClaim.getDate() === now.getDate() &&
                lastClaim.getMonth() === now.getMonth() &&
                lastClaim.getFullYear() === now.getFullYear()) {
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
        }
        catch (error) {
            console.error('Claim daily pack error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Upgrade a card
    async upgradeCard(req, res) {
        try {
            const { cardId, sacrificeCardIds } = req.body;
            if (!sacrificeCardIds || !Array.isArray(sacrificeCardIds) || sacrificeCardIds.length === 0) {
                res.status(400).json({ message: 'No sacrifice cards provided' });
                return;
            }
            const dealtCardRepository = (0, typeorm_1.getRepository)(dealt_card_model_1.DealtCard);
            // Get the card to upgrade
            const card = await dealtCardRepository.findOne({
                where: { id: cardId, owner: { id: req.user?.id } },
            });
            if (!card) {
                res.status(404).json({ message: 'Card not found or not owned by user' });
                return;
            }
            // Get all sacrifice cards
            const sacrificeCards = await dealtCardRepository.find({
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
                if (sacrificeCard.type !== card.type) {
                    res.status(400).json({
                        message: 'All sacrifice cards must have the same teacher and subject as the card being upgraded'
                    });
                    return;
                }
            }
            // Update the card level
            card.level += sacrificeCards.length;
            await dealtCardRepository.save(card);
            // Remove the sacrifice cards
            await dealtCardRepository.remove(sacrificeCards);
            res.status(200).json({
                message: 'Card upgraded successfully',
                card,
            });
        }
        catch (error) {
            console.error('Upgrade card error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Sell a card
    async sellCard(req, res) {
        try {
            const { cardId } = req.body;
            const dealtCardRepository = (0, typeorm_1.getRepository)(dealt_card_model_1.DealtCard);
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            // Get the card
            const card = await dealtCardRepository.findOne({
                where: { id: cardId, owner: { id: req.user?.id } },
            });
            if (!card) {
                res.status(404).json({ message: 'Card not found or not owned by user' });
                return;
            }
            // Calculate the sell value based on level and rating
            const baseValue = 50;
            const levelBonus = (card.level - 1) * 25;
            const sellValue = Math.floor(baseValue + levelBonus);
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
            await dealtCardRepository.remove(card);
            res.status(200).json({
                message: 'Card sold successfully',
                coinsEarned: sellValue,
                totalCoins: user.coins,
            });
        }
        catch (error) {
            console.error('Sell card error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Buy pack
    async buyPack(req, res) {
        try {
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            const packRepository = (0, typeorm_1.getRepository)(pack_model_1.Pack);
            const seasonRepository = (0, typeorm_1.getRepository)(season_model_1.Season);
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
        }
        catch (error) {
            console.error('Buy pack error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.CardController = CardController;
