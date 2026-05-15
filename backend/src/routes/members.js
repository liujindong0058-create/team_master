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

// 检查用户是否是团队所有者或管理员
async function isTeamAdmin(teamId, userId) {
  const team = await dbOperations.getTeamById(teamId);
  if (team && team.owner_id === userId) return true;
  
  const member = await dbOperations.getTeamMember(teamId, userId);
  return member && (member.role === 'admin' || member.role === 'owner');
}

// GET /teams/:teamId/members - 获取团队成员列表
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限查看此团队成员'
      });
    }

    const members = await dbOperations.getTeamMembers(teamId);
    
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: '获取成员列表失败',
      error: error.message
    });
  }
});

// POST /teams/:teamId/members - 添加团队成员
router.post('/', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role = 'member' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: '缺少用户ID'
      });
    }

    // 检查权限
    if (!(await isTeamAdmin(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限添加成员'
      });
    }

    // 检查用户是否已经是成员
    const existingMember = await dbOperations.getTeamMember(teamId, userId);
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: '该用户已经是团队成员'
      });
    }

    const memberId = uuidv4();
    await dbOperations.addTeamMember(memberId, teamId, userId, role);
    
    // 创建成员档案
    const profileId = uuidv4();
    await dbOperations.createProfile(profileId, teamId, userId, null, '[]');
    
    const member = await dbOperations.getTeamMember(teamId, userId);
    
    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: '添加成员失败',
      error: error.message
    });
  }
});

// PUT /teams/:teamId/members/:userId/role - 修改成员角色
router.put('/:userId/role', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: '缺少角色参数'
      });
    }

    // 检查权限
    if (!(await isTeamAdmin(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限修改成员角色'
      });
    }

    // 不能修改自己的角色（避免失去管理员权限）
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的角色'
      });
    }

    const member = await dbOperations.getTeamMember(teamId, userId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    await dbOperations.updateMemberRole(role, teamId, userId);
    
    const updatedMember = await dbOperations.getTeamMember(teamId, userId);
    
    res.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: '修改成员角色失败',
      error: error.message
    });
  }
});

// DELETE /teams/:teamId/members/:userId - 移除团队成员
router.delete('/:userId', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    // 检查权限（管理员可以移除其他成员，用户可以主动退出）
    const isAdmin = await isTeamAdmin(teamId, req.user.id);
    const isSelf = userId === req.user.id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: '没有权限移除此成员'
      });
    }

    // 不能移除团队所有者
    const team = await dbOperations.getTeamById(teamId);
    if (team && team.owner_id === userId) {
      return res.status(400).json({
        success: false,
        message: '不能移除团队所有者'
      });
    }

    const member = await dbOperations.getTeamMember(teamId, userId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    await dbOperations.removeTeamMember(teamId, userId);
    
    res.json({
      success: true,
      message: '成员已移除'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: '移除成员失败',
      error: error.message
    });
  }
});

module.exports = router;
