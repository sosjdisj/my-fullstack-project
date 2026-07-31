# My Blog - 全栈博客系统

一个基于 Vue 3 + Spring Boot + Python AI 的现代化全栈博客平台，集成 RAG 检索增强生成、ReAct Agent、实时通讯、音乐播放器等丰富功能。

## 项目亮点

- **RAG 检索增强生成**：文章智能分块 → Ollama Embedding 向量化 → Qdrant 向量存储 → 两阶段检索（向量召回 + Reranker 精排）→ 上下文注入 Prompt
- **ReAct Agent 架构**：基于 LangChain 构建 ReAct (Reasoning + Acting) Agent，集成 9 种工具，支持多轮推理、并行工具调用与流式输出
- **多语言微服务架构**：Java (Spring Boot) 主业务服务 + Python (FastAPI) AI 服务，SSE 流式通信 + HTTP 同步调用
- **Redis 多层缓存体系**：Embedding / RAG 检索结果 / Reranker Embedding / 对话历史 / Token 共五层缓存，含降级容错策略
- **三数据库协同**：MongoDB（文档存储）+ MySQL/MyBatis-Plus（关系型用户数据）+ Qdrant（向量检索）
- **前后端分离 + 微前端**：Monorepo 管理，Micro-app 集成音乐子应用
- 完整的用户认证体系（JWT + 阿里云短信验证码）

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **UI 组件库**: Element Plus + shadcn-vue (reka-ui) + Lucide Icons + Font Awesome
- **路由**: Vue Router（路由懒加载）
- **样式**: Tailwind CSS + Less + 玻璃拟态设计
- **动画**: GSAP + ScrollTrigger + Three.js + motion-v
- **实时通讯**: Socket.io Client
- **微前端**: Micro-app
- **弹幕**: vue-danmaku
- **安全**: DOMPurify（XSS 防护）
- **流式响应**: @microsoft/fetch-event-source
- **Markdown**: marked
- **工具库**: @vueuse/core
- **Mock**: MSW (Mock Service Worker)
- **代码规范**: ESLint + Oxlint

### 后端（Java 主服务）
- **框架**: Spring Boot 3.5
- **语言**: Java 24
- **关系型数据库**: MySQL (MyBatis-Plus)
- **文档数据库**: MongoDB (Spring Data MongoDB)
- **缓存**: Redis (Spring Data Redis)
- **实时通讯**: Socket.IO (netty-socketio)
- **认证**: JWT (jjwt) + BCrypt
- **短信服务**: 阿里云 SMS SDK
- **参数校验**: Spring Validation
- **工具**: Lombok

### 后端（Python AI 服务）
- **框架**: FastAPI + Uvicorn
- **AI 框架**: LangChain + LangChain Ollama
- **Agent 架构**: ReAct Agent（多轮推理 + 并行工具调用 + 流式输出）
- **AI 模型**: Ollama (Qwen3:8b 本地大模型 + embeddinggemma 向量模型)
- **向量数据库**: Qdrant (qdrant-client)
- **Reranker**: sentence-transformers (ms-marco-MiniLM-L-6-v2)
- **异步 MongoDB**: Motor (Async PyMongo)
- **缓存**: Redis
- **流式响应**: SSE (sse-starlette)
- **HTTP 客户端**: httpx（调用 Java 后端 API）

## 功能特性

### 核心功能
- 文章发布、编辑、分类管理
- 标签系统与文章关联
- 用户注册/登录/找回密码（支持短信验证码）
- 个人中心与资料管理
- 文章评论、点赞与收藏
- 文章搜索（关键词搜索、热门标题推荐）

### RAG 知识库系统
- 文章智能分块：优先 Markdown 标题切分，长段落回退到滑动窗口（512 token/50 token 重叠）
- 向量化存储：Ollama embeddinggemma:300m 生成 Embedding → Qdrant Cosine 向量索引
- 两阶段检索：Qdrant 向量召回（Top-20 候选）→ ms-marco-MiniLM-L-6-v2 Reranker 精排（Top-5）
- 多轮对话上下文：提取最近 N 轮用户问题拼接，提升检索相关性
- 知识库自动初始化：应用启动时检测 Qdrant，为空则全量重建

### AI 智能助手
- 基于 ReAct 模式的 Agent 架构，支持多轮推理（Thought → Action → Observation 循环）
- 集成 9 种工具：
  - 文章搜索 / 分类列表 / 标签列表 / 时间线查询
  - 歌曲排行榜 / 歌单推荐
  - 用户互动查询 / 树洞消息 / 每日名言
