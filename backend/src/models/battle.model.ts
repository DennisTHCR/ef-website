import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Card } from './card.model';
import { User } from './user.model';

@Entity('battles')
export class Battle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Card)
  card1!: Card;

  @ManyToOne(() => Card)
  card2!: Card;

  @ManyToOne(() => User)
  voter!: User;

  @Column()
  winnerId!: string;

  @CreateDateColumn()
  battleDate!: Date;
}
