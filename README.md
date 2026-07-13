# My Blog - 全栈博客系统

一个基于 Vue 3 + Node.js 的现代化全栈博客平台，集成 RAG 检索增强生成、AI Agent、实时通讯、音乐播放器等丰富功能。

## 项目亮点

- **RAG 检索增强生成**：文章智能分块 → Ollama Embedding 向量化 → Qdrant 向量存储 → 两阶段检索（向量召回 + Reranker 精排）→ 上下文注入 Prompt
- **LangGraph Agent 架构**：基于 LangGraph 构建 AI Agent，集成 10 种工具，支持工具调用与多轮对话
- **Redis 多层缓存体系**：Embedding / RAG 检索结果 / Reranker Embedding / 对话历史 / Token 共五层缓存，含降级容错策略
- **三数据库协同**：MongoDB（文档存储）+ MariaDB/Prisma（关系型用户数据）+ Qdrant（向量检索）
- **前后端分离 + 微前端**：Monorepo 管理，Micro-app 集成音乐子应用
- 完整的用户认证体系（JWT + 阿里云短信验证码）

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **UI 组件库**: Element Plus + Font Awesome
- **路由**: Vue Router（路由懒加载）
- **实时通讯**: Socket.io Client
- **微前端**: Micro-app
- **动画**: GSAP + ScrollTrigger
- **样式**: Less + 玻璃拟态设计
- **弹幕**: vue3-danmaku
- **安全**: DOMPurify（XSS 防护）
- **流式响应**: @microsoft/fetch-event-source
- **Markdown**: marked
- **代码规范**: ESLint + Oxlint

### 后端
- **运行时**: Node.js + Express 5
- **语言**: TypeScript
- **关系型数据库**: MariaDB (Prisma ORM)
- **文档数据库**: MongoDB (Mongoose)
- **向量数据库**: Qdrant
- **缓存**: Redis (ioredis)
- **AI 框架**: LangChain + LangGraph
- **AI 模型**: Ollama (Gemma 4 本地大模型 + embeddinggemma 向量模型)
- **Reranker**: HuggingFace Transformers (ms-marco-MiniLM-L-6-v2)
- **实时通讯**: Socket.io
- **认证**: JWT + bcrypt
- **短信服务**: 阿里云 SMS
- **参数校验**: Joi
- **文件上传**: Multer

## 功能特性

### 核心功能
- 文章发布、编辑、分类管理
- 标签系统与文章关联
- 用户注册/登录/找回密码（支持短信验证码）
- 个人中心与资料管理
- 文章评论、点赞与收藏
- 文章搜索（关键词搜索、热门标题推荐）

### RAG 知识库系统
- 文章智能分块：优先 Markdown 标题切分，长段落回退到滑动窗口（800 字/200 字重叠）
- 向量化存储：Ollama embeddinggemma:300m 生成 Embedding → Qdrant Cosine 向量索引
- 两阶段检索：Qdrant 向量召回（Top-20 候选）→ ms-marco-MiniLM-L-6-v2 Reranker 精排（Top-5）
- 多轮对话上下文：提取最近 N 轮用户问题拼接，提升检索相关性
- 知识库自动初始化：应用启动时检测 Qdrant，为空则全量重建

### AI 智能助手
- 基于 LangGraph 的 Agent 架构，支持工具调用与多轮对话
- 集成 10 种工具：
  - 文章搜索 / 分类列表 / 标签列表 / 时间线查询
  - 歌曲排行榜 / 热门歌单推荐
  - 用户互动查询 / 树洞消息 / 每日名言
- 对话标题自动生成（AI 总结首条消息）
- 对话历史持久化（游标分页向上加载）
- RAG + Agent 协同：博客内容问题走 RAG 检索，数据查询走工具调用

### 树洞/弹幕系统
- 匿名弹幕发送与实时展示（vue3-danmaku）
- 消息审核机制（PENDING → APPROVED / REJECTED）
- 发送频率限制（10 秒内限发一条）
- 玻璃拟态 UI + 弹幕浮动动画

### 音乐播放器（微前端子应用）
- 歌单管理与收藏
- 歌曲点赞与排行榜
- LRC 歌词解析与同步展示
- 歌词文件上传（.lrc 格式）

### Redis 缓存体系
- Embedding 缓存（7 天 TTL，文本不变可复用）
- RAG 检索结果缓存（1 小时 TTL）
- Reranker 文档 Embedding 缓存（7 天 TTL）
- 对话历史缓存（5 分钟 TTL）
- 跨应用 Token 共享缓存（2 小时 TTL）
- 降级策略：Redis 异常时自动降级为直接计算，不影响核心流程

### 实时功能
- 全站在线用户数统计与广播
- 文章阅读房间（加入/离开）+ 实时读者数更新
- Socket.io 连接/断开自动管理

### 搜索功能
- 文章关键词搜索（标题正则匹配 + 分页）
- 热门搜索标题推荐（按浏览量排序）

