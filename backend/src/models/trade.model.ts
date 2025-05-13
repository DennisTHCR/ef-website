import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';
import { DealtCard } from './dealt_card.model';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  offeredBy: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  offeredTo: User | null;

  @ManyToOne(() => DealtCard)
  offeredCard: DealtCard;

  @ManyToOne(() => DealtCard)
  requestedCard: DealtCard | null;

  @Column({ default: 0 })
  askingPrice: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'canceled';

  @CreateDateColumn()
  createdAt: Date;
}
