import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.model';
import { Season } from './season.model';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => User, user => user.cards)
  owner: User;

  @ManyToOne(() => Season)
  season: Season;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  losses: number;
}