### 其他特性
- 响应式布局设计
- 无限滚动加载（IntersectionObserver）
- 图片懒加载（自定义 v-lazy 指令）
- Markdown 渲染支持
- 每日名言模块
- 表单验证 Composable（统一校验逻辑）
- 验证码倒计时（持久化恢复，页面刷新不丢失）

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
│   │   │   ├── Home/        # 首页（文章流+信息面板）
│   │   │   ├── ArticleDetail/  # 文章详情
│   │   │   ├── ArticleListByCategory/  # 分类文章列表
│   │   │   ├── CategoryTagList/  # 分类/标签索引
│   │   │   ├── Timeline/    # 时间轴
│   │   │   ├── Treehole/    # 树洞弹幕
│   │   │   ├── AiChat/      # AI 助手
│   │   │   ├── SearchResult/  # 搜索结果
│   │   │   ├── Setting/     # 设置
│   │   │   ├── FullProfile/  # 个人主页
│   │   │   ├── Login/       # 登录
│   │   │   ├── Register/    # 注册
│   │   │   └── Reset/       # 重置密码
│   │   ├── api/             # API 接口封装
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── router/          # 路由配置（懒加载）
│   │   ├── composables/     # 组合式函数
│   │   ├── directives/      # 自定义指令（v-lazy）
│   │   ├── socket/          # Socket.io 客户端
│   │   └── utils/           # 工具函数
│   └── package.json
├── backend/                  # Node.js 后端项目
│   ├── src/
│   │   ├── controller/      # 控制器层
│   │   ├── service/         # 业务逻辑层
│   │   │   ├── agent-tools/ # Agent 工具定义（10 个工具）
│   │   │   ├── rag.service.ts       # RAG 检索主流程
│   │   │   ├── embedding.service.ts # 向量化服务
│   │   │   ├── reranker.service.ts  # Reranker 重排序
│   │   │   ├── articleChunk.service.ts  # 文章分块与知识库管理
│   │   │   └── ...           # 其他业务服务
│   │   ├── routes/          # 路由定义（自动加载）
│   │   ├── models/          # 数据模型 (MongoDB)
│   │   │   ├── Article.ts
│   │   │   ├── ArticleChunk.ts  # RAG 文章分块
│   │   │   ├── Conversations.ts # AI 对话
│   │   │   ├── Ai_Message.ts    # AI 消息
│   │   │   ├── Treehole.ts      # 树洞弹幕
│   │   │   ├── Quotes.ts        # 每日名言
│   │   │   └── ...           # 其他模型
│   │   ├── middleware/      # 中间件
│   │   │   ├── jwtParser.ts     # JWT 解析
│   │   │   ├── errorHandler.ts  # 全局错误处理
│   │   │   └── asyncHandler.ts  # 异步错误捕获
│   │   ├── config/          # 配置文件
│   │   │   ├── db.ts        # MariaDB (Prisma)
│   │   │   ├── redis.ts     # Redis 缓存配置
│   │   │   ├── qdrant.ts    # Qdrant 向量数据库配置
│   │   │   └── ai.ts        # AI 模型配置
│   │   ├── utils/           # 工具函数
│   │   └── socket/          # Socket.io 服务端
│   ├── prisma/              # Prisma Schema (MariaDB)
│   └── package.json
└── package.json             # 根目录工作区配置
```

## 快速开始

### 环境要求
- Node.js >= 20.19.0
- MongoDB
- MariaDB/MySQL
- Redis
- Ollama (可选，用于 AI 功能)
- Qdrant (可选，用于 RAG 向量检索)

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

# 编辑 .env 文件，配置数据库连接、Redis、Qdrant、Ollama 等信息
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

### RAG 知识库模块
文章内容经智能分块后向量化存入 Qdrant，检索时执行两阶段流程：
1. **粗召回**：用户问题 → Ollama Embedding → Qdrant Cosine 搜索（Top-20）
2. **精排序**：Reranker 预计算 query embedding → 候选文档 embedding（带缓存）→ 余弦相似度融合（Reranker 70% + 原始分数 30%）→ 返回 Top-5
3. **多轮增强**：拼接最近 N 轮用户问题作为检索 query，提升上下文相关性

### AI Agent 模块
基于 LangGraph 构建，Gemma 4 本地模型驱动，集成 10 种工具：
- `searchArticlesTool` / `getCategoriesTool` / `getTagsListTool` / `getTimelineTool`
- `getMusicChartsTool` / `getHotPlaylistsTool`
- `getUserInteractionTool` / `getTreeholeMessagesTool` / `getDailyQuotesTool`

对话标题由 AI 自动总结生成，历史记录支持游标分页。

### 认证模块
- JWT Token 认证（Access Token + Refresh Token）
- Cookie 存储 Refresh Token
- 阿里云短信验证码登录/注册（5 分钟有效期）
- 密码加密存储 (bcrypt)
- Joi 参数校验

### 缓存模块
Redis 五层缓存 + 降级容错：
- Embedding 缓存（7 天）→ 避免 Ollama 重复调用
- RAG 检索结果缓存（1 小时）→ 存 chunkId + score，回查 MongoDB 获取完整数据
- Reranker Embedding 缓存（7 天）→ 避免重复计算文档向量
- 对话历史缓存（5 分钟）→ 减少 MongoDB 读取
- Token 共享缓存（2 小时）→ 主应用与微前端子应用共享认证状态

### 文件上传模块
- 头像上传
- 封面图片上传
- LRC 歌词文件上传
- 文件类型与大小限制

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint + Oxlint 代码规范
- 接口响应统一格式
- 全局错误处理中间件（开发环境返回错误栈，生产环境隐藏）
- 异步操作统一 asyncHandler 包裹
- 路由自动加载（文件名即模块名，挂载到 /api/<module>）
- 参数校验：Joi Schema 验证

## 部署说明

1. 配置生产环境环境变量
2. 构建前端静态资源
3. 编译后端 TypeScript
4. 配置 Nginx 反向代理
5. 启动 MongoDB、MariaDB、Redis、Qdrant
6. 运行后端服务

## 未来规划

- [ ] 文章全文搜索 (Elasticsearch)
- [ ] 服务端渲染 (SSR)
- [ ] 单元测试与 E2E 测试
- [ ] Docker 容器化部署
- [ ] CI/CD 自动化流水线

## 许可证

MIT License
