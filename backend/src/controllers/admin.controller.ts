import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Teacher } from '../models/teacher.model';
import { Quote } from '../models/quote.model';
import { Subject } from '../models/subject.model';

export class AdminController {

  async createTeacher(req: Request, res: Response) {
    try {
      const { name, subjectIds = [] } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Teacher name is required' });
      }

      const teacherRepository = getRepository(Teacher);
      const subjectRepository = getRepository(Subject);

      // Find subjects if provided
      let subjects: Subject[] = [];
      if (subjectIds.length > 0) {
        subjects = await subjectRepository.findByIds(subjectIds);
      }

      // Create new teacher
      const teacher = teacherRepository.create({
        name,
        subjects
      });

      await teacherRepository.save(teacher);

      res.status(201).json({
        message: 'Teacher created successfully',
        teacher
      });
    } catch (error) {
      console.error('Create teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async addQuoteToTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: 'Quote text is required' });
      }

      const teacherRepository = getRepository(Teacher);
      const quoteRepository = getRepository(Quote);

      // Find teacher
      const teacher = await teacherRepository.findOneBy({ id });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Create new quote
      const quote = quoteRepository.create({
        text,
        teacher
      });

      await quoteRepository.save(quote);

      res.status(201).json({
        message: 'Quote added successfully',
        quote
      });
    } catch (error) {
      console.error('Add quote error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async addSubjectToTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { subjectIds } = req.body;

      if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
        return res.status(400).json({ message: 'Subject IDs array is required' });
      }

      const teacherRepository = getRepository(Teacher);
      const subjectRepository = getRepository(Subject);

      const teacher = await teacherRepository.findOne({
        where: { id },
        relations: ['subjects']
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Find subjects
      const subjectsToAdd = await subjectRepository.findByIds(subjectIds);

      if (subjectsToAdd.length === 0) {
        return res.status(404).json({ message: 'None of the provided subject IDs were found' });
      }

      // Add new subjects to teacher's existing subjects
      if (!teacher.subjects) {
        teacher.subjects = [];
      }

      teacher.subjects = [...teacher.subjects, ...subjectsToAdd];
      await teacherRepository.save(teacher);

      res.status(200).json({
        message: 'Subjects added successfully',
        teacher
      });
    } catch (error) {
      console.error('Add subject error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
