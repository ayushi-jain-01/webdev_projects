// routes/task.route.js

import express from 'express';
import verifyToken from './verifyToken.js';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/task.controller.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Task route working ✅' });
});

router.get('/', verifyToken, getTasks);
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

router.get('/:id', verifyToken, getTask);

export default router;
