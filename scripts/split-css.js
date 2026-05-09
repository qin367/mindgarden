#!/usr/bin/env node

/**
 * CSS拆分脚本
 * 将大的CSS文件拆分成多个小文件
 */

const fs = require('fs');
const path = require('path');

const inputFile = 'css/style.css';
const outputDir = 'src/css';

// 读取CSS文件
const cssContent = fs.readFileSync(inputFile, 'utf8');

// 定义CSS部分
const sections = [
  {
    name: 'variables',
    start: '/* ====== CSS 变量：主题系统 ====== */',
    end: '/* ====== 基础重置 ====== */',
    output: 'variables.css'
  },
  {
    name: 'base',
    start: '/* ====== 基础重置 ====== */',
    end: '/* ====== 布局 ====== */',
    output: 'base.css'
  },
  {
    name: 'layout',
    start: '/* ====== 布局 ====== */',
    end: '/* ====== 侧边导航 ====== */',
    output: 'layout.css'
  },
  {
    name: 'sidebar',
    start: '/* ====== 侧边导航 ====== */',
    end: '/* ====== 主内容区 ====== */',
    output: 'components/sidebar.css'
  },
  {
    name: 'main-content',
    start: '/* ====== 主内容区 ====== */',
    end: '/* ====== 苗圃 ====== */',
    output: 'components/main-content.css'
  },
  {
    name: 'nursery',
    start: '/* ====== 苗圃 ====== */',
    end: '/* ====== 灵感列表（种子箱） ====== */',
    output: 'components/nursery.css'
  },
  {
    name: 'seedbox',
    start: '/* ====== 灵感列表（种子箱） ====== */',
    end: '/* ====== 温室工具网格 ====== */',
    output: 'components/seedbox.css'
  },
  {
    name: 'greenhouse',
    start: '/* ====== 温室工具网格 ====== */',
    end: '/* ====== 收获篮卡片 ====== */',
    output: 'components/greenhouse.css'
  },
  {
    name: 'harvest',
    start: '/* ====== 收获篮卡片 ====== */',
    end: '/* ====== 花束 ====== */',
    output: 'components/harvest.css'
  },
  {
    name: 'bouquet',
    start: '/* ====== 花束 ====== */',
    end: '/* ====== 花园地图 ====== */',
    output: 'components/bouquet.css'
  },
  {
    name: 'gardenmap',
    start: '/* ====== 花园地图 ====== */',
    end: '/* ====== 日历 ====== */',
    output: 'components/gardenmap.css'
  },
  {
    name: 'calendar',
    start: '/* ====== 日历 ====== */',
    end: '/* ====== 设置 ====== */',
    output: 'components/calendar.css'
  },
  {
    name: 'settings',
    start: '/* ====== 设置 ====== */',
    end: '/* ====== 模态框 ====== */',
    output: 'components/settings.css'
  },
  {
    name: 'modal',
    start: '/* ====== 模态框 ====== */',
    end: '/* ====== 工具特定的模态框样式 ====== */',
    output: 'components/modal.css'
  }
];

console.log('开始拆分CSS文件...');

// 创建输出目录
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(path.join(outputDir, 'components'))) {
  fs.mkdirSync(path.join(outputDir, 'components'), { recursive: true });
}

// 拆分CSS
sections.forEach(section => {
  const startIndex = cssContent.indexOf(section.start);
  const endIndex = cssContent.indexOf(section.end);

  if (startIndex === -1) {
    console.log(`未找到开始标记: ${section.start}`);
    return;
  }

  const endPos = endIndex === -1 ? cssContent.length : endIndex;
  const sectionContent = cssContent.substring(startIndex, endPos);

  const outputPath = path.join(outputDir, section.output);
  fs.writeFileSync(outputPath, sectionContent);
  console.log(`已创建: ${outputPath}`);
});

// 创建剩余部分的CSS（模态框之后的内容）
const modalStart = cssContent.indexOf('/* ====== 模态框 ====== */');
if (modalStart !== -1) {
  const remainingContent = cssContent.substring(modalStart);
  const responsivePath = path.join(outputDir, 'responsive.css');
  fs.writeFileSync(responsivePath, remainingContent);
  console.log(`已创建: ${responsivePath}`);
}

console.log('CSS拆分完成！');