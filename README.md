# My Blog - 全栈博客系统

一个基于 Vue 3 + Node.js 的现代化全栈博客平台，集成 AI 智能助手、实时通讯、音乐播放器等丰富功能。

## 项目亮点

- 前后端分离架构，采用 Monorepo 管理模式
- 集成 LangChain + Ollama 实现本地 AI 智能助手
- 基于 Socket.io 的实时在线状态和弹幕系统
- 双数据库设计：MongoDB + MariaDB/Prisma
- 完整的用户认证体系（JWT + 短信验证码）

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **路由**: Vue Router
- **实时通讯**: Socket.io Client
- **微前端**: Micro-app
- **动画**: GSAP
- **代码规范**: ESLint + Oxlint

### 后端
- **运行时**: Node.js + Express
- **语言**: TypeScript
- **数据库**: MongoDB (Mongoose) + MariaDB (Prisma)
- **AI 集成**: LangChain + Ollama
- **实时通讯**: Socket.io
- **认证**: JWT + bcrypt
- **短信服务**: 阿里云 SMS
- **文件上传**: Multer

## 功能特性

### 核心功能
- 文章发布、编辑、分类管理
- 标签系统与文章关联
- 用户注册/登录/找回密码（支持短信验证码）
- 个人中心与资料管理
- 文章评论与点赞

### AI 智能助手
- 基于 LangChain 的智能对话系统
- 支持文章搜索、音乐推荐、歌单查询等工具调用
- 对话历史记录与持久化
- 流式响应支持

### 音乐播放器
- 歌单管理与收藏
- 歌曲点赞与排行榜
- 实时弹幕系统

### 实时功能
- 在线用户状态显示
- Socket.io 实时通讯
- 阅读状态同步

### 其他特性
- 响应式布局设计
- 无限滚动加载
- Markdown 渲染支持
- 图片懒加载

## 项目结构

```
my-fullstack-project/
├── frontend/                 # Vue 3 前端项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   │   ├── business/    # 业务组件
│   │   │   ├── layout/      # 布局组件
│   │   │   └── ui/          # UI 组件
│   │   ├── views/           # 页面视图
│   │   ├── api/             # API 接口
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── router/          # 路由配置
│   │   ├── utils/           # 工具函数
│   │   ├── composables/     # 组合式函数
│   │   └── socket/          # Socket.io 客户端
│   └── package.json
├── backend/                  # Node.js 后端项目
│   ├── src/
│   │   ├── controller/      # 控制器层
│   │   ├── service/         # 业务逻辑层
│   │   ├── routes/          # 路由定义
│   │   ├── models/          # 数据模型 (MongoDB)
│   │   ├── middleware/      # 中间件
│   │   ├── utils/           # 工具函数
│   │   ├── config/          # 配置文件
│   │   └── socket/          # Socket.io 服务端
│   ├── prisma/              # Prisma 配置 (MariaDB)
│   └── package.json
└── package.json             # 根目录工作区配置
```

## 快速开始

### 环境要求
- Node.js >= 20.19.0
- MongoDB
- MariaDB/MySQL
- Ollama (可选，用于 AI 功能)

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 或分别安装前后端依赖
cd frontend && npm install
cd ../backend && npm install
```

### 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置数据库连接等信息
```

### 数据库初始化

```bash
# 后端目录下执行
cd backend
npx prisma migrate dev
```

### 启动开发服务器

```bash
# 同时启动前后端（推荐）
npm run dev

# 或分别启动
npm run dev -w backend
npm run dev -w frontend
```

前端访问: http://localhost:5173  
后端服务: http://localhost:3001

### 构建生产环境

```bash
npm run build
```

## 核心模块说明

### AI 助手模块
基于 LangChain 构建，集成多种工具：
- `searchArticlesTool` - 文章搜索
- `getMusicChartsTool` - 音乐排行榜查询
- `getHotPlaylistsTool` - 热门歌单推荐
- `getTagsListTool` - 标签列表获取
- `getTimelineTool` - 时间线查询

### 认证模块
- JWT Token 认证
- Cookie 存储刷新令牌
- 短信验证码登录/注册
- 密码加密存储 (bcrypt)

### 文件上传模块
- 头像上传
- 封面图片上传
- 文件类型与大小限制

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint + Oxlint 代码规范
- 接口响应统一格式
- 错误集中处理中间件
- 异步操作使用 async/await

## 部署说明

1. 配置生产环境环境变量
2. 构建前端静态资源
3. 编译后端 TypeScript
4. 配置 Nginx 反向代理
5. 启动 MongoDB 和 MariaDB
6. 运行后端服务

## 未来规划

- [ ] 引入 Redis 缓存
- [ ] 文章全文搜索 (Elasticsearch)
- [ ] 服务端渲染 (SSR)
- [ ] 单元测试与 E2E 测试
- [ ] Docker 容器化部署
- [ ] CI/CD 自动化流水线

## 许可证

MIT License
