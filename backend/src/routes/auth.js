const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { dbOperations } = require('../database');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// POST /mock-login - 模拟登录（无需JWT认证）
router.post('/mock-login', async (req, res) => {
  try {
    const { openid, nickname, avatar } = req.body;
    
    if (!openid) {
      return res.status(400).json({
        success: false,
        message: '缺少 openid 参数'
      });
    }

    // 查找或创建用户
    let user = await dbOperations.getUserByOpenid(openid);
    
    if (!user) {
      const userId = uuidv4();
      await dbOperations.createUser(
        userId,
        openid,
        nickname || `用户${openid.slice(-6)}`,
        avatar || null,
        'user'
      );
      user = await dbOperations.getUserById(userId);
    }

    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Mock login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败',
      error: error.message
    });
  }
});

// GET /me - 获取当前用户信息（需要JWT认证）
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbOperations.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

// PUT /profile - 更新当前用户信息（需要JWT认证）
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    
    await dbOperations.updateUser(nickname, avatar, req.user.id);
    
    const updatedUser = await dbOperations.getUserById(req.user.id);
    
    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        openid: updatedUser.openid,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
      error: error.message
    });
  }
});

module.exports = router;
