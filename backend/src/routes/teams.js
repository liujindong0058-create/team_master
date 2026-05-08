const express = require('express');
const { createTeam, getTeams, getTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createTeam);
router.get('/', authMiddleware, getTeams);
router.get('/:id', authMiddleware, getTeam);
router.put('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);

module.exports = router;