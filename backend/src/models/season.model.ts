import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Card } from './card.model';

@Entity('seasons')
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Card, card => card.season, { onDelete: "CASCADE" })
  cards: Card[];
}
