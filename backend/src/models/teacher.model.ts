import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => String)
  quote: String;

  @OneToMany(() => String)
  name: String;

  @CreateDateColumn()
  createdAt: Date;
}
