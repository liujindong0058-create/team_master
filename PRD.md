# 团队陪跑大师 - 产品需求文档 (PRD)

## 1. Executive Summary

### 1.1 Problem Statement
团队管理者在日常管理中容易因为近期事件产生主观误判，缺乏系统性的记录和追踪机制。在年度绩效评价时难以回忆全年表现，任务分配时也无法快速结合个人优劣势做出最优决策。

### 1.2 Proposed Solution
团队陪跑大师是一个帮助团队管理者进行客观、长期、 多维度团队人才追踪的管理系统。通过日常小记、多维度评估、长期追踪等功能，让管理者告别主观误判，实现数据驱动的团队管理。

### 1.3 Success Criteria
- **用户活跃度**: 上线3个月内，日活跃用户(DAU)达到注册用户的40%以上
- **数据完整性**: 每个成员每月至少4条小记记录
- **决策支持**: 80%的管理者反馈系统在任务分配时有实际帮助
- **评价准确性**: 90%的用户认为系统帮助减少了主观误判

---

## 2. User Experience & Functionality

### 2.1 User Personas

#### Primary Persona: 团队管理者 (Team Lead)
- 年龄: 28-45岁
- 背景: 技术出身或有技术背景的管理者
- 目标: 客观了解团队成员、合理分配任务、做好人才发展
- 痛点: 记不住、记不全面、容易凭印象

#### Secondary Persona: 团队成员 (Team Member)
- 年龄: 22-35岁
- 背景: 希望了解自己在团队中的定位和发展方向
- 目标: 获得客观反馈、明确成长方向
- 痛点: 不知道自己的优劣势、不知道领导怎么看自己

### 2.2 User Stories & Acceptance Criteria

#### 核心用户故事

**US-1: 团队管理者注册登录**
```
As a 团队管理者
I want to 注册并登录系统
So that 我可以开始管理我的团队
```
**Acceptance Criteria:**
- [ ] 支持邮箱/手机号注册
- [ ] 支持密码找回功能
- [ ] 支持记住登录状态（7天免登录）
- [ ] 支持退出登录

**US-2: 创建和管理虚拟团队**
```
As a 团队管理者
I want to 创建虚拟团队并添加成员
So that 我可以系统性地追踪每个成员的表现
```
**Acceptance Criteria:**
- [ ] 支持创建多个虚拟团队（如：前端组、后端组、项目组）
- [ ] 支持添加成员（姓名、职位、加入时间、照片）
- [ ] 支持编辑成员信息
- [ ] 支持移除成员（保留历史记录）
- [ ] 支持查看团队整体画像

**US-3: 记录人员小记**
```
As a 团队管理者
I want to 随时记录关于成员的小记
So that 我不会忘记重要的细节和表现
```
**Acceptance Criteria:**
- [ ] 支持文字记录（必填，最少10字符）
- [ ] 支持上传聊天截图（可选，最多9张）
- [ ] 支持选择小记类型（优点/缺点/关键时刻/日常表现）
- [ ] 支持 @提及成员
- [ ] 支持设置小记私密性（仅自己可见/团队内可见）
- [ ] 支持快速添加（30秒内完成）
- [ ] 自动关联时间和项目上下文

**US-4: 长期评价追踪**
```
As a 团队管理者
I want to 追踪成员长期表现
So that 我可以避免近期偏差，看到完整的人才画像
```
**Acceptance Criteria:**
- [ ] 支持按时间维度查看历史记录（本周/本月/本季度/今年/全部）
- [ ] 支持按标签/类型筛选
- [ ] 支持趋势图展示（优点/缺点变化曲线）
- [ ] 支持里程碑标记（转正/晋升/重要项目完成）
- [ ] 自动生成时间轴视图

**US-5: 多维度评估体系**
```
As a 团队管理者
I want to 从多个维度评估成员
So that 我可以全面了解成员的优劣势
```
**Assessment Dimensions:**
1. **专业能力** (1-5分): 技术水平、业务理解、问题解决
2. **协作能力** (1-5分): 沟通表达、团队合作、跨部门协作
3. **工作态度** (1-5分): 责任心、主动性、抗压能力
4. **成长潜力** (1-5分): 学习能力、发展意愿、晋升潜力
5. **业务贡献** (1-5分): 交付效率、质量意识、创新能力

**Acceptance Criteria:**
- [ ] 支持定期评估（周/双周/月/季度）
- [ ] 支持随时手动评估
- [ ] 支持评估历史对比
- [ ] 支持导出评估报告（PDF/Excel）
- [ ] 支持匿名同事反馈（可选功能）
- [ ] 自动计算综合得分和雷达图

