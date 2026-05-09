# 🚀 快速开始指南

## 新目录结构说明

项目已经重构为更清晰的目录结构：

```
mindgarden/
├── public/                  # 静态资源（浏览器直接访问）
│   └── index.html          # 主应用页面
├── src/                     # 源代码
│   ├── css/                 # 样式文件（已拆分）
│   │   ├── main.css        # 主样式（导入所有模块）
│   │   ├── variables.css   # CSS变量（主题颜色等）
│   │   ├── base.css        # 基础样式
│   │   ├── layout.css      # 布局样式
│   │   ├── components/     # 组件样式
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
├── agent/                   # AI功能
├── scripts/                 # 构建脚本
├── package.json             # 项目配置
└── README.md               # 项目说明
```

## 使用方法

### 方法1：直接打开（最简单）

1. 下载项目
2. 双击打开 `index.html`（会自动跳转到 `public/index.html`）
3. 开始使用！

### 方法2：使用开发服务器（推荐）

```bash
# 1. 安装依赖（只需要一次）
npm install

# 2. 启动开发服务器
npm start

# 3. 打开浏览器访问 http://localhost:8080/public/index.html
```

## 常用命令

```bash
# 启动开发服务器
npm start

# 启动开发服务器（指定端口）
npm run dev

# 拆分CSS文件（如果修改了CSS）
npm run split-css

# 查看项目结构
tree -I node_modules
```

## 如何修改代码

### 修改样式

1. **修改主题颜色**：编辑 `src/css/variables.css`
2. **修改组件样式**：编辑 `src/css/components/` 目录下的对应文件
3. **修改响应式样式**：编辑 `src/css/responsive.css`

### 修改功能

1. **修改配置**：编辑 `src/js/config.js`
2. **修改工具**：编辑 `src/js/tools.js`
3. **修改渲染**：编辑 `src/js/render.js`
4. **修改事件**：编辑 `src/js/events.js`

### 添加新功能

1. **添加新组件**：
   - 在 `src/css/components/` 添加样式文件
   - 在 `src/js/` 添加JavaScript文件
   - 在 `public/index.html` 添加HTML结构

2. **添加新工具**：
   - 在 `src/js/config.js` 添加工具配置
   - 在 `src/js/tools.js` 添加工具函数

## 数据存储

所有数据保存在浏览器的 localStorage 中：
- 存储键名：`mindgarden_data`
- 数据格式：JSON
- 自动保存：每次操作后300ms自动保存

## 常见问题

### Q: 为什么有两个index.html？
A: 根目录的 `index.html` 会自动跳转到 `public/index.html`，这是为了兼容直接打开的方式。

### Q: 如何备份数据？
A: 在应用内的"设置"页面可以导出数据为JSON文件。

### Q: 如何修改AI功能？
A: AI功能在 `agent/` 目录下，需要Python环境，详见 `agent/README.md`。

### Q: 如何部署到服务器？
A: 将 `public/` 目录部署到任何静态文件服务器即可，如 Nginx、Apache、Vercel 等。

## 下一步

- 📖 阅读 [README.md](README.md) 了解完整功能
- 🎨 尝试修改主题颜色
- 🛠️ 添加新的创意工具
- 📱 优化移动端体验

祝你使用愉快！🌱