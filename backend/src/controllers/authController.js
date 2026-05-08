const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { User, Team, Member } = require('../models');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = User.create({
      name,
      email,
      password: hashedPassword,
      role: 'manager'
    });
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    const defaultTeam = Team.create({
      name: `${name}的团队`,
      description: '这是您的默认团队',
      ownerId: user.id
    });
    
    Member.create({
      teamId: defaultTeam.id,
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
      teamId: defaultTeam.id,
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
      teamId: defaultTeam.id,
      name: '王五',
      position: '初级工程师',
      joinDate: new Date(),
      status: 'active',
      strengths: '学习能力强, 积极主动',
      weaknesses: '技术深度不足',
      tags: '前端, 新人, 潜力新星',
      futureDirection: '中级工程师'
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getCurrentUser = (req, res) => {
  res.status(200).json({
    user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
};

module.exports = { register, login, getCurrentUser };