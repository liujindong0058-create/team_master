# 团队陪跑大师 - 云服务器部署指南

## 📋 项目概述

- **项目名称**: 团队陪跑大师 (Team Master)
- **技术栈**: Node.js + Express
- **端口**: 5000
- **部署方式**: PM2 + Nginx 反向代理

---

## 🚀 快速部署步骤

### 第一步：准备服务器

确保您有一台云服务器（推荐配置）：
- **系统**: Ubuntu 20.04/22.04 LTS
- **配置**: 1核2G 或以上
- **带宽**: 1Mbps 或以上
- **安全组**: 开放 22(SSH)、80(HTTP)、443(HTTPS) 端口

### 第二步：配置部署文件

在本地修改以下文件：

#### 1. `deploy.sh` - 部署脚本配置
```bash
SERVER_USER="root"          # 修改为您的服务器用户名
SERVER_IP="your-server-ip"  # 修改为您的服务器IP地址
```

#### 2. `.env.production` - 生产环境变量
```bash
JWT_SECRET=your-production-secret-key-change-this  # 务必修改为强密钥
```

#### 3. `team-master.conf` - Nginx 配置
```nginx
server_name your-domain.com;  # 修改为您的域名或IP
```

### 第三步：上传部署文件到服务器

```bash
# 将 deploy 文件夹上传到服务器
scp -r deploy/* root@your-server-ip:/var/www/team-master/
```

### 第四步：在服务器上初始化环境

SSH 连接到服务器，运行初始化脚本：

```bash
ssh root@your-server-ip
cd /var/www/team-master
chmod +x setup-server.sh
./setup-server.sh
```

此脚本会自动安装：
- Node.js 20.x
- PM2 (进程管理器)
- Nginx (Web服务器)
- Git

### 第五步：部署应用

在本地运行部署脚本：

```bash
cd deploy
chmod +x deploy.sh
./deploy.sh
```

---

## 📁 部署文件说明

```
deploy/
├── .env.production          # 生产环境环境变量
├── ecosystem.config.js      # PM2 进程管理配置
├── team-master.conf         # Nginx 反向代理配置
├── deploy.sh                # 一键部署脚本
├── setup-server.sh          # 服务器初始化脚本
└── DEPLOY_GUIDE.md          # 本部署指南
```

---

## 🔧 常用命令

### PM2 进程管理

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs team-master-backend

# 重启服务
pm2 restart team-master-backend

# 停止服务
pm2 stop team-master-backend

# 删除服务
pm2 delete team-master-backend
```

### Nginx 管理

```bash
# 测试配置
nginx -t

# 重载配置
systemctl reload nginx

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 状态
systemctl status nginx
```

---

## 🔒 安全配置建议

### 1. 修改 JWT 密钥

编辑 `.env.production`：
```bash
JWT_SECRET=$(openssl rand -base64 32)  # 生成随机密钥
```

### 2. 配置 HTTPS (Let's Encrypt)

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com

# 自动续期测试
certbot renew --dry-run
```

### 3. 配置防火墙

```bash
# 查看防火墙状态
ufw status

# 允许特定端口
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
```

---

## 🐛 故障排查

### 服务无法启动

```bash
# 检查 PM2 日志
pm2 logs team-master-backend --lines 100

# 检查端口占用
netstat -tlnp | grep 5000

# 检查环境变量
cat /var/www/team-master/backend/.env
```

### Nginx 502 错误

```bash
# 检查后端服务是否运行
pm2 status

# 检查 Nginx 错误日志
tail -f /var/log/nginx/team-master-error.log

# 检查后端日志
tail -f /var/log/team-master/error.log
```

### 权限问题

```bash
# 修复目录权限
chown -R www-data:www-data /var/www/team-master
chmod -R 755 /var/www/team-master

# 修复日志权限
chown -R $(whoami) /var/log/team-master
```

---

## 📝 更新部署

当代码有更新时，只需重新运行：

```bash
cd deploy
./deploy.sh
```

脚本会自动：
1. 打包新代码
2. 上传到服务器
3. 备份旧版本
4. 安装依赖
5. 重启服务

---

## 📞 联系方式

如有部署问题，请检查：
1. 服务器安全组是否开放相应端口
2. 配置文件中的 IP/域名是否正确
3. 环境变量是否设置正确
4. 日志文件中的错误信息

---

## ✅ 部署检查清单

- [ ] 修改 `deploy.sh` 中的服务器信息
- [ ] 修改 `.env.production` 中的 JWT_SECRET
- [ ] 修改 `team-master.conf` 中的 server_name
- [ ] 服务器安全组开放 22、80、443 端口
- [ ] 运行 `setup-server.sh` 初始化服务器
- [ ] 运行 `deploy.sh` 部署应用
- [ ] 访问 `http://your-server-ip/api` 测试 API
- [ ] 配置 HTTPS (生产环境必需)
