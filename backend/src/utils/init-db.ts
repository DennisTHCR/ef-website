import { getConnection, getRepository } from 'typeorm';
import { Season } from '../models/season.model';

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check if we have any seasons, if not create the first one
    const seasonRepository = getRepository(Season);
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
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};
