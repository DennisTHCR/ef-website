import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DealtCard } from './dealt_card.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  coins: number;

  @Column({ default: 0 })
  rating: number;

  @OneToMany(() => DealtCard, card => card.owner)
  cards: DealtCard[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: () => "datetime('now')" })
  lastPackClaim: Date;
}
