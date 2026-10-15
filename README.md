# WebTune

WebTune 是一个浏览器扩展，用于收藏互联网上的视频、音频内容，整理成个人歌单，并统一管理与播放。

> 完整交付文档（目录说明、加载步骤、功能测试步骤、边界场景清单、播放限制、后续扩展建议）见 [`交付文档.md`](./交付文档.md)。

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
npm install         # 安装依赖
npm run typecheck   # TypeScript 类型检查
npm run build       # 完整构建（类型检查 + 主构建 + 内容脚本 + 图标），输出 dist/
npm run test:services  # 数据层核心逻辑测试（去重/多歌单/删除引用/备份往返/迁移容错）
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
- [x] 阶段三：P0/P1 核心功能（弹窗收藏流程、歌单 CRUD、多歌单归属、去重、搜索筛选排序、迷你播放器与队列、内容类型识别、导入导出备份）
- [x] 阶段四：测试修复与交付文档（边界场景实测通过、交付文档见上）

## 当前功能范围

- 弹窗：读取当前标签页标题/URL/favicon，按需注入脚本检测视频/音频与封面；一键收藏到已有歌单或新建歌单；同歌单同 URL 自动去重；成功后提示
- 主界面：首页（正在播放、歌单卡片、最近添加）、全部收藏/最近添加/稍后收听/我的歌单视图、歌单增删改、收藏编辑/备注/类型修正/加入多个歌单/从歌单移除/彻底删除（带确认）
- 播放：底部迷你播放器（封面/标题/网站、上一首/下一首、随机/循环、当前歌单、展开播放队列）；点击内容设为当前项并在原网站打开
- 数据：全部存于 chrome.storage.local，弹窗与主页面通过 storage.onChanged 实时同步；JSON 导入/导出备份（导入前校验格式）；结构版本迁移与旧数据容错

## 播放限制（已知且如实呈现）

- 不同网站的媒体受跨域、版权、登录等限制，插件不做穿透：无法在插件内直接播放的内容统一“在原网站播放”，播放器不显示虚假进度
- 内容脚本为按需注入（activeTab 权限），chrome:// 等受限页面仅保存页面信息
- 若原始链接失效，收藏记录会保留，仅打开失败时由浏览器提示
