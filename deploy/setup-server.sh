#!/bin/bash

# 服务器初始化脚本
# 在新服务器上运行此脚本安装必要依赖

set -e

echo "🖥️  开始配置服务器环境..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 更新系统
echo -e "${YELLOW}📦 更新系统包...${NC}"
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
echo -e "${YELLOW}📦 安装 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js 安装完成: $(node --version)${NC}"
else
    echo -e "${GREEN}✅ Node.js 已安装: $(node --version)${NC}"
fi

# 安装 PM2
echo -e "${YELLOW}📦 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 已安装${NC}"
fi

# 安装 Nginx
echo -e "${YELLOW}📦 安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    echo -e "${GREEN}✅ Nginx 安装完成${NC}"
else
    echo -e "${GREEN}✅ Nginx 已安装${NC}"
fi

# 安装 Git
echo -e "${YELLOW}📦 安装 Git...${NC}"
sudo apt install -y git

# 创建应用目录
echo -e "${YELLOW}📁 创建应用目录...${NC}"
sudo mkdir -p /var/www/team-master
sudo mkdir -p /var/log/team-master

# 设置防火墙
echo -e "${YELLOW}🔥 配置防火墙...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo ""
echo -e "${GREEN}🎉 服务器配置完成!${NC}"
echo ""
echo "📋 已安装:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - PM2: $(pm2 --version)"
echo "   - Nginx: $(nginx -v 2>&1 | head -1)"
echo ""
echo "⚠️  请完成以下步骤:"
echo "   1. 修改 deploy.sh 中的 SERVER_IP 和 SERVER_USER"
echo "   2. 修改 .env.production 中的 JWT_SECRET"
echo "   3. 修改 team-master.conf 中的 server_name"
echo "   4. 运行 ./deploy.sh 部署应用"
echo ""
