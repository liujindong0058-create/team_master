const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbOperations } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// 所有路由都需要JWT认证
router.use(authenticateToken);

// 检查用户是否是团队成员
async function isTeamMember(teamId, userId) {
  const member = await dbOperations.getTeamMember(teamId, userId);
  return !!member;
}

// GET /teams/:teamId/members/:userId/assessments - 获取成员评估列表
router.get('/', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限查看此评估'
      });
    }

    const assessments = await dbOperations.getAssessments(teamId, userId);
    
    // 解析 scores JSON
    const parsedAssessments = assessments.map(assessment => ({
      ...assessment,
      scores: JSON.parse(assessment.scores || '{}')
    }));

    res.json({
      success: true,
      data: parsedAssessments
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      success: false,
      message: '获取评估列表失败',
      error: error.message
    });
  }
});

// POST /teams/:teamId/members/:userId/assessments - 创建评估
router.post('/', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { period, scores, summary } = req.body;
    
    if (!period) {
      return res.status(400).json({
        success: false,
        message: '评估周期不能为空'
      });
    }

    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限创建评估'
      });
    }

    const assessmentId = uuidv4();
    await dbOperations.createAssessment(
      assessmentId,
      teamId,
      req.user.id,
      userId,
      period,
      JSON.stringify(scores || {}),
      summary || null
    );

    const assessment = await dbOperations.getAssessmentById(assessmentId);
    
    res.status(201).json({
      success: true,
      data: {
        ...assessment,
        scores: JSON.parse(assessment.scores || '{}')
      }
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      success: false,
      message: '创建评估失败',
      error: error.message
    });
  }
});

// PUT /teams/:teamId/members/:userId/assessments/:id - 更新评估
router.put('/:id', async (req, res) => {
  try {
    const { teamId, userId, id } = req.params;
    const { period, scores, summary } = req.body;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新此评估'
      });
    }

    const assessment = await dbOperations.getAssessmentById(id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: '评估不存在'
      });
    }

    // 只能更新自己创建的评估
    if (assessment.evaluator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只能更新自己创建的评估'
      });
    }

    await dbOperations.updateAssessment(
      period || assessment.period,
      JSON.stringify(scores || JSON.parse(assessment.scores || '{}')),
      summary !== undefined ? summary : assessment.summary,
      id
    );

    const updatedAssessment = await dbOperations.getAssessmentById(id);
    
    res.json({
      success: true,
      data: {
        ...updatedAssessment,
        scores: JSON.parse(updatedAssessment.scores || '{}')
      }
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: '更新评估失败',
      error: error.message
    });
  }
});

// DELETE /teams/:teamId/members/:userId/assessments/:id - 删除评估
router.delete('/:id', async (req, res) => {
  try {
    const { teamId, userId, id } = req.params;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此评估'
      });
    }

    const assessment = await dbOperations.getAssessmentById(id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: '评估不存在'
      });
    }

    // 只能删除自己创建的评估
    if (assessment.evaluator_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '只能删除自己创建的评估'
      });
    }

    await dbOperations.deleteAssessment(id);
    
    res.json({
      success: true,
      message: '评估已删除'
    });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({
      success: false,
      message: '删除评估失败',
      error: error.message
    });
  }
});

module.exports = router;
