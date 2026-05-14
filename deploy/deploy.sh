#!/bin/bash

# 团队陪跑大师 - 部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署 Team Master 后端服务..."

# 配置变量
SERVER_USER="root"  # 修改为您的服务器用户名
SERVER_IP="your-server-ip"  # 修改为您的服务器IP
REMOTE_DIR="/var/www/team-master"
LOCAL_BACKEND_DIR="./backend"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查本地后端目录
if [ ! -d "$LOCAL_BACKEND_DIR" ]; then
    echo -e "${RED}❌ 错误: 找不到后端目录 $LOCAL_BACKEND_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 步骤 1: 打包后端代码...${NC}"
cd "$LOCAL_BACKEND_DIR"
# 排除 node_modules 和日志文件
tar -czf ../backend-deploy.tar.gz --exclude='node_modules' --exclude='logs' --exclude='*.log' .
cd ..

echo -e "${YELLOW}🚀 步骤 2: 上传到服务器...${NC}"
# 创建远程目录
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_DIR/backend"
# 上传代码
scp backend-deploy.tar.gz "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

echo -e "${YELLOW}🔧 步骤 3: 在服务器上解压并安装依赖...${NC}"
ssh "$SERVER_USER@$SERVER_IP" << 'REMOTE_COMMANDS'
    REMOTE_DIR="/var/www/team-master"
    cd "$REMOTE_DIR"

    # 备份当前版本（可选）
    if [ -d "backend" ]; then
        mv backend backend-backup-$(date +%Y%m%d-%H%M%S)
    fi

    # 解压新代码
    mkdir -p backend
    tar -xzf backend-deploy.tar.gz -C backend
    rm backend-deploy.tar.gz

    # 进入后端目录
    cd backend

    # 安装生产依赖
    echo "📦 安装 npm 依赖..."
    npm ci --production

    # 创建日志目录
    sudo mkdir -p /var/log/team-master
    sudo chown -R $(whoami) /var/log/team-master

    # 复制生产环境配置（如果不存在）
    if [ ! -f ".env" ]; then
        cp ../.env.production .env 2>/dev/null || echo "⚠️  请手动创建 .env 文件"
    fi

    echo -e "${GREEN}✅ 代码部署完成!${NC}"
REMOTE_COMMANDS

echo -e "${YELLOW}🔄 步骤 4: 使用 PM2 启动/重启服务...${NC}"
ssh "$SERVER_USER@$SERVER_IP" << 'REMOTE_COMMANDS'
    REMOTE_DIR="/var/www/team-master"
    cd "$REMOTE_DIR/backend"

    # 检查 PM2 是否安装
    if ! command -v pm2 &> /dev/null; then
        echo "📦 安装 PM2..."
        sudo npm install -g pm2
    fi

    # 复制 PM2 配置文件
    cp "$REMOTE_DIR/ecosystem.config.js" .

    # 启动或重启服务
    pm2 describe team-master-backend > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "🔄 重启现有服务..."
        pm2 reload ecosystem.config.js --env production
    else
        echo "🚀 启动新服务..."
        pm2 start ecosystem.config.js --env production
        pm2 save
    fi

    # 设置 PM2 开机自启
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp $HOME
    sudo pm2 save

    echo -e "${GREEN}✅ PM2 服务启动成功!${NC}"
REMOTE_COMMANDS

echo -e "${YELLOW}🔧 步骤 5: 配置 Nginx...${NC}"
ssh "$SERVER_USER@$SERVER_IP" << 'REMOTE_COMMANDS'
    # 复制 Nginx 配置
    sudo cp /var/www/team-master/team-master.conf /etc/nginx/sites-available/team-master

    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/team-master /etc/nginx/sites-enabled/

    # 测试配置
    sudo nginx -t

    # 重载 Nginx
    sudo systemctl reload nginx

    echo -e "${GREEN}✅ Nginx 配置完成!${NC}"
REMOTE_COMMANDS

# 清理本地临时文件
rm -f backend-deploy.tar.gz

echo ""
echo -e "${GREEN}🎉 部署完成!${NC}"
echo ""
echo "📋 部署信息:"
echo "   - 后端服务: http://$SERVER_IP:5000"
echo "   - API 地址: http://$SERVER_IP/api"
echo ""
echo "🔍 检查服务状态:"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo ""
echo "📊 查看日志:"
echo "   ssh $SERVER_USER@$SERVER_IP 'pm2 logs team-master-backend'"
echo ""
