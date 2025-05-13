import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Teacher } from '../models/teacher.model';
import { Quote } from '../models/quote.model';
import { Subject } from '../models/subject.model';
import { Season } from '../models/season.model';
import { Card } from '../models/card.model';
import { User } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { DealtCard } from '../models/dealt_card.model';
import { Battle } from '../models/battle.model';
import { Pack } from '../models/pack.model';

export class AdminController {
  // TEACHER OPERATIONS
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

  async getAllTeachers(req: Request, res: Response) {
    try {
      const teacherRepository = getRepository(Teacher);
      const teachers = await teacherRepository.find({
        relations: ['subjects', 'quotes']
      });

      res.status(200).json({ teachers });
    } catch (error) {
      console.error('Get all teachers error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getTeacherById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacherRepository = getRepository(Teacher);

      const teacher = await teacherRepository.findOne({
        where: { id },
        relations: ['subjects', 'quotes']
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      res.status(200).json({ teacher });
    } catch (error) {
      console.error('Get teacher by id error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Teacher name is required' });
      }

      const teacherRepository = getRepository(Teacher);
      const teacher = await teacherRepository.findOneBy({ id });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      teacher.name = name;
      await teacherRepository.save(teacher);

      res.status(200).json({
        message: 'Teacher updated successfully',
        teacher
      });
    } catch (error) {
      console.error('Update teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteTeacher(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacherRepository = getRepository(Teacher);
      const quoteRepository = getRepository(Quote);

      // First check if teacher exists
      const teacher = await teacherRepository.findOne({
        where: { id },
        relations: ['quotes']
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Delete all quotes associated with this teacher
      if (teacher.quotes && teacher.quotes.length > 0) {
        await quoteRepository.remove(teacher.quotes);
      }

      // Now delete the teacher
      await teacherRepository.remove(teacher);

      res.status(200).json({
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      console.error('Delete teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // QUOTE OPERATIONS
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

  async getQuotes(req: Request, res: Response) {
    try {
      const quoteRepository = getRepository(Quote);
      const quotes = await quoteRepository.find({
        relations: ['teacher']
      });

      res.status(200).json({ quotes });
    } catch (error) {
      console.error('Get quotes error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getQuoteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quoteRepository = getRepository(Quote);

      const quote = await quoteRepository.findOne({
        where: { id },
        relations: ['teacher']
      });

      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }

      res.status(200).json({ quote });
    } catch (error) {
      console.error('Get quote by id error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: 'Quote text is required' });
      }

      const quoteRepository = getRepository(Quote);
      const quote = await quoteRepository.findOneBy({ id });

      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }

      quote.text = text;
      await quoteRepository.save(quote);

      res.status(200).json({
        message: 'Quote updated successfully',
        quote
      });
    } catch (error) {
      console.error('Update quote error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quoteRepository = getRepository(Quote);

      const quote = await quoteRepository.findOneBy({ id });

      if (!quote) {
        return res.status(404).json({ message: 'Quote not found' });
      }

      await quoteRepository.remove(quote);

      res.status(200).json({
        message: 'Quote deleted successfully'
      });
    } catch (error) {
      console.error('Delete quote error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // SUBJECT OPERATIONS
  async createSubject(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Subject name is required' });
      }

      const subjectRepository = getRepository(Subject);

      // Check if subject with this name already exists
      const existingSubject = await subjectRepository.findOne({ where: { name } });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this name already exists' });
      }

      // Create new subject
      const subject = subjectRepository.create({ name });
      await subjectRepository.save(subject);

      res.status(201).json({
        message: 'Subject created successfully',
        subject
      });
    } catch (error) {
      console.error('Create subject error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAllSubjects(req: Request, res: Response) {
    try {
      const subjectRepository = getRepository(Subject);
      const subjects = await subjectRepository.find();

      res.status(200).json({ subjects });
    } catch (error) {
      console.error('Get all subjects error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getSubjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subjectRepository = getRepository(Subject);

      const subject = await subjectRepository.findOneBy({ id });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.status(200).json({ subject });
    } catch (error) {
      console.error('Get subject by id error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Subject name is required' });
      }

      const subjectRepository = getRepository(Subject);
      const subject = await subjectRepository.findOneBy({ id });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      // Check if another subject with the new name already exists
      const existingSubject = await subjectRepository.findOne({ where: { name } });
      if (existingSubject && existingSubject.id !== id) {
        return res.status(400).json({ message: 'Another subject with this name already exists' });
      }

      subject.name = name;
      await subjectRepository.save(subject);

      res.status(200).json({
        message: 'Subject updated successfully',
        subject
      });
    } catch (error) {
      console.error('Update subject error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subjectRepository = getRepository(Subject);

      const subject = await subjectRepository.findOneBy({ id });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      await subjectRepository.remove(subject);

      res.status(200).json({
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      console.error('Delete subject error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // TEACHER-SUBJECT RELATIONSHIP OPERATIONS
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

      // Filter out subjects that are already associated with the teacher
      const newSubjects = subjectsToAdd.filter(subject =>
        !teacher.subjects.some(existingSubject => existingSubject.id === subject.id)
      );

      teacher.subjects = [...teacher.subjects, ...newSubjects];
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

  async removeSubjectFromTeacher(req: Request, res: Response) {
    try {
      const { teacherId, subjectId } = req.params;

      const teacherRepository = getRepository(Teacher);

      const teacher = await teacherRepository.findOne({
        where: { id: teacherId },
        relations: ['subjects']
      });

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      if (!teacher.subjects) {
        return res.status(404).json({ message: 'Teacher has no subjects' });
      }

      // Filter out the subject to remove
      const initialSubjectsCount = teacher.subjects.length;
      teacher.subjects = teacher.subjects.filter(subject => subject.id !== subjectId);

      // Check if any subject was actually removed
      if (teacher.subjects.length === initialSubjectsCount) {
        return res.status(404).json({ message: 'Subject not found for this teacher' });
      }

      await teacherRepository.save(teacher);

      res.status(200).json({
        message: 'Subject removed from teacher successfully',
        teacher
      });
    } catch (error) {
      console.error('Remove subject from teacher error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // SEASON OPERATIONS
  async createSeason(req: Request, res: Response) {
    try {
      const { name, startDate, endDate, isActive = true } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Season name is required' });
      }

      const seasonRepository = getRepository(Season);

      // If new season is active, set all other seasons to inactive
      if (isActive) {
        await seasonRepository
          .createQueryBuilder()
          .update(Season)
          .set({ isActive: false })
          .where("isActive = :isActive", { isActive: true })
          .execute();
      }

      // Create new season
      const season = seasonRepository.create({
        name,
        startDate: startDate || new Date(),
        endDate: endDate || new Date(new Date().setDate(new Date().getDate() + 30)),
        isActive
      });

      await seasonRepository.save(season);

      res.status(201).json({
        message: 'Season created successfully',
        season
      });
    } catch (error) {
      console.error('Create season error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateSeason(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, startDate, endDate, isActive } = req.body;

      const seasonRepository = getRepository(Season);

      const season = await seasonRepository.findOneBy({ id: Number(id) });

      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }

      // Update season properties if provided
      if (name) season.name = name;
      if (startDate) season.startDate = new Date(startDate);
      if (endDate) season.endDate = new Date(endDate);

      // Only update isActive if it's explicitly provided
      if (isActive !== undefined) {
        // If setting this season to active, deactivate others
        if (isActive === true) {
          await seasonRepository
            .createQueryBuilder()
            .update(Season)
            .set({ isActive: false })
            .where("id != :id", { id: Number(id) })
            .execute();
        }
        season.isActive = isActive;
      }

      await seasonRepository.save(season);

      res.status(200).json({
        message: 'Season updated successfully',
        season
      });
    } catch (error) {
      console.error('Update season error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteSeason(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const seasonRepository = getRepository(Season);
      const cardRepository = getRepository(Card);

      // Check if season exists
      const season = await seasonRepository.findOneBy({ id: Number(id) });

      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }

      // Check if this is the only active season
      if (season.isActive) {
        const seasonCount = await seasonRepository.count();
        if (seasonCount <= 1) {
          return res.status(400).json({
            message: 'Cannot delete the only season. Create another season before deleting this one.'
          });
        }
      }

      // Delete associated cards first
      await cardRepository
        .createQueryBuilder()
        .delete()
        .from(Card)
        .where("seasonId = :seasonId", { seasonId: Number(id) })
        .execute();

      // Now delete the season
      await seasonRepository.remove(season);

      res.status(200).json({
        message: 'Season deleted successfully'
      });
    } catch (error) {
      console.error('Delete season error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // CARD OPERATIONS
  async generateCards(req: Request, res: Response) {
    try {
      const { seasonId } = req.params;

      const teacherRepository = getRepository(Teacher);
      const seasonRepository = getRepository(Season);
      const cardRepository = getRepository(Card);

      // Verify season exists
      const season = await seasonRepository.findOneBy({ id: Number(seasonId) });
      if (!season) {
        return res.status(404).json({ message: 'Season not found' });
      }

      const teachers = await teacherRepository.find({
        relations: ['subjects', 'quotes'],
      });

      if (teachers.length === 0) {
        return res.status(404).json({ message: 'No teachers found to generate cards' });
      }

      const generatedCards = [];

      for (const teacher of teachers) {
        if (teacher.subjects && teacher.subjects.length > 0) {
          for (const subject of teacher.subjects) {
            let randomQuote: Quote | null = null;
            if (teacher.quotes && teacher.quotes.length > 0) {
              const randomIndex = Math.floor(Math.random() * teacher.quotes.length);
              randomQuote = teacher.quotes[randomIndex];
            }

            let card = new Card();
            card.teacherName = teacher.name;
            card.subject = subject.name;
            card.quote = randomQuote?.text || 'No quote available';
            card.season = season;

            await cardRepository.save(card);
            generatedCards.push(card);
          }
        }
      }

      res.status(201).json({
        message: `${generatedCards.length} cards generated successfully for season ${season.name}`,
        cardsCount: generatedCards.length
      });
    } catch (error) {
      console.error('Generate cards error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getCardsBySeasonId(req: Request, res: Response) {
    try {
      const { seasonId } = req.params;

      const cardRepository = getRepository(Card);

      const cards = await cardRepository.find({
        where: {
          season: { id: Number(seasonId) }
        }
      });

      res.status(200).json({ cards });
    } catch (error) {
      console.error('Get cards by season ID error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cardRepository = getRepository(Card);

      const card = await cardRepository.findOneBy({ type: id });

      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      await cardRepository.remove(card);

      res.status(200).json({
        message: 'Card deleted successfully'
      });
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async resetUserPassword(req: Request, res: Response) {
    try {
      const { username, newPassword } = req.body;

      if (!username || !newPassword) {
        return res.status(400).json({ message: 'Username and new password are required' });
      }

      const userRepository = getRepository(User);

      const user = await userRepository.findOne({ where: { username } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);


      user.password = hashedPassword;
      await userRepository.save(user);

      res.status(200).json({
        message: 'Password reset successfully',
        username: user.username
      });
    } catch (error) {
      console.error('Reset user password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const userRepository = getRepository(User);

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this username already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = userRepository.create({
        username,
        password: hashedPassword,
        coins: 0,
        rating: 0
      });

      await userRepository.save(user);

      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const userRepository = getRepository(User);
      const users = await userRepository.find({
        select: ['id', 'username', 'coins', 'rating', 'createdAt', 'updatedAt', 'lastPackClaim']
      });

      res.status(200).json({ users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = getRepository(User);

      const user = await userRepository.findOne({
        where: { id },
        select: ['id', 'username', 'coins', 'rating', 'createdAt', 'updatedAt', 'lastPackClaim'],
        relations: ['cards']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('Get user by id error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, coins, rating } = req.body;

      const userRepository = getRepository(User);
      const user = await userRepository.findOneBy({ id });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if username is being updated and if it already exists
      if (username && username !== user.username) {
        const existingUser = await userRepository.findOne({ where: { username } });
        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }
        user.username = username;
      }

      // Update other fields if provided
      if (coins !== undefined) user.coins = coins;
      if (rating !== undefined) user.rating = rating;

      await userRepository.save(user);


      // Don't return the password in the response
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: 'User updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = getRepository(User);
      const dealtCardRepository = getRepository(DealtCard);
      const battleRepository = getRepository(Battle);
      const packRepository = getRepository(Pack);


      // Find user
      const user = await userRepository.findOne({
        where: { id },
        relations: ['cards']
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete associated dealt cards first (if any)
      if (user.cards && user.cards.length > 0) {
        await dealtCardRepository.remove(user.cards);
      }


      // Delete the user
      await userRepository.remove(user);

      res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
