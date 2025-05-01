import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.model';

@Entity('dealt_cards')
export class DealtCard {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  type: string;
  @ManyToOne(() => User)
  owner: User;
  @Column({ default: 1 })
  level: number;
}
