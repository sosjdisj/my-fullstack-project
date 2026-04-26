# Project2 - 基于 Vue 3 + TypeScript + 微前端的社区博客平台

> 一个采用现代前端技术栈构建的社区博客平台，具备微前端架构、实时通信、AI 集成等企业级特性，专为展示全栈前端开发能力而设计。

## 技术栈

### 核心框架
- **Vue 3.5** - 采用 Composition API 和 `<script setup>` 语法
- **TypeScript 5.9** - 完整类型支持，类型安全开发
- **Vite 7** - 下一代前端构建工具，极速开发体验

### 状态与路由
- **Pinia** - Vue 3 官方推荐的状态管理方案
- **Vue Router 4** - 声明式路由，支持路由懒加载

### UI 与样式
- **Element Plus** - 企业级 UI 组件库
- **Less** - CSS 预处理器
- **@fortawesome/fontawesome-free** - 图标库

### 微前端
- **@micro-zoe/micro-app** - 轻量级微前端框架，实现应用级解耦

### 通信与实时
- **Axios** - HTTP 请求封装
- **Socket.IO Client** - WebSocket 实时通信
- **@microsoft/fetch-event-source** - SSE (Server-Sent Events) 支持

### 特色功能库
- **danmaku & vue3-danmaku** - 弹幕系统实现
- **marked** - Markdown 渲染引擎
- **DOMPurify** - XSS 防护与 HTML 净化
- **GSAP** - 高性能动画库

### 开发与质量保障
- **MSW (Mock Service Worker)** - API 层 Mock 方案
- **ESLint + oxlint** - 代码规范与质量检查
- **vue-tsc** - Vue 组件类型检查

## 项目亮点

### 1. 微前端架构设计
采用 **@micro-zoe/micro-app** 实现主应用与微应用的解耦：
- 主应用负责整体布局和路由管理
- 音乐播放器作为独立微应用运行在 `micro-app` 目录
- 主微应用独立开发、独立部署，通过 MicroApp 框架集成
- 实现技术栈无关的微前端通信机制

### 2. Vue 3 Composition API + TypeScript
- 全面使用 `<script setup>` 语法，代码更简洁
- 完整的 TypeScript 类型定义，提升代码可维护性
- 响应式系统深度应用 `ref`、`reactive`、`computed` 等 API
- 自定义组合式函数封装可复用逻辑

### 3. 实时通信能力
- **WebSocket (Socket.IO)** - 实现即时消息推送和实时交互
- **SSE (Server-Sent Events)** - 支持服务端单向数据推送
- 适用于聊天室、通知系统、AI 流式响应等场景

### 4. 弹幕系统
- 集成 `danmaku` 实现高性能弹幕渲染
- 支持弹幕发送、暂停、速度调节等功能
- Canvas 渲染保证流畅度，适用于视频互动场景

### 5. 内容安全与渲染
- **Markdown 渲染** - 使用 `marked` 解析 Markdown 内容
- **XSS 防护** - 通过 `DOMPurify` 过滤恶意脚本，确保内容安全
- 适用于文章编辑、评论系统等需要富文本展示的场景

### 6. 动画与交互体验
- 集成 **GSAP** 实现复杂动画效果
- 页面转场、元素交互动画提升用户体验
- 高性能动画引擎，支持时间轴控制

### 7. 工程化与代码质量
- **ESLint + oxlint** 双引擎代码检查
- **vue-tsc** 类型检查，确保类型安全
- **MSW** 前后端并行开发，提升开发效率
- 完整的 Lint 脚本，自动化代码规范检查

## 项目结构

```
project2/
├── micro-app/              # 微应用（音乐播放器）
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── src/
│   ├── api/                # API 接口封装
│   ├── assets/             # 静态资源
│   ├── components/
│   │   ├── business/       # 业务组件
│   │   │   └── home/       # 首页相关组件
│   │   └── layout/         # 布局组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia 状态管理
│   ├── views/              # 页面视图
│   │   ├── Home/           # 首页
│   │   ├── Login/          # 登录页
│   │   ├── Register/       # 注册页
│   │   ├── ArticleDetail/  # 文章详情
│   │   ├── CategoryTagList/# 分类标签
│   │   ├── SearchResult/   # 搜索结果
│   │   ├── Setting/        # 设置页
│   │   ├── Treehole/       # 树洞
│   │   └── Timeline/       # 时间轴
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── eslint.config.ts        # ESLint 配置
└── package.json
```

## 功能模块

### 用户系统
- 用户注册 / 登录
- 个人信息设置

### 内容系统
- 首页内容展示（文章列表、热门标签、随机推荐）
- 文章详情页
- 分类与标签浏览
- 搜索功能

### 互动功能
- 树洞（匿名社交）
- 时间轴（历史记录）
- 实时通信

### 微应用
- 独立音乐播放器

## 快速开始

### 环境要求
- Node.js: `^20.19.0 || >=22.12.0`
- 包管理器: npm / yarn / pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

启动主应用：
```bash
npm run dev
```

启动微应用（新终端）：
```bash
cd micro-app
npm run dev
```

或使用一键启动脚本：
```bash
start-all.bat
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
# 运行所有 lint
npm run lint

# TypeScript 类型检查
npm run type-check
```

### 预览生产构建

```bash
npm run preview
```

## 脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热重载） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run build-only` | 仅生产构建 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run lint` | 运行所有代码检查 |
| `npm run preview` | 预览生产构建 |

## 面试技术要点

### 本项目的技术深度体现在：

1. **微前端架构** - 掌握应用级拆分、跨应用通信、独立部署方案
2. **Vue 3 响应式原理** - 深入理解 Composition API、响应式系统、生命周期
3. **TypeScript 工程实践** - 完整类型系统、泛型应用、类型推导
4. **实时通信方案** - WebSocket vs SSE 选型、连接管理、重连机制
5. **性能优化** - 路由懒加载、组件异步加载、动画性能优化
6. **安全防护** - XSS 防护、DOMPurify 应用、内容安全策略
7. **工程化能力** - Vite 配置、ESLint 规则、CI/CD 流程
8. **状态管理** - Pinia 模块化设计、持久化存储、组件间通信

## License

MIT
