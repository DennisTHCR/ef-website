"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const typeorm_1 = require("typeorm");
const season_model_1 = require("../models/season.model");
const initializeDatabase = async () => {
    try {
        // Check if we have any seasons, if not create the first one
        const seasonRepository = (0, typeorm_1.getRepository)(season_model_1.Season);
        const seasonsCount = await seasonRepository.count();
        if (seasonsCount === 0) {
            // Create the first season
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7); // Season lasts 7 days
            const firstSeason = seasonRepository.create({
                name: 'Season 1',
                startDate: now,
                endDate,
                isActive: true,
            });
            await seasonRepository.save(firstSeason);
            console.log('First season created successfully');
        }
    }
    catch (error) {
        console.error('Database initialization error:', error);
    }
};
exports.initializeDatabase = initializeDatabase;
