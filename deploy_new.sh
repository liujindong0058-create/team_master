#!/bin/bash
set -e

echo "=== 团队管理平台全新部署 ==="

APP_DIR="/home/ubuntu/team_master_new"
rm -rf $APP_DIR
mkdir -p $APP_DIR
cd $APP_DIR

# ==================== 后端 ====================
echo "创建后端项目..."
mkdir -p backend/src/{routes,middleware} backend/data backend/uploads

# package.json
cat > backend/package.json << 'EOF'
{
  "name": "team-master-backend",
  "version": "2.0.0",
  "description": "团队管理平台 - 后端服务",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOF

# .env
cat > backend/.env << 'EOF'
PORT=3000
JWT_SECRET=team_master_secret_key_2024_production
NODE_ENV=production
EOF

# database.js
cat > backend/src/database.js << 'EOF'
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'team_master.db'));

// 初始化表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    openid TEXT UNIQUE NOT NULL,
    nickname TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS member_profiles (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    first_impression TEXT,
    notes TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    evaluator_id TEXT REFERENCES users(id),
    target_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    scores TEXT NOT NULL,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ability_matrix (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    ability_name TEXT NOT NULL,
    score INTEGER DEFAULT 0 CHECK(score >= 0 AND score <= 5),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id, ability_name)
  );

  CREATE TABLE IF NOT EXISTS note_attachments (
    id TEXT PRIMARY KEY,
    profile_id TEXT REFERENCES member_profiles(id) ON DELETE CASCADE,
    note_index INTEGER,
    file_path TEXT,
    file_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 初始化示例数据
const initData = () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const userId = uuidv4();
    db.prepare('INSERT INTO users (id, openid, nickname, avatar, role) VALUES (?, ?, ?, ?, ?)')
      .run(userId, 'admin_default', '管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin');
    
    const teamId = uuidv4();
    db.prepare('INSERT INTO teams (id, name, description, owner_id) VALUES (?, ?, ?, ?)')
      .run(teamId, '示例团队', '这是一个示例团队，用于演示功能', userId);
    
    db.prepare('INSERT INTO team_members (id, team_id, user_id, role) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), teamId, userId, 'leader');
    
    db.prepare('INSERT INTO member_profiles (id, team_id, user_id, first_impression) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), teamId, userId, '团队负责人，经验丰富');
    
    // 添加示例成员
    const memberId = uuidv4();
    db.prepare('INSERT INTO users (id, openid, nickname, avatar) VALUES (?, ?, ?, ?)')
      .run(memberId, 'member_' + Date.now(), '张三', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan');
    
    db.prepare('INSERT INTO team_members (id, team_id, user_id, role) VALUES (?, ?, ?, ?)')
      .run(uuidv4(), teamId, memberId, 'member');
    
    db.prepare('INSERT INTO member_profiles (id, team_id, user_id, first_impression, notes) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), teamId, memberId, '工作认真负责，学习能力强', JSON.stringify([
        { id: uuidv4(), content: '完成了项目A的核心功能开发', createdAt: new Date().toISOString() },
        { id: uuidv4(), content: '在团队分享会上做了技术分享', createdAt: new Date().toISOString() }
      ]));
    
    // 初始化能力矩阵
    const abilities = ['技术能力', '沟通能力', '领导力', '执行力', '学习能力'];
    abilities.forEach(ability => {
      db.prepare('INSERT INTO ability_matrix (id, team_id, user_id, category, ability_name, score) VALUES (?, ?, ?, ?, ?, ?)')
        .run(uuidv4(), teamId, memberId, '核心能力', ability, Math.floor(Math.random() * 3) + 3);
    });
    
    console.log('示例数据初始化完成');
  }
};

initData();

module.exports = db;
EOF

# auth middleware
cat > backend/src/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '令牌无效' });
  }
};

module.exports = authMiddleware;
EOF

# auth routes
cat > backend/src/routes/auth.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const authMiddleware = require('../