- 支持并行工具调用（单轮可同时调用多个工具，节省推理轮数）
- 流式输出：最终回答通过 LLM astream 逐 token 流式推送前端
- 对话标题自动生成（AI 总结首条消息）
- 对话历史持久化（游标分页向上加载）
- RAG + Agent 协同：博客内容问题走 RAG 检索，数据查询走工具调用

### 树洞/弹幕系统
- 匿名弹幕发送与实时展示（vue-danmaku）
- 消息审核机制（PENDING → APPROVED / REJECTED）
- 发送频率限制（10 秒内限发一条）
- 玻璃拟态 UI + 弹幕浮动动画

### 音乐播放器（微前端子应用）
- 歌单管理与收藏
- 歌曲点赞与排行榜
- LRC 歌词解析与同步展示
- 歌词文件上传（.lrc 格式）

### Redis 缓存体系
- Embedding 缓存（24 小时 TTL，文本不变可复用）
- RAG 检索结果缓存（1 小时 TTL）
- Reranker 文档 Embedding 缓存
- 对话历史缓存
- 跨应用 Token 共享缓存
- 降级策略：Redis 异常时自动降级为直接计算，不影响核心流程

### 实时功能
- 全站在线用户数统计与广播
- 文章阅读房间（加入/离开）+ 实时读者数更新
- Socket.IO 连接/断开自动管理

### 搜索功能
- 文章关键词搜索（标题正则匹配 + 分页）
- 热门搜索标题推荐（按浏览量排序）

### 其他特性
- 响应式布局设计
- 无限滚动加载（IntersectionObserver）
- 图片懒加载（自定义 v-lazy-bg 指令）
- Markdown 渲染支持
- 每日名言模块
- 表单验证 Composable（统一校验逻辑）
- 验证码倒计时（持久化恢复，页面刷新不丢失）
- Three.js 3D 视觉效果

## 项目结构

```
my-fullstack-project/
├── frontend/                     # Vue 3 前端项目
│   ├── src/
│   │   ├── components/           # 组件
│   │   │   ├── business/         # 业务组件
│   │   │   ├── layout/           # 布局组件
│   │   │   └── ui/               # UI 组件 (shadcn-vue + 自定义)
│   │   ├── views/                # 页面视图
│   │   │   ├── Home/             # 首页（文章流+信息面板）
│   │   │   ├── ArticleDetail/    # 文章详情
│   │   │   ├── ArticleListByCategory/  # 分类文章列表
│   │   │   ├── CategoryTagList/  # 分类/标签索引
│   │   │   ├── Timeline/         # 时间轴
│   │   │   ├── Treehole/         # 树洞弹幕
│   │   │   ├── AiChat/           # AI 助手
│   │   │   ├── SearchResult/     # 搜索结果
│   │   │   ├── Setting/          # 设置
│   │   │   ├── FullProfile/      # 个人主页
│   │   │   ├── Login/            # 登录
│   │   │   ├── Register/         # 注册
│   │   │   └── Reset/            # 重置密码
│   │   ├── api/                  # API 接口封装
│   │   ├── stores/               # Pinia 状态管理
│   │   ├── router/               # 路由配置（懒加载）
│   │   ├── composables/          # 组合式函数
│   │   ├── directives/           # 自定义指令（v-lazy-bg）
│   │   ├── socket/               # Socket.io 客户端
│   │   ├── mock/                 # MSW Mock 数据
│   │   ├── lib/                  # 工具库 (shadcn-vue utils)
│   │   ├── styles/               # 全局样式 (Less + Tailwind)
│   │   └── utils/                # 工具函数
│   └── package.json
├── backend/
│   ├── java-backend/             # Spring Boot 主业务服务
│   │   ├── src/main/java/com/example/demo/
│   │   │   ├── controller/       # REST 控制器
│   │   │   ├── service/          # 业务逻辑层
│   │   │   ├── model/
│   │   │   │   ├── mongo/        # MongoDB 文档模型
│   │   │   │   └── mysql/        # MySQL 关系模型
│   │   │   ├── repository/
│   │   │   │   ├── mongo/        # MongoDB 数据访问层
│   │   │   │   └── mysql/        # MySQL 数据访问层
│   │   │   ├── middleware/       # JWT 中间件
│   │   │   ├── config/           # 配置类 (Redis, SocketIO, CORS)
│   │   │   ├── websocket/        # Socket.IO 处理器
│   │   │   └── common/          # 公共类 (ApiResponse, 异常处理)
│   │   ├── src/main/resources/
│   │   │   ├── application.yml       # 主配置
│   │   │   └── application-local.yml # 本地环境配置
│   │   └── pom.xml
│   └── ai-service/               # Python AI 微服务
│       ├── services/
│       │   ├── react_agent.py    # ReAct Agent 核心
│       │   ├── agent.py          # Agent 工具编排
│       │   ├── rag.py            # RAG 检索主流程
│       │   ├── embedding.py      # 向量化服务
│       │   ├── reranker.py       # Reranker 重排序
│       │   ├── article_chunk.py  # 文章分块与知识库管理
│       │   └── evaluation.py     # Agent 评估
│       ├── tools/                # Agent 工具定义（9 个工具）
│       ├── routers/              # FastAPI 路由
│       ├── config.py             # 配置管理
│       ├── main.py               # FastAPI 入口
│       └── requirements.txt
└── package.json                  # 根目录工作区配置
```

