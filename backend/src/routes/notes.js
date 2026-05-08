const express = require('express');
const { addNote, getNotes, getNote, updateNote, deleteNote, getTimeline } = require('../controllers/noteController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/:memberId', authMiddleware, addNote);
router.get('/timeline', authMiddleware, getTimeline);
router.get('/:memberId', authMiddleware, getNotes);
router.get('/note/:id', authMiddleware, getNote);
router.put('/:id', authMiddleware, updateNote);
router.delete('/:id', authMiddleware, deleteNote);

module.exports = router;