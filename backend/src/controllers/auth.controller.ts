import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { Pack } from '../models/pack.model';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const userRepository = getRepository(User);
      const existingUser = await userRepository.findOne({ where: { username } });

      if (existingUser) {
        res.status(400).json({ message: 'Username already exists' });
        return;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = userRepository.create({
        username,
        password: hashedPassword,
        lastPackClaim: new Date(new Date().setDate(new Date().getDate() - 1)),
      });

      await userRepository.save(user);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          coins: user.coins,
          rating: user.rating,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { username } });

      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          coins: user.coins,
          rating: user.rating,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRepository = getRepository(User);
      const packRepository = getRepository(Pack);
      const user = await userRepository.findOne({
        where: { id: req.user?.id },
        relations: ['cards'],
      });
      const packs = await packRepository.find({
        where: { owner: user }
      })

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          coins: user.coins,
          rating: user.rating,
          cards: user.cards,
          lastPackClaim: user.lastPackClaim,
          packs: packs,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
