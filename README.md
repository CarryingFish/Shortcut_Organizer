# 快捷方式管理器（Shortcut Organizer）

## 项目简介

本项目是一个基于 Electron + React + TypeScript 的桌面应用，旨在帮助用户高效管理本地应用、文件、脚本等快捷方式，并支持自定义分类、图标、颜色、搜索、数据持久化等功能。适用于 Windows、macOS、Linux 跨平台使用。

## 主要功能

- 快捷方式分组管理：支持自定义分类、图标、颜色
- 快捷方式一键启动：点击即可运行本地应用/脚本/文件
- 分类与快捷方式的增删改查
- 支持快捷方式拖动移动到其他分类
- 支持快捷方式和分类的搜索
- 支持深色/浅色主题切换
- 数据持久化存储，应用关闭后数据不会丢失
- 系统托盘支持，窗口可最小化到托盘
- 友好的现代化 UI/UX

## 技术栈

- Electron（桌面端壳，主进程/渲染进程）
- React 18 + TypeScript（前端 UI）
- TailwindCSS（UI 样式）
- better-sqlite3（数据持久化，或简化文件存储）
- Framer Motion、Recharts、Sonner、uuid、zod 等

## 目录结构

```
├── electron/                # Electron 主进程相关
│   ├── main.js              # 主进程入口，窗口/托盘/IPC/存储
│   ├── preload.js           # 预加载脚本，暴露安全API
│   ├── simpleStorage.js     # 简化文件存储实现
│   └── database.js          # SQLite 数据库实现（可选）
├── src/                     # 前端源码
│   ├── components/          # 主要UI组件
│   ├── contexts/            # React Context（全局状态/数据）
│   ├── hooks/               # 自定义Hooks
│   ├── lib/                 # 工具库/存储适配
│   ├── pages/               # 页面组件
│   ├── types/               # 类型定义
│   └── main.tsx             # 前端入口
├── index.html               # 前端HTML模板
├── package.json             # 项目依赖与脚本
├── electron-builder.json    # Electron 打包配置
├── SIMPLE_STORAGE_README.md # 简化存储系统说明
└── ...
```

## 安装与本地开发

### 环境准备
- 安装 [Node.js](https://nodejs.org/)（推荐 LTS 版本）

### 操作步骤

1. **安装依赖**
   ```sh
   npm install
   ```
2. **启动开发模式（调试）**
   ```sh
   npm run dev
   ```
   这会同时启动 Vite 开发服务器和 Electron 应用，支持热重载。
3. **构建生产版本**
   ```sh
   npm run build
   ```
   构建前端代码到 `dist/static` 目录。
4. **预览生产版本**
   ```sh
   npm run preview
   ```
   构建并启动 Electron 应用预览生产版本。

## 数据存储说明

- 默认采用简化文件存储（见 `electron/simpleStorage.js` 和 `SIMPLE_STORAGE_README.md`），所有数据（分类、快捷方式、设置）均以 JSON 文件形式保存在用户主目录的 `.shortcut-organizer` 文件夹下。
- 支持 SQLite 数据库存储（如环境支持），可扩展。
- 数据持久化，应用关闭后数据不会丢失。

## 常见问题

- 如遇数据未保存、加载失败等问题，请参考 `SIMPLE_STORAGE_README.md` 文档中的“故障排除”部分。

## 许可证

MIT

---

如需反馈或贡献，欢迎访问 [项目主页](https://space.coze.cn/task/7540821264341500214) 或提交 Issue。
