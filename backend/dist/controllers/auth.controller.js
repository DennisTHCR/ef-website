"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const typeorm_1 = require("typeorm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const pack_model_1 = require("../models/pack.model");
class AuthController {
    async register(req, res) {
        try {
            const { username, password } = req.body;
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            const existingUser = await userRepository.findOne({ where: { username } });
            if (existingUser) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
            // Hash the password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Create new user
            const user = userRepository.create({
                username,
                password: hashedPassword,
                lastPackClaim: new Date(new Date().setDate(new Date().getDate() - 1)),
            });
            await userRepository.save(user);
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
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
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            const user = await userRepository.findOne({ where: { username } });
            if (!user) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            // Verify password
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
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
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    async getProfile(req, res) {
        try {
            const userRepository = (0, typeorm_1.getRepository)(user_model_1.User);
            const packRepository = (0, typeorm_1.getRepository)(pack_model_1.Pack);
            const user = await userRepository.findOne({
                where: { id: req.user?.id },
                relations: ['cards'],
            });
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const packs = await packRepository.find({
                where: { owner: { id: user.id } }
            });
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
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
}
exports.AuthController = AuthController;
