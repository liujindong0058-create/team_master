#!/bin/bash
set -e

echo "=== 团队管理系统部署脚本 ==="

# 配置
APP_DIR="/home/ubuntu/team_master"
SERVER_IP="175.178.181.190"

# 清理旧版本
echo "清理旧版本..."
rm -rf $APP_DIR

# 克隆代码
echo "克隆代码仓库..."
cd /home/ubuntu
git clone --depth 1 https://github.com/liujindong0058-create/team_master.git

cd $APP_DIR

echo "=== 安装后端依赖 ==="
cd backend
npm install

# 创建环境变量文件
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
EOF

echo "=== 安装前端依赖并构建 ==="
cd ../frontend
npm install

# 修复缺失的页面文件
cat > src/pages/HomePage.tsx << 'EOF'
import { useState } from 'react';
import { Button, Card, Typography, Row, Col } from 'antd';
import AuthPage from './AuthPage';

const { Title, Paragraph } = Typography;

function HomePage() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthPage />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <Title>团队管理系统</Title>
        <Paragraph style={{ fontSize: 16, marginBottom: 30 }}>
          高效的团队协作与评估平台，帮助您更好地管理团队绩效
        </Paragraph>
        <Row gutter={[16, 16]} justify="center">
          <Col>
            <Button type="primary" size="large" onClick={() => setShowAuth(true)}>
              开始使用
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default HomePage;
EOF

cat > src/pages/DashboardPage.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { Layout, Menu, Card, Statistic, Row, Col, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, TeamOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

function DashboardPage() {
  const { user, clearState } = useAppStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    pendingAssessments: 0
  });

  useEffect(() => {
    setStats({
      totalUsers: 12,
      totalAssessments: 45,
      pendingAssessments: 3
    });
  }, []);

  const handleLogout = () => {
    clearState();
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <BarChartOutlined />,
      label: '概览',
    },
    {
      key: 'assessments',
      icon: <TeamOutlined />,
      label: '评估管理',
      onClick: () => navigate('/assessments')
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0 }}>团队管理</h3>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>控制台</h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.name || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic title="总用户数" value={stats.totalUsers} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic title="总评估数" value={stats.totalAssessments} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic title="待处理评估" value={stats.pendingAssessments} />
              </Card>
            </Col>
          </Row>
          
          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card title="快速操作">
                <Button type="primary" onClick={() => navigate('/assessments')}>
                  查看评估
                </Button>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardPage;
EOF

# 构建前端
npm run build

echo "=== 配置 Nginx ==="
sudo tee /etc/nginx/sites-available/team_master << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        root /home/ubuntu/team_master/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

sudo ln -sf /etc/nginx/sites-available/team_master /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "=== 启动后端服务 ==="
cd $APP_DIR/backend

# 安装 PM2
sudo npm install -g pm2

# 停止旧进程
pm2 delete team-master-api 2>/dev/null || true
pm2 delete team_master-backend 2>/dev/null || true

# 启动新进程
pm2 start src/server.js --name team-master-backend
pm2 save

echo "=== 部署完成 ==="
echo "访问地址: http://$SERVER_IP"
echo ""
echo "服务状态:"
pm2 status
