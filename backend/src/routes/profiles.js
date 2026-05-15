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

// GET /teams/:teamId/members/:userId/profile - 获取成员档案
router.get('/', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限查看此档案'
      });
    }

    let profile = await dbOperations.getProfile(teamId, userId);
    
    // 如果档案不存在，创建一个
    if (!profile) {
      const profileId = uuidv4();
      await dbOperations.createProfile(profileId, teamId, userId, null, '[]');
      profile = await dbOperations.getProfile(teamId, userId);
    }

    // 解析 notes JSON
    let notes = [];
    try {
      notes = JSON.parse(profile.notes || '[]');
    } catch (e) {
      notes = [];
    }

    // 获取附件信息
    const attachments = await dbOperations.getAttachmentsByNote(profile.id);

    res.json({
      success: true,
      data: {
        ...profile,
        notes: notes,
        attachments: attachments
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取档案失败',
      error: error.message
    });
  }
});

// PUT /teams/:teamId/members/:userId/profile - 更新成员档案
router.put('/', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { first_impression } = req.body;
    
    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限更新此档案'
      });
    }

    let profile = await dbOperations.getProfile(teamId, userId);
    
    // 如果档案不存在，创建一个
    if (!profile) {
      const profileId = uuidv4();
      await dbOperations.createProfile(profileId, teamId, userId, first_impression, '[]');
      profile = await dbOperations.getProfile(teamId, userId);
    } else {
      let notes = [];
      try {
        notes = JSON.parse(profile.notes || '[]');
      } catch (e) {
        notes = [];
      }
      await dbOperations.updateProfile(first_impression, JSON.stringify(notes), teamId, userId);
      profile = await dbOperations.getProfile(teamId, userId);
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: '更新档案失败',
      error: error.message
    });
  }
});

// POST /teams/:teamId/members/:userId/profile/notes - 添加笔记
router.post('/notes', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { content, tags = [] } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '笔记内容不能为空'
      });
    }

    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限添加笔记'
      });
    }

    let profile = await dbOperations.getProfile(teamId, userId);
    
    // 如果档案不存在，创建一个
    if (!profile) {
      const profileId = uuidv4();
      await dbOperations.createProfile(profileId, teamId, userId, null, '[]');
      profile = await dbOperations.getProfile(teamId, userId);
    }

    // 解析现有笔记
    let notes = [];
    try {
      notes = JSON.parse(profile.notes || '[]');
    } catch (e) {
      notes = [];
    }

    // 添加新笔记
    const newNote = {
      id: uuidv4(),
      content,
      tags,
      created_by: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    notes.push(newNote);

    // 更新档案
    await dbOperations.updateProfile(profile.first_impression, JSON.stringify(notes), teamId, userId);

    res.status(201).json({
      success: true,
      data: newNote
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: '添加笔记失败',
      error: error.message
    });
  }
});

// POST /teams/:teamId/members/:userId/profile/notes/:noteId/attachments - 上传附件
router.post('/notes/:noteId/attachments', async (req, res) => {
  try {
    const { teamId, userId, noteId } = req.params;
    const { file_path, file_type } = req.body;
    
    if (!file_path) {
      return res.status(400).json({
        success: false,
        message: '文件路径不能为空'
      });
    }

    // 检查用户是否是团队成员
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({
        success: false,
        message: '没有权限上传附件'
      });
    }

    let profile = await dbOperations.getProfile(teamId, userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '档案不存在'
      });
    }

    // 验证笔记是否存在
    let notes = [];
    try {
      notes = JSON.parse(profile.notes || '[]');
    } catch (e) {
      notes = [];
    }

    const note = notes.find(n => n.id === noteId);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记不存在'
      });
    }

    // 添加附件记录
    const attachmentId = uuidv4();
    await dbOperations.addAttachment(attachmentId, profile.id, noteId, file_path, file_type);

    res.status(201).json({
      success: true,
      data: {
        id: attachmentId,
        profile_id: profile.id,
        note_id: noteId,
        file_path,
        file_type
      }
    });
  } catch (error) {
    console.error('Add attachment error:', error);
    res.status(500).json({
      success: false,
      message: '添加附件失败',
      error: error.message
    });
  }
});

module.exports = router;