## 快速开始

### 环境要求
- Node.js >= 20.19.0
- Java >= 24
- Python >= 3.12
- MongoDB
- MySQL
- Redis
- Ollama (可选，用于 AI 功能)
- Qdrant (可选，用于 RAG 向量检索)

### 安装依赖

```bash
# 安装前端依赖
npm install

# Java 后端依赖（Maven 自动下载）
cd backend/java-backend && ./mvnw install

# Python AI 服务依赖
cd backend/ai-service
python -m venv venv
venv/Scripts/pip install -r requirements.txt
```

### 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 配置 Java 后端本地环境
cp backend/java-backend/.env.example backend/java-backend/.env

# 配置 Python AI 服务环境
cp backend/ai-service/.env.example backend/ai-service/.env
```

### 启动开发服务器

```bash
# 同时启动前端 + Java 后端 + Python AI 服务（推荐）
npm run dev

# 或分别启动
npm run dev:frontend
npm run dev:java
npm run dev:python
```

前端访问: http://localhost:5173
Java 后端: http://localhost:3001
Python AI 服务: http://localhost:8000

### 构建生产环境

```bash
# 构建前端
npm run build

# 构建 Java 后端
cd backend/java-backend && ./mvnw package
```

## 核心模块说明

### RAG 知识库模块
文章内容经智能分块后向量化存入 Qdrant，检索时执行两阶段流程：
1. **粗召回**：用户问题 → Ollama Embedding → Qdrant Cosine 搜索（Top-20）
2. **精排序**：Reranker 预计算 query embedding → 候选文档 embedding（带缓存）→ 余弦相似度融合（Reranker 70% + 原始分数 30%）→ 返回 Top-5
3. **多轮增强**：拼接最近 N 轮用户问题作为检索 query，提升上下文相关性

### AI Agent 模块
基于 ReAct (Reasoning + Acting) 模式构建，Qwen3:8b 本地模型驱动，集成 9 种工具：
- `searchArticlesTool` / `getCategoriesTool` / `getTagsListTool` / `getTimelineTool`
- `getMusicChartsTool` / `getHotPlaylistsTool`
- `getUserInteractionTool` / `getTreeholeMessagesTool` / `getDailyQuotesTool`

推理流程：Thought(思考) → Action(并行调用工具) → Observation(观察结果) → 循环直到 Final Answer，最多 5 轮。

对话标题由 AI 自动总结生成，历史记录支持游标分页。

### 认证模块
- JWT Token 认证（Access Token + Refresh Token）
- Cookie 存储 Refresh Token
- 阿里云短信验证码登录/注册（5 分钟有效期）
- 密码加密存储 (BCrypt)
- Spring Validation 参数校验

### 缓存模块
Redis 多层缓存 + 降级容错：
- Embedding 缓存 → 避免 Ollama 重复调用
- RAG 检索结果缓存 → 存 chunkId + score，回查 MongoDB 获取完整数据
- Reranker Embedding 缓存 → 避免重复计算文档向量
- 对话历史缓存 → 减少 MongoDB 读取
- Token 共享缓存 → 主应用与微前端子应用共享认证状态

### 文件上传模块
- 头像上传
- 封面图片上传
- LRC 歌词文件上传
- 文件类型与大小限制

## 开发规范

- 前端使用 TypeScript 严格模式，后端使用 Java + Lombok
- 遵循 ESLint + Oxlint 代码规范（前端）
- 接口响应统一格式 (ApiResponse)
- 全局异常处理 (GlobalExceptionHandler)
- JWT 中间件统一鉴权
- Spring Validation 参数校验
- Python AI 服务使用 python-dotenv 配置管理

## 部署说明

1. 配置生产环境环境变量
2. 构建前端静态资源
3. 构建 Java 后端 JAR 包
4. 配置 Nginx 反向代理
5. 启动 MongoDB、MySQL、Redis、Qdrant
6. 运行 Java 后端服务 + Python AI 服务

## 未来规划

- [ ] 文章全文搜索 (Elasticsearch)
- [ ] 单元测试与 E2E 测试
- [ ] Docker 容器化部署
- [ ] CI/CD 自动化流水线

## 许可证

MIT License
