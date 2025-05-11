"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EloService = void 0;
class EloService {
    K = 32; // K-factor determines how much ratings change after each battle
    /**
     * Calculate new Elo ratings after a battle
     * @param winnerRating Current rating of the winner
     * @param loserRating Current rating of the loser
     * @returns Object containing new ratings for both cards
     */
    calculateNewRatings(winnerRating, loserRating) {
        const expectedWinnerScore = this.getExpectedScore(winnerRating, loserRating);
        const expectedLoserScore = this.getExpectedScore(loserRating, winnerRating);
        const winnerNewRating = Math.round(winnerRating + this.K * (1 - expectedWinnerScore));
        const loserNewRating = Math.round(loserRating + this.K * (0 - expectedLoserScore));
        return {
            winnerNewRating: winnerNewRating,
            loserNewRating: loserNewRating,
        };
    }
    /**
     * Calculate the expected score based on ratings
     * @param rating1 Rating of the first player
     * @param rating2 Rating of the second player
     * @returns Expected score (between 0 and 1)
     */
    getExpectedScore(rating1, rating2) {
        return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
    }
}
exports.EloService = EloService;
