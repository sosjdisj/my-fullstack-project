<div align="center">

# My Blog · 全栈博客系统

> 基于 Vue 3 + Spring Boot + Python AI 的现代化全栈博客平台，集成 RAG 检索增强生成、ReAct Agent、实时通讯与微前端音乐播放器

</div>

<div align="center">

> 📌 **本项目为个人学习 / 作品展示用途**，未部署到公网，**本地运行即可体验完整功能**。

</div>

<p align="center">
  <img src="https://img.shields.io/badge/项目类型-全栈-blueviolet?style=flat-square" alt="项目类型" />
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs&logoColor=white" alt="Vue" />
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5-6db33f?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-文档型-47a248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/MySQL-关系型-4479a1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redis-缓存-dc382d?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Qdrant-向量库-dc382d?style=flat-square" alt="Qdrant" />
  <img src="https://img.shields.io/badge/LangChain-Agent-1c3c3c?style=flat-square&logo=langchain&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/Ollama-本地大模型-22b8cf?style=flat-square" alt="Ollama" />
  <img src="https://img.shields.io/badge/Socket.IO-实时通讯-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

---

## 📝 项目简介

**一句话定义**：一个把"博客内容创作 → AI 智能问答 → 实时互动"端到端打通的全栈项目。

**背景与解决的问题**：传统的博客系统通常只解决"内容发布"这一件事，AI 问答往往与业务数据割裂。本项目想验证一个问题——能否让 AI 助手真正"读懂"博客内容、并能主动调用业务接口回答用户问题？因此采用了 **RAG 检索增强 + ReAct Agent 工具调用** 的双轨架构，并配合多语言微服务（Java 主业务 + Python AI 服务）+ 微前端（博客主应用 + 音乐子应用）的方式落地。整个过程涉及向量检索、流式推理、实时通讯、多数据库协同等典型后端工程难题，是一份覆盖前后端完整链路的练手作品。

---

## 🛠 技术栈

### 前端（博客主应用 + 音乐微前端子应用）

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3.5 + TypeScript + Vite 7 |
| 状态管理 | Pinia |
| UI 组件 | Element Plus + shadcn-vue (reka-ui) + Lucide Icons + Font Awesome |
| 样式 | Tailwind CSS 4 + Less + 玻璃拟态设计 |
| 动效 | GSAP + ScrollTrigger + Three.js + motion-v |
| 实时通讯 | Socket.IO Client |
| 微前端 | Micro-app |
| 流式响应 | @microsoft/fetch-event-source |
| 安全 | DOMPurify（XSS 防护） |
| Markdown | marked |
| Mock | MSW（Mock Service Worker） |
| 规范 | ESLint + Oxlint |

### 后端 · Java 主业务服务

| 类别 | 选型 |
| --- | --- |
| 框架 | Spring Boot 3.5（Java 24） |
| 关系型数据库 | MySQL + MyBatis-Plus |
| 文档数据库 | MongoDB + Spring Data MongoDB |
| 缓存 | Redis + Spring Data Redis |
| 实时通讯 | Socket.IO（netty-socketio 2.0.x） |
| 认证 | JWT（jjwt）+ BCrypt |
| 短信 | 阿里云 SMS SDK |
| 校验 | Spring Validation |
| 工程 | Lombok |

### 后端 · Python AI 微服务

| 类别 | 选型 |
| --- | --- |
| 框架 | FastAPI + Uvicorn |
| AI 框架 | LangChain + LangChain Ollama |
| 大模型 | Ollama 本地：Qwen3:8b（对话）+ embeddinggemma:300m（向量化） |
| 向量库 | Qdrant |
| Reranker | sentence-transformers（ms-marco-MiniLM-L-6-v2） |
| 异步 MongoDB | Motor（Async PyMongo） |
| 流式响应 | SSE（sse-starlette） |
| 跨服务调用 | httpx（同步 HTTP 调用 Java REST API） |

---

## ✨ 功能特性

### 内容创作与管理
- **文章系统**：发布 / 编辑 / 分类管理 / 标签关联，支持 Markdown 渲染
- **时间轴**：按发布时间线展示历史文章
- **搜索**：关键词搜索 + 热门标题推荐（按浏览量排序）

### AI 智能助手（核心亮点）
- **RAG 知识库问答**：基于博客内容做检索增强生成，回答"博客里写过什么"
- **ReAct Agent 工具调用**：集成 9 种业务工具，回答"现在有哪些热门歌曲、最新文章"
- **流式输出**：token 级别实时推送，首字延迟低
- **多轮对话**：上下文连续 + 标题自动生成 + 历史记录游标分页

