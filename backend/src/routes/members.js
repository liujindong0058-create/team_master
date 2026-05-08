const express = require('express');
const { addMember, getMembers, getMember, updateMember, deleteMember } = require('../controllers/memberController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/:teamId/members', authMiddleware, addMember);
router.get('/:teamId/members', authMiddleware, getMembers);
router.get('/:id', authMiddleware, getMember);
router.put('/:id', authMiddleware, updateMember);
router.delete('/:id', authMiddleware, deleteMember);

module.exports = router;