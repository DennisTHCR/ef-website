import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('packs')
export class Pack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seasonId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @Column({ default: false })
  isOpened: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
