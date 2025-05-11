"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleController = void 0;
const typeorm_1 = require("typeorm");
const battle_model_1 = require("../models/battle.model");
const card_model_1 = require("../models/card.model");
const user_model_1 = require("../models/user.model");
const elo_service_1 = require("../services/elo.service");
const season_model_1 = require("../models/season.model");
class BattleController {
    // Get battle cards for voting
    async getBattleCards(req, res) {
        try {
            const cardRepository = (0, typeorm_1.getRepository)(card_model_1.Card);
            const seasonRepository = (0, typeorm_1.getRepository)(season_model_1.Season);
            const currentSeason = await seasonRepository.findOne({
                where: { isActive: true }
            });
            // Find two random cards with similar ratings
            // Ideally, we'd implement a more sophisticated matching algorithm
            const cards = await cardRepository.find({
                order: { rating: 'ASC' },
                take: 100, // Take a pool of cards to choose from
                where: { season: { id: currentSeason.id } }
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
        }
        catch (error) {
            console.error('Get battle cards error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Vote on a battle
    async voteBattle(req, res) {
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
            const cardRepository = (0, typeorm_1.getRepository)(card_model_1.Card);
            const battleRepository = (0, typeorm_1.getRepository)(battle_model_1.Battle);
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
            // Update card ratings
            const winner = (await cardRepository.findOne({ where: { type: winnerId === card1Id ? card1.type : card2.type } }));
            const loser = (await cardRepository.findOne({ where: { type: winnerId === card1Id ? card2.type : card1.type } }));
            const { winnerNewRating, loserNewRating } = new elo_service_1.EloService().calculateNewRatings(winner.rating, loser.rating);
            // Update winner stats
            winner.rating = winnerNewRating;
            winner.wins += 1;
            await cardRepository.save(winner);
            // Update loser stats
            loser.rating = loserNewRating;
            loser.losses += 1;
            await cardRepository.save(loser);
            // Give the voter some coins as a reward
            if (req.user) {
                const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
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
        }
        catch (error) {
            console.error('Vote battle error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Get battle history
    async getBattleHistory(req, res) {
        try {
            const battleRepository = (0, typeorm_1.getRepository)(battle_model_1.Battle);
            const battles = await battleRepository.find({
                relations: ['card1', 'card2', 'voter'],
                order: { battleDate: 'DESC' },
                take: 50, // Limit to the most recent 50 battles
            });
            res.status(200).json({ battles });
        }
        catch (error) {
            console.error('Get battle history error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    // Get top ranked cards
    async getTopRankedCards(req, res) {
        try {
            const cardRepository = (0, typeorm_1.getRepository)(card_model_1.Card);
            const seasonRepository = (0, typeorm_1.getRepository)(season_model_1.Season);
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
        }
        catch (error) {
            console.error('Get season leaderboard error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.BattleController = BattleController;
