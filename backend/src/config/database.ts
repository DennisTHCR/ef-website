import { ConnectionOptions } from 'typeorm';
import { User } from '../models/user.model';
import { Card } from '../models/card.model';
import { DealtCard } from '../models/dealt_card.model';
import { Battle } from '../models/battle.model';
import { Season } from '../models/season.model';
import { Pack } from '../models/pack.model';
import { Trade } from '../models/trade.model';
import { Quote } from '../models/quote.model';
import { Subject } from '../models/subject.model';
import { Teacher } from '../models/teacher.model';

export const dbConfig: ConnectionOptions = {
  type: 'sqlite',
  database: './db/teacher-card-game.sqlite',
  entities: [User, Card, DealtCard, Battle, Season, Pack, Trade, Quote, Subject, Teacher],
  synchronize: true,
  logging: true,
  migrations: ["src/migrations/**/*.ts"],
};
