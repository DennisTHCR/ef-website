import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.model';

@Entity('packs')
export class Pack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seasonId: number;

  @ManyToOne(() => User)
  owner: User;

  @Column({ default: false })
  isOpened: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
