import express from 'express';
import { AdminController } from '../controllers/admin.controller';

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

// Apply authentication middleware to all admin routes
router.use(authenticate);

// Teacher routes
router.post('/teachers', adminController.createTeacher);
router.get('/teachers', adminController.getAllTeachers);
router.get('/teachers/:id', adminController.getTeacherById);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Quote routes
router.post('/teachers/:id/quotes', adminController.addQuoteToTeacher);
router.get('/quotes', adminController.getQuotes);
router.get('/quotes/:id', adminController.getQuoteById);
router.put('/quotes/:id', adminController.updateQuote);
router.delete('/quotes/:id', adminController.deleteQuote);

// Subject routes
router.post('/subjects', adminController.createSubject);
router.get('/subjects', adminController.getAllSubjects);
router.get('/subjects/:id', adminController.getSubjectById);
router.put('/subjects/:id', adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Teacher-Subject relationship routes
router.post('/teachers/:id/subjects', adminController.addSubjectToTeacher);
router.delete('/teachers/:teacherId/subjects/:subjectId', adminController.removeSubjectFromTeacher);

// Season routes
router.post('/seasons', adminController.createSeason);
router.put('/seasons/:id', adminController.updateSeason);
router.delete('/seasons/:id', adminController.deleteSeason);

// Card generation routes
router.post('/seasons/:seasonId/generate-cards', adminController.generateCards);
router.get('/seasons/:seasonId/cards', adminController.getCardsBySeasonId);
router.delete('/cards/:id', adminController.deleteCard);

// User management routes
router.post('/users/reset-password', adminController.resetUserPassword);

export default router;
