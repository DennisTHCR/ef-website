import { Entity, Column } from 'typeorm';
import { User } from './user.model';

@Entity('dealt_cards')
export class DealtCard {
  @Column()
  type: string;
  @Column()
  owner: User;
}
