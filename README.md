# 🌱 MindGarden 创意花园

一个**纯本地、离线可用**的私人创意管理应用。温暖田园手账风格，灵感来自园艺日志和植物图鉴。

## 功能

- **苗圃** — 捕捉灵感，记录心情和标签
- **种子箱** — 管理所有灵感，归档、筛选、培育
- **思维温室** — 8 种创意工具激发新想法
- **收获篮** — 收集和管理点子
- **花束** — 项目级整理，支持 Markdown 导出
- **花园地图** — 灵感树可视化
- **手账日历** — 按日期回顾创意
- **设置** — 主题切换、数据导入/导出、AI API 配置

## 目录结构

```
mindgarden/
├── public/                  # 静态资源
│   └── index.html          # 主应用页面
├── src/                     # 源代码
│   ├── css/                 # 样式文件
│   │   ├── main.css        # 主样式文件
│   │   ├── variables.css   # CSS变量
│   │   ├── base.css        # 基础样式
│   │   ├── layout.css      # 布局样式
│   │   ├── components/     # 组件样式
│   │   │   ├── sidebar.css
│   │   │   ├── main-content.css
│   │   │   ├── nursery.css
│   │   │   ├── seedbox.css
│   │   │   ├── greenhouse.css
│   │   │   ├── harvest.css
│   │   │   ├── bouquet.css
│   │   │   ├── gardenmap.css
│   │   │   ├── calendar.css
│   │   │   ├── settings.css
│   │   │   └── modal.css
│   │   └── responsive.css  # 响应式样式
│   ├── js/                  # JavaScript文件
│   │   ├── config.js       # 配置文件
│   │   ├── utils.js        # 工具函数
│   │   ├── modal.js        # 模态框功能
│   │   ├── state.js        # 状态管理
│   │   ├── render.js       # 渲染功能
│   │   ├── tools.js        # 创意工具
│   │   ├── export.js       # 导出功能
│   │   ├── events.js       # 事件处理
│   │   └── main.js         # 主入口
│   └── assets/              # 资源文件
│       ├── images/         # 图片
│       ├── icons/          # 图标
│       └── fonts/          # 字体
├── agent/                   # AI功能
│   ├── idea_generator.py   # AI创意生成器
│   └── requirements.txt    # Python依赖
├── scripts/                 # 构建脚本
│   └── split-css.js        # CSS拆分脚本
├── docs/                    # 文档
├── tests/                   # 测试文件
├── package.json             # 项目配置
├── index.html              # 入口文件（重定向）
└── README.md               # 项目说明
```

## 使用方法

### 快速开始（无需安装）

1. 下载项目
2. 直接在浏览器打开 `index.html` 即可使用

### 使用开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 技术栈

- 纯 HTML + CSS + JavaScript（ES2020+）
- 无外部依赖
- localStorage 数据持久化
- AI 深度扩展（可选）：兼容 OpenAI API / Ollama

## 开发指南

### 添加新功能

1. **添加新组件**：
   - 在 `src/css/components/` 添加样式文件
   - 在 `src/js/` 添加JavaScript文件
   - 在 `public/index.html` 添加HTML结构

2. **修改主题**：
   - 编辑 `src/css/variables.css` 修改CSS变量

3. **添加新工具**：
   - 在 `src/js/tools.js` 添加工具函数
   - 在 `src/js/config.js` 添加工具配置

### 构建和部署

```bash
# 拆分CSS文件（可选）
npm run split-css

# 启动生产服务器
npx serve public -l 8080
```

## 数据存储

所有数据保存在浏览器的 localStorage 中：
- 存储键名：`mindgarden_data`
- 数据格式：JSON
- 自动保存：每次操作后300ms自动保存
- 数据版本：支持版本迁移

## AI功能（可选）

### 环境要求

- Python 3.7+
- requests库

### 配置

```bash
# 安装Python依赖
cd agent
pip install -r requirements.txt

# 设置环境变量
export API_ENDPOINT="http://localhost:11434/v1/chat/completions"
export API_KEY="your-api-key"
export API_MODEL="gpt-3.5-turbo"
```

### 使用

```bash
# 交互式模式
python agent/idea_generator.py

# 指定工具
python agent/idea_generator.py --tool reverse "你的灵感文本"
```

## 许可

MIT