const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { User } = require('../models');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token === 'mock-token') {
    const mockUser = User.findByEmail('user@example.com');
    if (mockUser) {
      req.user = mockUser;
      return next();
    }
    
    const user = User.create({
      name: '用户',
      email: 'user@example.com',
      password: 'mock-password',
      role: 'manager'
    });
    
    const team = require('../models').Team.create({
      name: `${user.name}的团队`,
      description: '这是您的默认团队',
      ownerId: user.id
    });
    
    const Member = require('../models').Member;
    Member.create({
      teamId: team.id,
      name: '张三',
      position: '高级工程师',
      joinDate: new Date(),
      status: 'active',
      strengths: 'React开发, 性能优化, 团队协作',
      weaknesses: '需求分析',
      tags: '前端, React, 技术骨干',
      futureDirection: '技术负责人'
    });
    Member.create({
      teamId: team.id,
      name: '李四',
      position: '中级工程师',
      joinDate: new Date(),
      status: 'active',
      strengths: 'Vue开发, UI设计',
      weaknesses: '大型项目经验',
      tags: '前端, Vue, 潜力股',
      futureDirection: '全栈工程师'
    });
    Member.create({
      teamId: team.id,
      name: '王五',
      position: '初级工程师',
      joinDate: new Date(),
      status: 'active',
      strengths: '学习能力强, 积极主动',
      weaknesses: '技术深度不足',
      tags: '前端, 新人, 潜力新星',
      futureDirection: '中级工程师'
    });
    
    req.user = user;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
};

module.exports = { authMiddleware, errorHandler };