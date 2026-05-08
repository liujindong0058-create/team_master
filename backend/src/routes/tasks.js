const express = require('express');
const { createTask, getTasks, getTask, updateTask, deleteTask, recommendMembers } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/:teamId', authMiddleware, createTask);
router.get('/:teamId', authMiddleware, getTasks);
router.get('/detail/:id', authMiddleware, getTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.post('/:teamId/recommend', authMiddleware, recommendMembers);

module.exports = router;