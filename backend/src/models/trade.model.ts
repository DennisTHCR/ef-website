import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { Card } from './card.model';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  offeredBy: User;

  @ManyToOne(() => User)
  offeredTo: User | null;

  @ManyToOne(() => Card)
  offeredCard: Card;

  @ManyToOne(() => Card)
  requestedCard: Card | null;

  @Column({ default: 0 })
  askingPrice: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'canceled';

  @CreateDateColumn()
  createdAt: Date;
}
