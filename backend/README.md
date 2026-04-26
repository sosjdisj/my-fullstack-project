# 全栈内容社区后端服务

> 一个功能完善的内容社区后端项目，采用现代化技术栈，支持文章、音乐、AI助手、实时聊天等核心功能。

## 🚀 技术栈

| 类别 | 技术 |
|------|------|
| **运行时** | Node.js 20+ |
| **框架** | Express 5.x |
| **语言** | TypeScript 5.x |
| **数据库** | MySQL (Prisma ORM) + MongoDB (Mongoose) |
| **认证** | JWT + 阿里云短信服务 |
| **实时通信** | Socket.io |
| **AI 能力** | LangChain + Ollama |
| **部署** | PM2 / Docker Ready |

## 📁 项目架构

```
src/
├── config/         # 全局配置（数据库、AI、环境变量）
├── controller/     # 控制器层 - 处理 HTTP 请求/响应
├── service/        # 业务逻辑层 - 核心业务实现
│   └── agent-tools/ # AI Agent 工具集
├── models/         # 数据模型层（Mongoose Schema）
├── routes/         # 路由层 - API 端点定义
├── middleware/     # 中间件（认证、错误处理、日志）
├── utils/          # 工具函数（验证、加密、文件上传）
└── socket/         # Socket.io 实时通信
```

**架构特点**：
- ✅ 三层架构设计（Controller → Service → Model），职责清晰
- ✅ 依赖注入模式，便于单元测试
- ✅ 统一错误处理中间件
- ✅ 模块化路由自动加载

## ✨ 核心功能

### 1. 用户系统
- JWT 认证 + 刷新令牌机制
- 阿里云短信验证码登录
- 用户角色权限管理（RBAC）
- 个人资料管理

### 2. 内容管理
- 文章发布、编辑、分类、标签
- 评论系统（支持嵌套回复）
- 文章点赞、收藏、浏览统计
- 富文本内容支持

### 3. 音乐系统
- 歌曲上传、播放列表管理
- 歌曲标签分类
- 用户收藏、喜欢功能

### 4. AI 智能助手
- 基于 LangChain 的 AI Agent
- 支持多工具调用（文章搜索、音乐推荐等）
- 上下文感知的对话系统
- 本地 Ollama 模型集成

### 5. 实时通信
- Socket.io 实现即时聊天
- 在线状态管理
- 消息持久化存储

### 6. 树洞社区
- 匿名发布功能
- 时间线展示
- 情感支持社区

## 🔧 快速开始

### 环境要求
- Node.js >= 18.0.0
- MySQL >= 8.0
- MongoDB >= 5.0
- Ollama（可选，用于 AI 功能）

### 安装依赖
```bash
npm install
```

### 环境配置
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接和密钥
```

### 数据库初始化
```bash
# 执行 Prisma 迁移
npx prisma migrate dev

# 生成 Prisma Client
npx prisma generate
```

### 启动服务
```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

服务将在 `http://localhost:3001` 启动

## 📡 API 概览

| 模块 | 基础路径 | 主要功能 |
|------|----------|----------|
| 认证 | `/api/auth` | 登录、注册、刷新令牌 |
| 用户 | `/api/profile` | 用户信息、头像上传 |
| 文章 | `/api/articles` | CRUD、搜索、筛选 |
| 音乐 | `/api/songs` | 歌曲、播放列表 |
| AI 助手 | `/api/chat` | 智能对话 |
| 树洞 | `/api/treehole` | 匿名发布 |
| 分类标签 | `/api/categories`, `/api/tags` | 内容分类 |

## 🎯 项目亮点

### 1. 双数据库设计
- **MySQL (Prisma)**：处理结构化数据（用户、文章、关系）
- **MongoDB (Mongoose)**：处理非结构化数据（聊天记录、日志）
- 优势互补，兼顾事务性和灵活性

### 2. AI Agent 架构
```typescript
// 可扩展的工具注册机制
const tools = [
  articleSearchTool,   // 文章搜索
  songRecommendTool,   // 音乐推荐
  playlistQueryTool,   // 播放列表查询
  // ... 易于扩展
];
```

### 3. 统一的错误处理
```typescript
// 全局错误捕获，统一响应格式
app.use(errorHandler);

// 自定义错误类
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}
```

### 4. 类型安全
- 全项目 TypeScript 覆盖
- 严格的编译选项
- 路径别名配置（`@/*`）

## 🧪 待完善项

- [ ] 单元测试覆盖（Jest）
- [ ] API 文档（Swagger/OpenAPI）
- [ ] 限流与防刷机制
- [ ] 日志收集与监控
- [ ] Docker 容器化部署

## 📝 学习收获

通过本项目，深入实践了：
- 企业级 Node.js 项目架构设计
- TypeScript 高级类型系统应用
- ORM（Prisma）与 ODM（Mongoose）的选型与使用
- AI Agent 开发模式与工具链集成
- 实时通信系统的设计与实现
- JWT 认证与权限控制的最佳实践

## 📄 许可证

MIT License

---

> 本项目为个人学习作品，欢迎交流探讨！