**US-6: 任务分配辅助**
```
As a 团队管理者
I want to 在分配任务时快速查看成员优劣势
So that 我可以做出更合适的分配决策
```
**Acceptance Criteria:**
- [ ] 支持创建任务并指定所需能力维度
- [ ] 系统基于成员评估维度智能推荐候选人
- [ ] 支持查看成员的当前工作负载
- [ ] 支持标记任务优先级
- [ ] 支持任务完成后的简短复盘记录

**US-7: 数据可视化和报告**
```
As a 团队管理者
I want to 看到直观的数据报告
So that 我可以快速了解团队状态
```
**Acceptance Criteria:**
- [ ] 团队整体健康度仪表盘
- [ ] 个人雷达图（多维度能力展示）
- [ ] 团队对比图（成员间横向比较）
- [ ] 趋势分析图（环比/同比）
- [ ] 支持一键导出年度绩效报告

### 2.3 Non-Goals (本次不开发)
- 不开发薪资和考勤管理功能
- 不开发项目管理（任务分配为辅助功能，非完整项目管理）
- 不开发即时通讯功能
- 不开发面试和招聘流程管理
- 不开发移动端原生APP（优先Web，移动端H5适配）

---

## 3. Technical Specifications

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Dashboard │  │ Members  │  │ Notes    │  │ Reports  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   API Gateway (Node.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │  Teams   │  │  Notes   │  │ Reports  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│    PostgreSQL (主数据)   │ │    Redis (缓存/会话)     │
└─────────────────────────┘ └─────────────────────────┘
```

### 3.2 Tech Stack Recommendation

**推荐方案：MERN Stack (适合快速开发)**

#### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: Ant Design 5.x (企业级UI组件)
- **State Management**: Zustand (轻量级)
- **Charts**: ECharts (数据可视化)
- **Image Upload**: react-dropzone

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 或 NestJS
- **ORM**: Prisma (现代化ORM工具)
- **Authentication**: JWT + Refresh Token
- **File Storage**: 阿里云OSS / 腾讯云COS / 本地存储

#### Database
- **Primary DB**: PostgreSQL 14+ (关系型数据)
- **Cache**: Redis (会话缓存)

#### DevOps
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: 阿里云ECS / Vercel / Railway

### 3.3 Data Model

#### Users (用户表)
```
id: UUID (PK)
email: VARCHAR(255) UNIQUE
password_hash: VARCHAR(255)
name: VARCHAR(100)
avatar: VARCHAR(500)
role: ENUM('admin', 'manager', 'member')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### Teams (团队表)
```
id: UUID (PK)
owner_id: UUID (FK -> users.id)
name: VARCHAR(100)
description: TEXT
avatar: VARCHAR(500)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### Members (成员表)
```
id: UUID (PK)
team_id: UUID (FK -> teams.id)
name: VARCHAR(100)
position: VARCHAR(100)
avatar: VARCHAR(500)
join_date: DATE
status: ENUM('active', 'inactive', 'removed')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### Notes (小记表)
```
id: UUID (PK)
member_id: UUID (FK -> members.id)
author_id: UUID (FK -> users.id)
type: ENUM('strength', 'weakness', 'critical', 'daily')
content: TEXT
privacy: ENUM('private', 'team')
images: JSON (array of URLs)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

#### Assessments (评估表)
```
id: UUID (PK)
member_id: UUID (FK -> members.id)
assessor_id: UUID (FK -> users.id)
period: ENUM('week', 'biweek', 'month', 'quarter')
dimensions: JSON {
  professional: 1-5,
  collaboration: 1-5,
  attitude: 1-5,
  growth: 1-5,
  contribution: 1-5
}
comment: TEXT
assessed_at: TIMESTAMP
created_at: TIMESTAMP
```

#### Tasks (任务记录表)
```
id: UUID (PK)
team_id: UUID (FK -> teams.id)
title: VARCHAR(200)
description: TEXT
required_dimensions: JSON
member_id: UUID (FK -> members.id, nullable)
priority: ENUM('low', 'medium', 'high')
status: ENUM('pending', 'in_progress', 'completed')
due_date: DATE
review: TEXT (复盘记录)
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### 3.4 API Endpoints

#### Authentication
```
POST /api/auth/register     - 用户注册
POST /api/auth/login        - 用户登录
POST /api/auth/refresh      - 刷新Token
POST /api/auth/logout       - 退出登录
GET  /api/auth/me           - 获取当前用户
```

#### Teams
```
GET    /api/teams           - 获取用户的团队列表
POST   /api/teams           - 创建团队
GET    /api/teams/:id       - 获取团队详情
PUT    /api/teams/:id       - 更新团队信息
DELETE /api/teams/:id       - 删除团队
```

#### Members
```
GET    /api/teams/:teamId/members      - 获取团队成员列表
POST   /api/teams/:teamId/members      - 添加成员
GET    /api/members/:id                - 获取成员详情
PUT    /api/members/:id                - 更新成员信息
DELETE /api/members/:id                - 移除成员
```

#### Notes
```
GET    /api/members/:memberId/notes    - 获取成员的小记
POST   /api/members/:memberId/notes    - 添加小记
PUT    /api/notes/:id                  - 更新小记
DELETE /api/notes/:id                  - 删除小记
GET    /api/notes/timeline             - 获取时间轴视图
```

#### Assessments
```
GET    /api/members/:memberId/assessments    - 获取成员评估历史
POST   /api/members/:memberId/assessments   - 创建评估
GET    /api/assessments/:id                  - 获取评估详情
PUT    /api/assessments/:id                  - 更新评估
```

#### Tasks
```
GET    /api/teams/:teamId/tasks      - 获取团队任务
POST   /api/teams/:teamId/tasks      - 创建任务
GET    /api/tasks/:id                - 获取任务详情
PUT    /api/tasks/:id                - 更新任务
DELETE /api/tasks/:id                - 删除任务
GET    /api/tasks/recommend          - 智能推荐成员
```

#### Reports
```
GET    /api/reports/dashboard        - 仪表盘数据
GET    /api/reports/member/:id       - 个人报告
GET    /api/reports/team/:id         - 团队报告
GET    /api/reports/export/:type     - 导出报告
```

---

## 4. Security & Privacy

### 4.1 Authentication & Authorization
- 密码使用 bcrypt 加密（cost factor: 12）
- JWT Access Token 有效期15分钟
- Refresh Token 有效期7天
- 敏感操作需要重新验证密码

### 4.2 Data Privacy
- 小记支持私密/团队可见两种级别
- 评估数据仅对评估者和管理员可见
- 支持数据导出时自动脱敏
- 符合《个人信息保护法》要求

### 4.3 File Upload Security
- 图片类型白名单校验（jpg, png, gif, webp）
- 文件大小限制（单张5MB，总共45MB）
- 图片内容安全扫描（可选）
- 上传的文件使用随机UUID命名

---

## 5. Development Roadmap

### Phase 1: MVP (4-6周)
**目标**: 完成核心功能，团队内部试用

- [ ] 用户注册登录系统
- [ ] 团队管理（CRUD）
- [ ] 成员管理（CRUD）
- [ ] 小记功能（文字+图片）
- [ ] 基础仪表盘

### Phase 2: v1.0 (4-6周)
**目标**: 完善评估和追踪功能

- [ ] 多维度评估体系
- [ ] 长期追踪时间轴
- [ ] 数据可视化（雷达图、趋势图）
- [ ] 任务分配辅助
- [ ] 报告导出功能

### Phase 3: v2.0 (6-8周)
**目标**: 增强用户体验和协作

- [ ] 匿名同事反馈
- [ ] 团队对比分析
- [ ] 智能推荐算法优化
- [ ] 移动端H5适配
- [ ] 邮件/微信通知

---

## 6. Technical Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 图片存储成本超预期 | Medium | Medium | 使用OSS按量付费，设定存储上限 |
| 评估数据主观性 | Medium | High | 多维度评估+时间轴追踪降低偏差 |
| 用户不愿意记录 | High | High | 简化记录流程，快速添加<30秒 |
| 数据迁移困难 | Low | Low | 使用Prisma ORM，支持版本化schema |
| 并发性能瓶颈 | Medium | Low | Redis缓存+数据库索引优化 |

---

## 7. Appendix

### 7.1 Design System
- **Color Palette**:
  - Primary: #1890ff (Ant Design Blue)
  - Success: #52c41a
  - Warning: #faad14
  - Error: #ff4d4f
  - Background: #f5f5f5
- **Typography**: Inter (英文), Noto Sans SC (中文)
- **Spacing**: 8px grid system
- **Border Radius**: 6px (buttons), 8px (cards)

### 7.2 Performance Targets
- 首屏加载时间 < 2s
- API响应时间 < 200ms (P95)
- 图片上传反馈 < 1s
- 图表渲染 < 500ms

### 7.3 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
