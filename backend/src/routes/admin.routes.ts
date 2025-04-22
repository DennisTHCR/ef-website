import express from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = express.Router();
const adminController = new AdminController();

router.post('admin', adminController.router);

export default router;