### 实时互动
- **树洞弹幕**：匿名发送 + 玻璃拟态 UI + 弹幕浮动动画
- **阅读房间**：进入文章详情时显示"当前 X 人正在阅读"
- **在线统计**：全站在线用户数实时广播

### 音乐播放器（微前端子应用）
- 歌单管理 / 收藏 / 歌曲点赞排行榜
- LRC 歌词解析与同步展示
- 歌词文件上传（.lrc 格式）

### 用户体系
- 注册 / 登录 / 找回密码（阿里云短信验证码）
- JWT 双 Token（Access + Refresh）
- 个人中心与资料管理

---

## 🎯 项目亮点

> **每条按"做了什么 + 解决什么问题"的格式说明**，避免堆砌技术名词。

### 1. RAG 检索增强生成 · 让 AI 真正"读懂"博客内容
**做了什么**：将文章按 Markdown 标题智能分块 → Ollama Embedding 向量化 → 存入 Qdrant → 检索时执行「Qdrant 粗召回 Top-20 + Reranker 精排 Top-5」两阶段流程，并拼接最近 N 轮用户问题增强上下文相关性。
**带来的效果**：AI 助手可以基于博客真实内容回答问题，避免大模型幻觉；Reranker 精排显著提升检索准确性，多轮上下文让连续提问的回答更连贯。

### 2. ReAct Agent 架构 · 让 AI 主动调用业务接口
**做了什么**：基于 LangChain 构建 ReAct（Reasoning + Acting）Agent，集成 9 种业务工具（文章搜索、分类/标签列表、歌曲排行榜、歌单推荐、树洞、每日名言等），支持单轮并行调用多个工具，最多 5 轮推理收敛。
**带来的效果**：AI 助手不仅会"读"，还会"做"——能直接查询当前热门歌曲、最新文章、用户互动数据，把静态博客变成可对话、可查询的智能站点。

### 3. Redis 五层缓存 + 降级容错 · 性能与稳定性兼顾
**做了什么**：构建 Embedding / RAG 检索结果 / Reranker Embedding / 对话历史 / Token 共五层 Redis 缓存（如 Embedding 缓存用 SHA-256 前 16 位防碰撞），并设计降级策略——Redis 异常时自动回退到直接计算。
**带来的效果**：避免重复调用 Ollama 与 Reranker 模型，显著降低响应延迟；即便缓存层故障，核心流程依然可用，不会被基础设施异常拖垮。

### 4. 三数据库协同 + 多语言微服务 · 复杂业务的真实工程实践
**做了什么**：MongoDB 存文档（文章 / 评论 / 树洞）、MySQL 存关系型用户数据、Qdrant 存向量；Java（Spring Boot）负责主业务、Python（FastAPI）负责 AI，二者通过 HTTP 同步调用 + SSE 流式推送协作。
**带来的效果**：每种数据落在最适合它的存储里，避免"一库打天下"的性能瓶颈；AI 与业务解耦，Python 服务可独立迭代而不影响主站稳定性。

### 5. 微前端 + Monorepo · 主应用与子应用解耦
**做了什么**：用 npm workspaces 管理 Monorepo，通过 Micro-app 把音乐播放器作为独立子应用集成进博客主应用，并实现跨应用 Token 共享。
**带来的效果**：音乐模块独立开发、独立部署，不污染主应用代码库；用户在博客与音乐间切换无需重新登录。

### 6. 流式 + 实时双通道通信 · 体验顺滑
**做了什么**：AI 回答用 SSE 流式推送（@microsoft/fetch-event-source + sse-starlette），实时互动用 Socket.IO（在线人数、阅读房间、弹幕）。
**带来的效果**：AI 回答像 ChatGPT 一样逐字出现，首字延迟低；阅读文章时能看到"还有谁在同时看这篇文章"，强化社区感。

---

## 📸 功能展示

> 以下为各核心模块的截图占位，建议录制 GIF 或上传演示视频以增强展示效果。

| 模块 | 展示内容建议 |
| --- | --- |
| 🏠 首页 | 文章流 + 右侧信息面板（热门标签、随机文章、数字时钟）的整体布局 |
| 📖 文章详情 | Markdown 渲染 + 评论 + 点赞收藏 + "X 人正在阅读"实时读者数 |
| 🤖 AI 助手 | ReAct Agent 推理过程 + 流式输出 + 工具调用结果展示 |
| 🎵 音乐播放器 | 歌单列表 + LRC 歌词同步滚动 + 播放控制 |
| 🕳️ 树洞弹幕 | 玻璃拟态 UI + 弹幕浮动动画 |
| ⏱️ 时间轴 | 按时间线展示历史文章 |
| 🔐 登录注册 | 短信验证码 + 表单校验交互 |

