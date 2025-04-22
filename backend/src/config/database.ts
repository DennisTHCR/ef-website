import { ConnectionOptions } from 'typeorm';
import { User } from '../models/user.model';
import { Card } from '../models/card.model';
import { Battle } from '../models/battle.model';
import { Season } from '../models/season.model';
import { Pack } from '../models/pack.model';
import { Trade } from '../models/trade.model';

export const dbConfig: ConnectionOptions = {
  type: 'sqlite',
  database: './db/teacher-card-game.sqlite',
  entities: [User, Card, Battle, Season, Pack, Trade],
  synchronize: true, // Set to false in production
  logging: true
};
