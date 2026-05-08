const express = require('express');
const { createAssessment, getAssessments, getAssessment, updateAssessment } = require('../controllers/assessmentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/:memberId', authMiddleware, createAssessment);
router.get('/:memberId', authMiddleware, getAssessments);
router.get('/detail/:id', authMiddleware, getAssessment);
router.put('/:id', authMiddleware, updateAssessment);

module.exports = router;