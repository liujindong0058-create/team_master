const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// 确保数据目录存在
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'team_master.db');

let db = null;
let SQL = null;

// 初始化数据库
async function initDatabase() {
  try {
    SQL = await initSqlJs();
    
    // 尝试加载现有数据库
    if (fs.existsSync(dbPath)) {
      const filebuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(filebuffer);
      console.log('Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('Created new database');
    }

    // 创建表
    createTables();
    
    // 保存数据库
    saveDatabase();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// 保存数据库到文件
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// 创建表结构
function createTables() {
  // 用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      openid TEXT UNIQUE,
      nickname TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 团队表
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      owner_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 团队成员表
  db.run(`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, user_id)
    )
  `);

  // 成员档案表
  db.run(`
    CREATE TABLE IF NOT EXISTS member_profiles (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      first_impression TEXT,
      notes TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, user_id)
    )
  `);

  // 评估表
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      evaluator_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      period TEXT NOT NULL,
      scores TEXT DEFAULT '{}',
      summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 能力矩阵表
  db.run(`
    CREATE TABLE IF NOT EXISTS ability_matrix (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      ability_name TEXT NOT NULL,
      score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 5),
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, user_id, category, ability_name)
    )
  `);

  // 笔记附件表
  db.run(`
    CREATE TABLE IF NOT EXISTS note_attachments (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      note_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// 执行查询并返回所有结果
function queryAll(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// 执行运行语句
function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  saveDatabase();
}

// 数据库操作辅助函数
const dbOperations = {
  // 用户相关
  createUser: (id, openid, nickname, avatar, role) => {
    run('INSERT INTO users (id, openid, nickname, avatar, role) VALUES (?, ?, ?, ?, ?)', 
        [id, openid, nickname, avatar, role]);
    return { id };
  },

  getUserById: (id) => {
    const results = queryAll('SELECT * FROM users WHERE id = ?', [id]);
    return results[0] || null;
  },

  getUserByOpenid: (openid) => {
    const results = queryAll('SELECT * FROM users WHERE openid = ?', [openid]);
    return results[0] || null;
  },

  updateUser: (nickname, avatar, id) => {
    run('UPDATE users SET nickname = ?, avatar = ? WHERE id = ?', [nickname, avatar, id]);
    return { changes: 1 };
  },

  // 团队相关
  createTeam: (id, name, description, owner_id) => {
    run('INSERT INTO teams (id, name, description, owner_id) VALUES (?, ?, ?, ?)', 
        [id, name, description, owner_id]);
    return { id };
  },

  getTeamById: (id) => {
    const results = queryAll('SELECT * FROM teams WHERE id = ?', [id]);
    return results[0] || null;
  },

  getTeamsByUserId: (userId) => {
    return queryAll(`
      SELECT DISTINCT t.* FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.owner_id = ? OR tm.user_id = ?
    `, [userId, userId]);
  },

  updateTeam: (name, description, id) => {
    run('UPDATE teams SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    return { changes: 1 };
  },

  deleteTeam: (id) => {
    run('DELETE FROM teams WHERE id = ?', [id]);
    return { changes: 1 };
  },

  // 团队成员相关
  addTeamMember: (id, team_id, user_id, role) => {
    run('INSERT INTO team_members (id, team_id, user_id, role) VALUES (?, ?, ?, ?)', 
        [id, team_id, user_id, role]);
    return { id };
  },

  getTeamMembers: (teamId) => {
    return queryAll(`
      SELECT tm.*, u.nickname, u.avatar 
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
    `, [teamId]);
  },

  getTeamMember: (teamId, userId) => {
    const results = queryAll('SELECT * FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, userId]);
    return results[0] || null;
  },

  updateMemberRole: (role, teamId, userId) => {
    run('UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?', [role, teamId, userId]);
    return { changes: 1 };
  },

  removeTeamMember: (teamId, userId) => {
    run('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [teamId, userId]);
    return { changes: 1 };
  },

  // 档案相关
  createProfile: (id, team_id, user_id, first_impression, notes) => {
    run('INSERT INTO member_profiles (id, team_id, user_id, first_impression, notes) VALUES (?, ?, ?, ?, ?)', 
        [id, team_id, user_id, first_impression, notes]);
    return { id };
  },

  getProfile: (teamId, userId) => {
    const results = queryAll(`
      SELECT mp.*, u.nickname, u.avatar 
      FROM member_profiles mp
      JOIN users u ON mp.user_id = u.id
      WHERE mp.team_id = ? AND mp.user_id = ?
    `, [teamId, userId]);
    return results[0] || null;
  },

  updateProfile: (first_impression, notes, teamId, userId) => {
    run('UPDATE member_profiles SET first_impression = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE team_id = ? AND user_id = ?', 
        [first_impression, notes, teamId, userId]);
    return { changes: 1 };
  },

  // 评估相关
  createAssessment: (id, team_id, evaluator_id, target_user_id, period, scores, summary) => {
    run('INSERT INTO assessments (id, team_id, evaluator_id, target_user_id, period, scores, summary) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [id, team_id, evaluator_id, target_user_id, period, scores, summary]);
    return { id };
  },

  getAssessments: (teamId, userId) => {
    return queryAll(`
      SELECT a.*, u.nickname as evaluator_name
      FROM assessments a
      JOIN users u ON a.evaluator_id = u.id
      WHERE a.team_id = ? AND a.target_user_id = ?
      ORDER BY a.created_at DESC
    `, [teamId, userId]);
  },

  getAssessmentById: (id) => {
    const results = queryAll('SELECT * FROM assessments WHERE id = ?', [id]);
    return results[0] || null;
  },

  updateAssessment: (period, scores, summary, id) => {
    run('UPDATE assessments SET period = ?, scores = ?, summary = ? WHERE id = ?', 
        [period, scores, summary, id]);
    return { changes: 1 };
  },

  deleteAssessment: (id) => {
    run('DELETE FROM assessments WHERE id = ?', [id]);
    return { changes: 1 };
  },

  // 能力矩阵相关
  upsertAbility: (id, team_id, user_id, category, ability_name, score) => {
    // 先检查是否存在
    const existing = queryAll(
      'SELECT * FROM ability_matrix WHERE team_id = ? AND user_id = ? AND category = ? AND ability_name = ?',
      [team_id, user_id, category, ability_name]
    );
    
    if (existing.length > 0) {
      run('UPDATE ability_matrix SET score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
          [score, existing[0].id]);
      return { updated: true };
    } else {
      run('INSERT INTO ability_matrix (id, team_id, user_id, category, ability_name, score) VALUES (?, ?, ?, ?, ?, ?)', 
          [id, team_id, user_id, category, ability_name, score]);
      return { id };
    }
  },

  getAbilitiesByUser: (teamId, userId) => {
    return queryAll(
      'SELECT * FROM ability_matrix WHERE team_id = ? AND user_id = ? ORDER BY category, ability_name',
      [teamId, userId]
    );
  },

  deleteAbility: (id) => {
    run('DELETE FROM ability_matrix WHERE id = ?', [id]);
    return { changes: 1 };
  },

  // 附件相关
  addAttachment: (id, profile_id, note_id, file_path, file_type) => {
    run('INSERT INTO note_attachments (id, profile_id, note_id, file_path, file_type) VALUES (?, ?, ?, ?, ?)', 
        [id, profile_id, note_id, file_path, file_type]);
    return { id };
  },

  getAttachmentsByNote: (noteId) => {
    return queryAll('SELECT * FROM note_attachments WHERE note_id = ?', [noteId]);
  },

  deleteAttachment: (id) => {
    run('DELETE FROM note_attachments WHERE id = ?', [id]);
    return { changes: 1 };
  }
};

module.exports = {
  db,
  dbOperations,
  initDatabase
};
