const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const memberRoutes = require('./routes/members');
const profileRoutes = require('./routes/profiles');
const assessmentRoutes = require('./routes/assessments');
const matrixRoutes = require('./routes/matrix');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 路由注册
app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);
app.use('/teams/:teamId/members', memberRoutes);
app.use('/teams/:teamId/members/:userId/profile', profileRoutes);
app.use('/teams/:teamId/members/:userId/assessments', assessmentRoutes);
app.use('/teams/:teamId/members/:userId/matrix', matrixRoutes);
app.use('/upload', uploadRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // 处理 JSON 解析错误
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON 格式错误'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 初始化数据库并启动服务器
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`Team Master Backend Server`);
      console.log(`=================================`);
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`API Base URL: http://localhost:${PORT}`);
      console.log(`=================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
