import express from 'express';
import { AdminController } from '../controllers/admin.controller';
import { SeasonController } from '../controllers/season.controller';

const router = express.Router();
const adminController = new AdminController();

// Use middleware for authentication instead of defining it in the controller
const authenticate = (req: any, res: any, next: any) => {
  const adminPassword = req.headers['admin-password'];

  if (!adminPassword || adminPassword !== "alanleyel") {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  next();
};

// Define routes explicitly with the admin controller's methods
router.post('/teachers', authenticate, (req, res) => adminController.createTeacher(req, res));
router.post('/teachers/:id/quotes', authenticate, (req, res) => adminController.addQuoteToTeacher(req, res));
router.post('/teachers/:id/subjects', authenticate, (req, res) => adminController.addSubjectToTeacher(req, res));
router.post('/seasons', authenticate, (req, res) => {
  const seasonController = new SeasonController();
  return seasonController.startNewSeason(req, res);
});

export default router;
