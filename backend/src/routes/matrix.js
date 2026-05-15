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

// GET /teams/:teamId/members/:userId/matrix - 获取成员能力矩阵
router.get('/', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限查看此能力矩阵'
      });
    }

    const abilities = await dbOperations.getAbilitiesByUser(teamId, userId);
    
    // 按类别分组
    const matrix = {};
    abilities.forEach(ability => {
      if (!matrix[ability.category]) {
        matrix[ability.category] = [];
      }
      matrix[ability.category].push({
        id: ability.id,
        ability_name: ability.ability_name,
        score: ability.score,
        updated_at: ability.updated_at
      });
    });

    res.json({
      success: true,
      data: {
        user_id: userId,
        team_id: teamId,
        matrix
      }
    });
  } catch (error) {
    console.error('Get matrix error:', error);
    res.status(500).json({
      success: false,
      message: '获取能力矩阵失败',
      error: error.message
    });
  }
});

// PUT /teams/:teamId/members/:userId/matrix - 更新能力矩阵
router.put('/', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { abilities } = req.body;
    
    if (!abilities || !Array.isArray(abilities)) {
      return res.status(400).json({
        success: false,
        message: 'abilities 必须是数组'
      });
    }

    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新此能力矩阵'
      });
    }

    // 批量更新能力
    const results = [];
    for (const ability of abilities) {
      const { category, ability_name, score } = ability;
      
      if (!category || !ability_name || score === undefined) {
        continue;
      }

      // 验证分数范围
      const validScore = Math.max(0, Math.min(5, parseInt(score) || 0));
      
      const abilityId = uuidv4();
      await dbOperations.upsertAbility(
        abilityId,
        teamId,
        userId,
        category,
        ability_name,
        validScore
      );

      results.push({
        category,
        ability_name,
        score: validScore
      });
    }

    // 获取更新后的能力矩阵
    const updatedAbilities = await dbOperations.getAbilitiesByUser(teamId, userId);
    
    // 按类别分组
    const matrix = {};
    updatedAbilities.forEach(ability => {
      if (!matrix[ability.category]) {
        matrix[ability.category] = [];
      }
      matrix[ability.category].push({
        id: ability.id,
        ability_name: ability.ability_name,
        score: ability.score,
        updated_at: ability.updated_at
      });
    });

    res.json({
      success: true,
      data: {
        user_id: userId,
        team_id: teamId,
        matrix,
        updated_count: results.length
      }
    });
  } catch (error) {
    console.error('Update matrix error:', error);
    res.status(500).json({
      success: false,
      message: '更新能力矩阵失败',
      error: error.message
    });
  }
});

module.exports = router;