<!-- 建议在此处插入 GIF 或截图，例如：

![首页演示](docs/demo-home.gif)
![AI 对话演示](docs/demo-ai-chat.gif)
-->

---

## 🚀 快速开始

> ⚠️ **本项目未部署到公网，本地运行即可体验完整功能。**

### 环境要求

| 依赖 | 版本 | 用途 |
| --- | --- | --- |
| Node.js | `>= 20.19.0` | 前端构建 |
| Java | `24` | Java 后端运行 |
| Python | `>= 3.12` | Python AI 服务 |
| MongoDB | 最新稳定版 | 文档型数据存储（需开启 Replica Set 模式以支持事务） |
| MySQL | 8.x | 关系型用户数据 |
| Redis | 最新稳定版 | 多层缓存 |
| Ollama | 最新版 | 本地大模型（Qwen3:8b + embeddinggemma:300m） |
| Qdrant | 最新版 | 向量检索（可选，缺失则 AI 检索功能不可用） |

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd my-fullstack-project
```

### 2. 配置环境变量

```bash
# 根目录
cp .env.example .env

# Java 后端
cp backend/java-backend/.env.example backend/java-backend/.env

# Python AI 服务
cp backend/ai-service/.env.example backend/ai-service/.env
```

> 按各 `.env.example` 中的注释填写 MongoDB URI、MySQL 密码、JWT Secret、阿里云短信配置等。AI 服务所需的 Ollama 与 Qdrant 地址也在此配置。

### 3. 拉取本地 AI 模型（可选，AI 功能所需）

```bash
ollama pull qwen3:8b
ollama pull embeddinggemma:300m
```

### 4. 安装依赖

```bash
# 前端依赖（Monorepo 一键安装）
npm install

# Java 后端依赖（Maven 自动下载）
cd backend/java-backend && ./mvnw install && cd ../../..          # macOS / Linux
cd backend/java-backend; .\mvnw.cmd install; cd ..\..\..           # Windows PowerShell

# Python AI 服务依赖
cd backend/ai-service
python -m venv venv
venv/Scripts/pip install -r requirements.txt   # Windows
# venv/bin/pip install -r requirements.txt      # macOS / Linux
cd ../../..
```

### 5. 启动开发服务器

```bash
# 一键同时启动前端 + Java 后端 + Python AI 服务（推荐）
npm run dev

# 或分别启动
npm run dev:frontend   # 仅前端
npm run dev:java       # 仅 Java 后端
npm run dev:python     # 仅 Python AI 服务
```

启动后访问：

| 服务 | 地址 |
| --- | --- |
| 博客主应用 | http://localhost:5173 |
| 音乐子应用 | http://localhost:5175 |
| Java 后端 API | http://localhost:3001 |
| Socket.IO 服务 | http://localhost:3002 |
| Python AI 服务 | http://localhost:8000 |

### 6. 构建生产环境（可选）

```bash
# 构建前端
npm run build

