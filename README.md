# WebTune

WebTune 是一个浏览器扩展，用于收藏互联网上的视频、音频内容，整理成个人歌单，并统一管理与播放。

## 功能定位

- 在任意视频/音频网页点击工具栏图标，一键收藏到歌单
- 创建多个自定义歌单，一条收藏可加入多个歌单
- 类似音乐 App 的主界面：歌单卡片、收藏列表、搜索、排序、底部迷你播放器
- 所有数据保存在本地 `chrome.storage.local`，支持 JSON 导入导出备份
- 个人轻量使用，无云端服务、无账号体系

## 技术栈

- Chrome Extension Manifest V3（兼容 Chromium 系浏览器）
- React 18/19 + TypeScript
- Vite 双构建：主页面/弹窗/Service Worker + 内容脚本（IIFE）
- lucide-react 图标 + 自绘 PNG 扩展图标（无依赖脚本生成）
- 数据层：`chrome.storage.local` + 统一存储访问模块（含版本迁移）

## 项目结构

```
WebTune/
├── public/                 # manifest.json 与图标（构建时自动拷入 dist）
├── scripts/                # generate-icons.mjs（生成扩展 PNG 图标）
├── src/
│   ├── popup/              # 工具栏弹窗
│   ├── pages/              # 首页 / 歌单页 / 设置页
│   ├── components/         # Sidebar / MiniPlayer / EmptyState 等
│   ├── services/           # storage / migration（数据访问层）
│   ├── content/            # media-detector.ts（按需注入的媒体检测）
│   ├── background/         # service-worker.ts（初始化种子数据）
│   ├── types/              # 数据模型
│   ├── utils/              # 工具函数
│   └── styles/             # 设计令牌与全局样式
├── index.html              # 主页面入口
├── popup.html              # 弹窗入口
├── vite.config.ts          # 主构建（页面 + Service Worker）
├── vite.content.config.ts  # 内容脚本构建（IIFE）
└── manifest.json 入口在 public/
```

## 命令

```bash
npm install        # 安装依赖
npm run typecheck  # TypeScript 类型检查
npm run build      # 完整构建（类型检查 + 主构建 + 内容脚本 + 图标），输出 dist/
```

## 在 Chrome 中加载

1. 执行 `npm run build`，生成 `dist/`
2. 打开 Chrome，访问 `chrome://extensions`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目下的 `dist` 目录

## 权限说明

- `storage`：本地保存歌单与收藏数据
- `tabs`：读取当前标签页标题与 URL
- `activeTab`：用户点击图标后获得当前页一次性访问权（不申请全站主机权限）
- `scripting`：按需注入媒体检测脚本

## 开发进度

- [x] 阶段二：项目骨架（React+TS+Vite 双构建、Manifest V3、弹窗/主页面/Service Worker、存储与类型基础设施、图标）
- [ ] 阶段三：收藏流程、歌单管理、收藏列表、搜索、迷你播放器、导入导出
- [ ] 阶段四：测试修复与交付文档
