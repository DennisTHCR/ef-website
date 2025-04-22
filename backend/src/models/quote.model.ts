import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from "./teacher.model";

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  text: string;

  @ManyToOne(() => Teacher, teacher => teacher.quotes)
  teacher: Teacher;

  @CreateDateColumn()
  createdAt: Date;
}
