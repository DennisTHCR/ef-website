import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Subject } from './subject.model';
import { Quote } from './quote.model';
@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Quote, quote => quote.teacher)
  quotes: Quote[];

  @Column()
  name: String;

  @ManyToMany(() => Subject)
  @JoinTable({
    name: "teacher_subjects",
    joinColumn: {
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "subject_id",
      referencedColumnName: "id"
    }
  })
  subjects: Subject[]

  @CreateDateColumn()
  createdAt: Date;
}