# 构建 Java 后端 JAR
cd backend/java-backend && ./mvnw package                         # macOS / Linux
cd backend/java-backend; .\mvnw.cmd package                       # Windows PowerShell
```

---

## 📂 目录结构

```
my-fullstack-project/
├── frontend/                          # 前端 Monorepo
│   ├── main-app/                      # 博客主应用（Vue 3）
│   │   └── src/
│   │       ├── views/                 # 页面视图（每个页面含 index.vue + useXxx.ts 逻辑分离）
│   │       │   ├── Home/              # 首页（文章流 + 信息面板）
│   │       │   ├── ArticleDetail/     # 文章详情
│   │       │   ├── AiChat/            # AI 智能助手
│   │       │   ├── Treehole/         # 树洞弹幕
│   │       │   ├── Timeline/          # 时间轴
│   │       │   └── ...
│   │       ├── components/            # 组件（business / layout / ui）
│   │       ├── composables/           # 组合式函数（表单校验、Socket、倒计时等）
│   │       ├── api/                   # Axios 封装
│   │       ├── stores/                # Pinia 状态管理
│   │       ├── socket/                # Socket.IO 客户端
│   │       └── directives/            # 自定义指令（v-lazy-bg 图片懒加载）
│   └── sub-apps/
│       └── app-a/                     # 音乐播放器微前端子应用
│           └── src/views/             # MusicHall / MusicPlayer / MyMusic / LyricsPage ...
│
├── backend/
│   ├── java-backend/                  # Spring Boot 主业务服务
│   │   └── src/main/java/com/example/demo/
│   │       ├── controller/            # REST 控制器（14 个）
│   │       ├── service/               # 业务逻辑层
│   │       ├── config/                # 配置（CORS / Redis / SocketIO / SecurityHeaders）
│   │       ├── websocket/             # Socket.IO 处理器
│   │       ├── middleware/             # JWT 鉴权中间件
│   │       └── common/                 # 统一响应 / 全局异常 / 限流
│   └── ai-service/                    # Python FastAPI AI 服务
│       ├── services/
│       │   ├── react_agent.py        # ReAct Agent 核心
│       │   ├── rag.py                # RAG 检索主流程
│       │   ├── embedding.py          # 向量化服务
│       │   ├── reranker.py           # Reranker 重排序
│       │   ├── article_chunk.py      # 文章分块与知识库管理
│       │   └── evaluation.py         # Agent 工具调用效果评测
│       ├── tools/                     # Agent 工具定义（9 个）
│       └── routers/                   # FastAPI 路由
│
├── .env.example                       # 根环境变量模板
└── package.json                       # Monorepo 工作区配置
```

---

## 🔌 API 接口

> Java 后端统一返回 `ApiResponse<T>` 格式，全局异常处理由 `GlobalExceptionHandler` 兜底。

| 模块 | 关键端点 | 说明 |
| --- | --- | --- |
| 认证 | `POST /api/auth/register` `login` `send-code` `reset-password` | 注册 / 登录 / 短信验证码 / 重置密码 |
| 文章 | `GET /api/articles` `POST /api/articles` `GET /api/articles/{id}` | 列表 / 发布 / 详情 |
| 分类标签 | `GET /api/categories` `GET /api/tags` | 分类与标签列表 |
| 评论 | `POST /api/comments` `GET /api/comments/{articleId}` | 评论发布与查询 |
| 树洞 | `POST /api/treehole` `GET /api/treehole` | 弹幕发送与拉取 |
| 搜索 | `GET /api/search?q=` `GET /api/search/hot` | 关键词搜索 + 热门标题 |
| 歌曲歌单 | `GET /api/songs` `GET /api/playlists` | 音乐子应用数据 |
| AI 对话 | `POST /api/ai/chat/stream`（SSE） | 流式 AI 对话 |
| 用户 | `GET /api/profile` `PUT /api/profile` | 个人资料 |
| 时间轴 | `GET /api/timeline` | 按时间线查询文章 |

> 完整的接口字段定义请参考各 `Controller` 类的参数校验注解（Spring Validation）。

---

## 📊 性能与架构数据

| 维度 | 数据 / 设计 |
| --- | --- |
| RAG 检索召回 | Qdrant 向量召回 Top-20 候选 |
| RAG 精排 | Reranker 重排后取 Top-5 注入 Prompt |
| Reranker 加速 | 预计算 query embedding 一次 + 文档 embedding 缓存，融合相似度（Reranker 70% + 原始分数 30%） |
| Embedding 缓存 | Redis SHA-256（前 16 位）防碰撞，TTL 24 小时 |
| Agent 收敛 | 单轮支持并行工具调用，最多 5 轮推理 |
| 文章分块策略 | Markdown 标题优先 → 滑动窗口（512 token / 128 重叠）回退 |
| 缓存降级 | Redis 异常时自动回退到直接计算，核心流程不中断 |
| 数据库事务 | MongoDB Replica Set 模式，跨集合操作使用事务（如点赞、知识库重建） |
| 防并发 | 点赞采用 `findOneAndUpdate` 原子操作，避免竞态条件 |
| 索引优化 | 用户互动集合建立 `{userId, 目标ID}` 复合唯一索引；查询热点字段建立索引 |

---

## 🔮 未来计划

- [ ] 接入 Elasticsearch 实现文章全文搜索（当前为正则匹配）
- [ ] 补充单元测试与 E2E 测试覆盖
- [ ] Docker Compose 一键容器化部署
- [ ] GitHub Actions CI/CD 自动化流水线
- [ ] Agent 工具调用效果评测体系完善
- [ ] 移动端响应式适配优化

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

> 本项目为个人学习 / 作品展示用途，所涉及的阿里云短信、AI 模型等第三方服务需使用者自行配置账号与密钥。

<div align="center">

**如果这个项目对你有启发，欢迎 ⭐ Star 支持！**

</div>
