import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Season } from './season.model';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  type: string;

  @Column()
  teacherName: string;

  @Column()
  subject: string;

  @Column()
  quote: string;

  @Column({ default: 1000 }) // Starting Elo rating
  rating: number;

  @Column({ default: 1 })
  level: number;

  @ManyToOne(() => Season, { onDelete: "CASCADE" })
  season: Season;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;
}
