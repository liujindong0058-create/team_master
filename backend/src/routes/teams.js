const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbOperations } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有路由都需要JWT认证
router.use(authenticateToken);

// GET /teams - 获取当前用户的所有团队
router.get('/', async (req, res) => {
  try {
    const teams = await dbOperations.getTeamsByUserId(req.user.id);
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: '获取团队列表失败',
      error: error.message
    });
  }
});

// POST /teams - 创建新团队
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: '团队名称不能为空'
      });
    }

    const teamId = uuidv4();
    
    // 创建团队
    await dbOperations.createTeam(teamId, name, description || null, req.user.id);
    
    // 创建者自动成为团队成员（owner角色）
    const memberId = uuidv4();
    await dbOperations.addTeamMember(memberId, teamId, req.user.id, 'owner');
    
    // 创建成员档案
    const profileId = uuidv4();
    await dbOperations.createProfile(profileId, teamId, req.user.id, null, '[]');
    
    const team = await dbOperations.getTeamById(teamId);
    
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: '创建团队失败',
      error: error.message
    });
  }
});

// PUT /teams/:id - 更新团队信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const team = await dbOperations.getTeamById(id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: '团队不存在'
      });
    }

    // 检查权限（只有团队所有者可以修改）
    if (team.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限修改此团队'
      });
    }

    await dbOperations.updateTeam(name || team.name, description, id);
    
    const updatedTeam = await dbOperations.getTeamById(id);
    
    res.json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: '更新团队失败',
      error: error.message
    });
  }
});

// DELETE /teams/:id - 删除团队
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await dbOperations.getTeamById(id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: '团队不存在'
      });
    }

    // 检查权限（只有团队所有者可以删除）
    if (team.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此团队'
      });
    }

    await dbOperations.deleteTeam(id);
    
    res.json({
      success: true,
      message: '团队已删除'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: '删除团队失败',
      error: error.message
    });
  }
});

module.exports = router;
