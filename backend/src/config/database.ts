import { ConnectionOptions } from 'typeorm';
import { User } from '../models/user.model';
import { Card } from '../models/card.model';
import { DealtCard } from '../models/dealt_card.model'; // Add this import
import { Battle } from '../models/battle.model';
import { Season } from '../models/season.model';
import { Pack } from '../models/pack.model';
import { Trade } from '../models/trade.model';

export const dbConfig: ConnectionOptions = {
  type: 'sqlite',
  database: './db/teacher-card-game.sqlite',
  entities: [User, Card, DealtCard, Battle, Season, Pack, Trade], // Add DealtCard here
  synchronize: true, // Set to false in production
  logging: true
};
