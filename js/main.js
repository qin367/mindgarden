/* ================================================================
   MindGarden 创意花园 — 完整应用逻辑
   ================================================================
   架构：IIFE（立即执行函数），状态驱动渲染，事件委托
   数据：全部存储在 localStorage，键 'mindgarden_data'
   ================================================================ */
(function() {
  'use strict';

  // ================================================================
  // 常量配置
  // ================================================================

  const STORAGE_KEY = 'mindgarden_data';

  // 温室工具定义（8个创意工具）
  const TOOLS = [
    {
      id: 'reverse',
      icon: '🔄',
      name: '逆向花园',
      desc: '先想怎么搞砸，再反转成金点子',
      guide: '在这个花园里，我们先尽情思考 "如何把它搞砸"。破坏比创造容易——而每个破坏方案的反面，都藏着一个好点子。'
    },
    {
      id: 'scamper',
      icon: '🧬',
      name: '嫁接实验室',
      desc: 'SCAMPER 创意模版，七种角度改造灵感',
      guide: '就像植物嫁接一样，把你的灵感与不同的思维方式结合，会长出意想不到的新品种。'
    },
    {
      id: 'extreme',
      icon: '⚡',
      name: '极限温室',
      desc: '极端条件逼迫非常规创意',
      guide: '在极端环境下，普通植物会变异出惊人的特性。给你一个极端条件，看你的创意会如何进化。'
    },
    {
      id: 'analogy',
      icon: '🌿',
      name: '自然类比',
      desc: '向大自然借用智慧',
      guide: '自然已经用 38 亿年时间解决了无数问题。蚂蚁、蜘蛛、菌丝——每一种生物都是天才发明家。'
    },
    {
      id: 'firstprinciples',
      icon: '🧅',
      name: '本源之土',
      desc: '第一性原理剥洋葱，找到根本',
      guide: '像剥洋葱一样，一层层剥开表象，触及问题的核心。每一层追问，都让你离本质更近一步。'
    },
    {
      id: 'pollen',
      icon: '🌸',
      name: '随机花粉',
      desc: '随机词汇强制关联，催生意外灵感',
      guide: '风会把花粉带到遥远的地方，在那里开出新的花。让随机词汇与你的灵感碰撞，产生奇妙的化学反应。'
    },
    {
      id: 'hats',
      icon: '🎩',
      name: '六顶思考帽',
      desc: '六种思维视角切换',
      guide: '戴上不同颜色的帽子，就换了一种看世界的方式。事实、情感、风险、创意……每个角度都是拼图的一块。'
    },
    {
      id: 'sandbox',
      icon: '🏖️',
      name: '空想沙盘',
      desc: '自由书写，让思绪流淌',
      guide: '一片没有边界的沙地，让思绪像水一样自由流淌。偶尔飘来的词语是风中的种子，会在你的想象中生根发芽。'
    }
  ];

  // 极限条件库
  const EXTREME_CONDITIONS = [
    '预算为 0 元',
    '必须在 10 秒内完成',
    '在深海中实现',
    '回到童年，用 7 岁的眼光',
    '只能用一种材料',
    '在沙漠中',
    '用户是一只猫',
    '在月球上',
    '所有东西都要能食用',
    '只能用声音和光线',
    '在暴风雨中',
    '为 100 年后的世界设计'
  ];

  // 自然现象库
  const NATURE_PHENOMENA = [
    { title: '🐜 蚂蚁调度', desc: '蚂蚁通过信息素找到最短路径，形成高效的运输网络。每个个体只知道简单规则，整体却涌现出惊人的智慧。' },
    { title: '🕷️ 蜘蛛织网', desc: '蜘蛛丝比钢铁还坚固，比尼龙还有弹性。蜘蛛从无到有编织出精密的几何结构，捕捉看不见的飞虫。' },
    { title: '🍄 菌丝网络', desc: '地下的菌丝网络像互联网一样连接着森林中的树木，传递养分和信号。古老、庞大、默默无闻。' },
    { title: '🐝 蜜蜂筑巢', desc: '六边形蜂巢用最少的材料提供最大的空间和强度。蜂群通过舞蹈传递复杂的位置信息。' },
    { title: '🌻 向日葵螺旋', desc: '向日葵种子以斐波那契数列排列，每一颗都得到最大限度的阳光和空间。' },
    { title: '🦎 壁虎攀爬', desc: '壁虎的脚掌有数百万根纳米级的刚毛，利用范德华力吸附在任何表面——不需要胶水，不留痕迹。' }
  ];

  // SCAMPER 标签定义
  const SCAMPER_TAGS = [
    { key: 'S', label: '替代', question: '可以用什么代替？换个材料、换个场景、换个用户？' },
    { key: 'C', label: '组合', question: '能和什么混合或组合？功能合并、跨界联姻？' },
    { key: 'A', label: '适应', question: '可以借鉴什么东西来适应？有什么类似的情况可以参考？' },
    { key: 'M', label: '修改', question: '放大、缩小、改变形状？改变颜色、声音、意义？' },
    { key: 'P', label: '他用', question: '换个用途会怎样？还能做什么别的事？谁还可能用？' },
    { key: 'E', label: '消除', question: '去掉什么会更好？简化、压缩、减到极致？' },
    { key: 'R', label: '重排', question: '颠倒顺序、反向思考、重组部件？时间表倒过来？' }
  ];

  // 花粉词库（随机词汇）
  const POLLEN_WORDS = [
    '月亮', '咖啡渍', '旧毛衣', '北极光', '气泡',
    '纸飞机', '回声', '蒲公英', '琥珀', '潮汐',
    '苔藓', '影子', '篝火', '露珠', '风筝线',
    '涟漪', '羽毛', '钟摆', '茧', '漂流瓶',
    '年轮', '雾', '焰火', '漩涡', '结绳',
    '蝉壳', '浮冰', '孔明灯', '沙漏', '罗盘',
    '稗子', '墨迹', '残雪', '萤火虫', '鲸歌'
  ];

  // 六顶帽子定义
  const HATS = [
    { key: 'white', label: '白帽子 · 事实', color: '#7f8c8d', question: '我们拥有什么信息？还缺什么？怎么获得？' },
    { key: 'red', label: '红帽子 · 情感', color: '#e74c3c', question: '你的直觉是什么？不用论证，说出真实感受。' },
    { key: 'black', label: '黑帽子 · 风险', color: '#2c3e50', question: '哪里可能出错？潜在的问题和风险是什么？' },
    { key: 'yellow', label: '黄帽子 · 价值', color: '#f39c12', question: '积极的一面是什么？这个机会的价值在哪？' },
    { key: 'green', label: '绿帽子 · 创意', color: '#27ae60', question: '有什么新想法？跳出框框，越天马行空越好。' },
    { key: 'blue', label: '蓝帽子 · 过程', color: '#2980b9', question: '我们思考了哪些方面？下一步该做什么？' }
  ];

  // 空想沙盘引导词
  const SANDBOX_WORDS = [
    '如果时间可以倒流……',
    '最小的改变带来最大的不同……',
    '没有人看见的地方……',
    '它其实可以是另一种东西……',
    '缝隙里藏着……',
    '当所有人都不看好的时候……',
    '第一次……',
    '最熟悉的陌生感……',
    '边界之外是什么？',
    '把声音变成颜色……',
    '慢下来，再慢下来……',
    '如果它不是为人类设计的……',
    '遗忘的东西又回来了……',
    '反向生长……',
    '在寂静中听到……'
  ];

  // 早安 / 午安 / 晚安
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return '夜深了，你的灵感还在发光';
    if (h < 9) return '早安，花园里来了新的灵感';
    if (h < 12) return '上午好，创意的种子正在发芽';
    if (h < 14) return '午后的阳光，最适合胡思乱想';
    if (h < 18) return '下午好，记得给灵感浇浇水';
    if (h < 21) return '傍晚了，摘一朵灵感带回家';
    return '夜晚是灵感的温室';
  };

  // ================================================================
  // 工具函数
  // ================================================================

  /** 生成短 UID */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /** 格式化日期为友好字符串 */
  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 172800000) return '昨天';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前';
    return `${d.getMonth()+1}月${d.getDate()}日`;
  };

  /** 格式化日期为 YYYY-MM-DD */
  const toDateStr = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  /** 解析 #标签 */
  const parseTags = (str) => {
    if (!str || !str.trim()) return [];
    return str.split('#').map(t => t.trim()).filter(t => t.length > 0);
  };

  /** Toast 通知 */
  const toast = (msg) => {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 2500);
  };

  /** 更新问候语和主题按钮 */
  const updateTopBar = () => {
    document.getElementById('greeting').innerHTML = `<strong>${getGreeting()}</strong> 🌱`;
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.textContent = state.settings.theme === 'dark' ? '☀️' : '🌙';
  };

  // ================================================================
  // 状态管理
  // ================================================================

  /** 默认设置 */
  const defaultSettings = {
    theme: 'light',
    apiEndpoint: 'http://localhost:11434/v1/chat/completions',
    apiKey: '',
    apiModel: 'gpt-3.5-turbo'
  };

  /** 示例数据：让首次打开就有丰富的花园 */
  const createSampleData = () => {
    const now = Date.now();
    const day = 86400000;

    const inspirations = [
      { id: uid(), content: '傍晚的风吹过窗台的花，突然想做一个关于时间的装置——不是显示时间，而是让人感受到时间。', mood: '😌', tags: ['灵感', '装置'], createdAt: new Date(now - 2*day).toISOString(), archived: false },
      { id: uid(), content: '如果把城市的灯光做成可以穿在身上的衣服，会不会让夜晚变得温柔？', mood: '🤔', tags: ['设计', '时尚'], createdAt: new Date(now - 3*day).toISOString(), archived: false },
      { id: uid(), content: '在雨天的咖啡馆里，听到隔壁桌说起童年的纸飞机。突然觉得很多好的设计，都有童年的影子。', mood: '😢', tags: ['回忆', '童年'], createdAt: new Date(now - 5*day).toISOString(), archived: false },
      { id: uid(), content: '今天看到蜘蛛网上的露珠，像是自然编织的项链。每个节点都恰到好处。', mood: '😌', tags: ['自然', '首饰'], createdAt: new Date(now - 7*day).toISOString(), archived: false },
      { id: uid(), content: '如果用菌丝体做包装材料，是不是可以减少泡沫污染？真菌可能是环保的答案。', mood: '🔥', tags: ['环保', '材料'], createdAt: new Date(now - 8*day).toISOString(), archived: false },
      { id: uid(), content: '海浪的声音总是让人平静，想做一个能听到海声的枕头。城市里需要自然的白噪音。', mood: '😆', tags: ['产品', '睡眠'], createdAt: new Date(now - 12*day).toISOString(), archived: false },
      { id: uid(), content: '旧毛衣拆了可以做成什么？毛线画的质感很特别，像印象派的笔触。', mood: '🤔', tags: ['手作', '再生'], createdAt: new Date(now - 14*day).toISOString(), archived: false },
      { id: uid(), content: '蚂蚁搬运食物的路线像是一个高效的物流系统。它们不需要地图，却能找到最优路径。', mood: '🌊', tags: ['自然', '系统'], createdAt: new Date(now - 20*day).toISOString(), archived: false },
      { id: uid(), content: '月亮在不同文化中都是诗的源头。想做一个月相日历，记录情绪和月亮一起变化。', mood: '😌', tags: ['文化', '设计'], createdAt: new Date(now - 22*day).toISOString(), archived: false },
      { id: uid(), content: '咖啡渍在纸上晕开的样子像一幅水墨画。日常的意外，常常是最美的。', mood: '🔥', tags: ['艺术', '日常'], createdAt: new Date(now - 30*day).toISOString(), archived: false }
    ];

    const ideas = [
      { id: uid(), inspirationId: inspirations[0].id, content: '做一个显示"情绪时间"的钟——用不同颜色代表不同时刻的情绪。早上是清澈的蓝，午后是暖橙，深夜是深紫。指针走的不是均匀的速度，而是跟着你的感受走。', tool: '逆向花园', liked: true, tags: ['产品', '情感'], projectId: null, createdAt: new Date(now - 1*day).toISOString() },
      { id: uid(), inspirationId: inspirations[1].id, content: '温度感应变色服装：在衣服中编织温感纤维，让服装随体温和外界温度变化而改变颜色。聚会时大家靠在一起，接触的地方会变成暖色。', tool: '嫁接实验室', liked: false, tags: ['时尚', '科技'], projectId: null, createdAt: new Date(now - 1*day).toISOString() },
      { id: uid(), inspirationId: inspirations[4].id, content: '用回收塑料瓶做灯罩，手机闪光灯做光源，纸箱做结构——一个零成本的氛围灯。粗糙但温暖。', tool: '极限温室', liked: true, tags: ['环保', '手作'], projectId: null, createdAt: new Date(now - 2*day).toISOString() },
      { id: uid(), inspirationId: inspirations[7].id, content: '像菌丝网络一样，做一个去中心化的知识分享平台。每个节点都能独立生长，又通过地下网络连接。没有中心服务器，每个人都是自己数据的根系。', tool: '自然类比', liked: false, tags: ['科技', '社区'], projectId: null, createdAt: new Date(now - 3*day).toISOString() },
      { id: uid(), inspirationId: inspirations[6].id, content: '用咖啡渍把旧毛衣染成自然的暖棕色，拆了重新织——每一件都是独一无二的渐变。线的纹理里藏着咖啡的香气。', tool: '随机花粉', liked: false, tags: ['手作', '再生'], projectId: null, createdAt: new Date(now - 3*day).toISOString() },
      { id: uid(), inspirationId: null, content: '想象一个完全靠声音导航的城市。每条街道有独特的音景，转角有特定的回声，广场是交响乐。盲人在这里比看得见的人更自在。', tool: '六顶思考帽', liked: false, tags: ['设计', '未来'], projectId: null, createdAt: new Date(now - 5*day).toISOString() }
    ];

    const projects = [
      {
        id: uid(), name: '时间的形状', description: '关于时间感知的一系列创作——让时间变得可见、可触、可感。',
        ideaIds: [ideas[0].id], inspirationIds: [inspirations[0].id, inspirations[8].id],
        notes: '这个系列想要探索的是：时间不只是线性的流逝，它可以是情绪、是颜色、是声音。\n下一步可以做一个 Time Feeling 的展览。',
        createdAt: new Date(now - 1*day).toISOString()
      },
      {
        id: uid(), name: '日常再生计划', description: '用日常废弃物创造新价值——从旧毛衣到咖啡渣，每一样都值得第二次生命。',
        ideaIds: [ideas[2].id, ideas[4].id], inspirationIds: [inspirations[4].id, inspirations[6].id],
        notes: '这个计划的核心不是"环保"，而是"珍惜"。当你有感情地对待物品，自然就不想扔掉它们了。',
        createdAt: new Date(now - 2*day).toISOString()
      }
    ];

    return { inspirations, ideas, projects };
  };

  /** 全局状态 */
  let state = {
    inspirations: [],
    ideas: [],
    projects: [],
    settings: { ...defaultSettings },
    currentView: 'nursery',
    // UI 状态
    nursery: { mood: null, tags: '', content: '', filterTag: null },
    seedbox: { filterTag: null, showArchived: false },
    greenhouse: { activeInspirationId: null },
    calendar: { year: new Date().getFullYear(), month: new Date().getMonth(), selectedDate: null },
    bouquetDetail: null // 当前查看的花束 ID
  };

  /** 保存到 localStorage */
  const save = () => {
    try {
      const data = {
        inspirations: state.inspirations,
        ideas: state.ideas,
        projects: state.projects,
        settings: state.settings
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('保存失败:', e);
    }
  };

  /** 从 localStorage 加载，无数据则用示例 */
  const load = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        state.inspirations = data.inspirations || [];
        state.ideas = data.ideas || [];
        state.projects = data.projects || [];
        state.settings = { ...defaultSettings, ...(data.settings || {}) };
      } else {
        // 首次使用：加载示例数据
        const sample = createSampleData();
        state.inspirations = sample.inspirations;
        state.ideas = sample.ideas;
        state.projects = sample.projects;
        save();
      }
    } catch (e) {
      console.warn('加载失败，使用示例数据:', e);
      const sample = createSampleData();
      state.inspirations = sample.inspirations;
      state.ideas = sample.ideas;
      state.projects = sample.projects;
    }
    // 设置主题
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  };

  // ================================================================
  // 模态框系统
  // ================================================================

  let modalResolve = null; // 用于 Promise 式模态框

  /** 打开模态框 */
  const openModal = (title, subtitle, bodyHTML, actionsHTML) => {
    return new Promise((resolve) => {
      modalResolve = resolve;
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalSubtitle').textContent = subtitle || '';
      document.getElementById('modalBody').innerHTML = bodyHTML || '';
      document.getElementById('modalActions').innerHTML = actionsHTML || '';
      document.getElementById('modalOverlay').classList.add('open');
      // 聚焦第一个输入
      const firstInput = document.querySelector('#modalBody textarea, #modalBody input');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    });
  };

  /** 关闭模态框 */
  const closeModal = (result) => {
    // 清除沙盘定时器
    if (toolState.sandboxTimer) { clearInterval(toolState.sandboxTimer); toolState.sandboxTimer = null; }
    document.getElementById('modalOverlay').classList.remove('open');
    if (modalResolve) { modalResolve(result); modalResolve = null; }
  };

  // ================================================================
  // 渲染函数：每个视图一个
  // ================================================================

  /** 主渲染入口 */
  const render = () => {
    const container = document.getElementById('view-container');
    switch (state.currentView) {
      case 'nursery': container.innerHTML = renderNursery(); break;
      case 'seedbox': container.innerHTML = renderSeedBox(); break;
      case 'greenhouse': container.innerHTML = renderGreenhouse(); break;
      case 'harvest': container.innerHTML = renderHarvest(); break;
      case 'bouquet': container.innerHTML = state.bouquetDetail ? renderBouquetDetail() : renderBouquetList(); break;
      case 'gardenmap': container.innerHTML = renderGardenMap(); break;
      case 'calendar': container.innerHTML = renderCalendar(); break;
      case 'settings': container.innerHTML = renderSettings(); break;
      default: container.innerHTML = renderNursery();
    }
    // 更新导航高亮
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === state.currentView);
    });
    updateTopBar();
  };

  // ==================== 苗圃 ====================

  const renderNursery = () => {
    // 获取所有非归档灵感，按时间倒序
    const items = state.inspirations.filter(i => !i.archived);
    // 收集所有标签用于筛选
    const allTags = [...new Set(items.flatMap(i => i.tags))];
    const filterTag = state.nursery.filterTag;

    // 如果有筛选标签
    const filtered = filterTag ? items.filter(i => i.tags.includes(filterTag)) : items;

    const listHTML = filtered.length > 0
      ? filtered.map(insp => `
        <div class="inspiration-item" data-id="${insp.id}">
          <div class="inspiration-header">
            <span class="inspiration-mood">${insp.mood || '🤍'}</span>
            <span class="inspiration-time">${formatDate(insp.createdAt)}</span>
          </div>
          <div class="inspiration-content">${escapeHtml(insp.content)}</div>
          <div class="inspiration-tags">${insp.tags.map(t => `<span class="inspiration-tag">#${escapeHtml(t)}</span>`).join('')}</div>
          <div class="inspiration-actions">
            <button class="btn btn-sm btn-primary" data-action="cultivate" data-id="${insp.id}">🌱 培育</button>
            <button class="btn btn-sm btn-ghost" data-action="edit-inspiration" data-id="${insp.id}">✏️ 编辑</button>
            <button class="btn btn-sm btn-ghost" data-action="archive-inspiration" data-id="${insp.id}">📦 归档</button>
          </div>
        </div>
      `).join('')
      : '<div class="empty-state"><div class="empty-icon">🌱</div><p>还没有灵感，种下第一颗种子吧</p></div>';

    // 标签筛选栏
    const filterBar = allTags.length > 0 ? `
      <div class="filter-bar">
        <button class="filter-tag ${!filterTag ? 'active' : ''}" data-action="filter-tag" data-tag="">全部</button>
        ${allTags.map(t => `<button class="filter-tag ${filterTag === t ? 'active' : ''}" data-action="filter-tag" data-tag="${t}">#${t}</button>`).join('')}
      </div>
    ` : '';

    return `
      <div class="nursery-input-card">
        <div class="mood-selector" id="moodSelector">
          ${['😌', '😆', '🤔', '😢', '🔥', '🌊'].map(m => `
            <button class="mood-btn ${state.nursery.mood === m ? 'active' : ''}" data-action="select-mood" data-mood="${m}">${m}</button>
          `).join('')}
        </div>
        <textarea class="nursery-textarea" id="nurseryContent" placeholder="今天风里有什么味道？记下来吧……" rows="3">${escapeHtml(state.nursery.content)}</textarea>
        <div class="nursery-tags-row">
          <input class="tag-input" id="nurseryTags" placeholder="#标签 用 # 分割" value="${escapeHtml(state.nursery.tags)}">
          <button class="btn btn-primary" data-action="save-inspiration">🌱 种下灵感</button>
        </div>
      </div>
      <h3 style="font-size:1rem;color:var(--text-secondary);margin-bottom:12px;">🌰 种子箱 · 最近的灵感</h3>
      ${filterBar}
      <div class="inspiration-list">${listHTML}</div>
    `;
  };

  // ==================== 种子箱 ====================

  const renderSeedBox = () => {
    // 所有灵感（包括归档），按时间倒序
    const items = [...state.inspirations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filtered = state.seedbox.showArchived ? items : items.filter(i => !i.archived);
    // 收集标签
    const allTags = [...new Set(items.flatMap(i => i.tags))];
    const filterTag = state.seedbox.filterTag;
    const final = filterTag ? filtered.filter(i => i.tags.includes(filterTag)) : filtered;

    const listHTML = final.length > 0
      ? final.map(insp => `
        <div class="inspiration-item ${insp.archived ? 'archived' : ''}" data-id="${insp.id}">
          <div class="inspiration-header">
            <span class="inspiration-mood">${insp.mood || '🤍'}</span>
            <span class="inspiration-time">${formatDate(insp.createdAt)} · ${new Date(insp.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <div class="inspiration-content">${escapeHtml(insp.content)}</div>
          <div class="inspiration-tags">${insp.tags.map(t => `<span class="inspiration-tag">#${escapeHtml(t)}</span>`).join('')}</div>
          ${insp.archived ? '<span style="font-size:0.8rem;color:var(--text-muted);">📦 已归档</span>' : ''}
          <div class="inspiration-actions">
            <button class="btn btn-sm btn-primary" data-action="cultivate" data-id="${insp.id}">🌱 培育</button>
            <button class="btn btn-sm btn-ghost" data-action="edit-inspiration" data-id="${insp.id}">✏️ 编辑</button>
            ${insp.archived
              ? `<button class="btn btn-sm btn-ghost" data-action="unarchive-inspiration" data-id="${insp.id}">📂 恢复</button>`
              : `<button class="btn btn-sm btn-ghost" data-action="archive-inspiration" data-id="${insp.id}">📦 归档</button>`
            }
            <button class="btn btn-sm btn-danger" data-action="delete-inspiration" data-id="${insp.id}">🗑️ 删除</button>
          </div>
        </div>
      `).join('')
      : '<div class="empty-state"><div class="empty-icon">🌰</div><p>种子箱是空的，去苗圃种点灵感吧</p></div>';

    const filterBar = allTags.length > 0 ? `
      <div class="filter-bar">
        <button class="filter-tag ${!filterTag ? 'active' : ''}" data-action="sfilter-tag" data-tag="">全部</button>
        ${allTags.map(t => `<button class="filter-tag ${filterTag === t ? 'active' : ''}" data-action="sfilter-tag" data-tag="${t}">#${t}</button>`).join('')}
      </div>
    ` : '';

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:1.1rem;">🌰 种子箱 · 所有灵感</h3>
        <label style="font-size:0.9rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" ${state.seedbox.showArchived ? 'checked' : ''} data-action="toggle-archived"> 显示已归档
        </label>
      </div>
      ${filterBar}
      <div class="inspiration-list">${listHTML}</div>
    `;
  };

  // ==================== 思维温室 ====================

  const renderGreenhouse = () => {
    const activeInsp = state.greenhouse.activeInspirationId
      ? state.inspirations.find(i => i.id === state.greenhouse.activeInspirationId)
      : null;

    return `
      ${activeInsp ? `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 6px var(--shadow);">
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">🌱 当前培育的灵感</div>
          <div style="font-size:0.95rem;color:var(--text-primary);">${escapeHtml(activeInsp.content)}</div>
          <div style="margin-top:8px;">
            <button class="btn btn-sm btn-ghost" data-action="clear-active-inspiration">清除选择</button>
          </div>
        </div>
      ` : `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 6px var(--shadow);text-align:center;color:var(--text-muted);font-size:0.9rem;">
          💡 从苗圃或种子箱点击 "🌱 培育" 带上一个灵感，或直接用下面的工具自由创造
        </div>
      `}
      <div class="tool-grid">
        ${TOOLS.map((t, i) => `
          <div class="tool-card" data-action="open-tool" data-tool-index="${i}">
            <div class="tool-icon">${t.icon}</div>
            <div class="tool-name">${t.name}</div>
            <div class="tool-desc">${t.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  // ==================== 收获篮 ====================

  const renderHarvest = () => {
    // 按时间倒序
    const items = [...state.ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const projects = state.projects;

    const listHTML = items.length > 0
      ? items.map(idea => {
          const proj = idea.projectId ? projects.find(p => p.id === idea.projectId) : null;
          return `
          <div class="idea-card ${idea.liked ? 'liked' : ''}" data-id="${idea.id}">
            <span class="idea-tool-label">🔬 ${escapeHtml(idea.tool)}</span>
            ${proj ? `<span style="font-size:0.75rem;color:var(--accent-terracotta);margin-left:6px;">💐 ${escapeHtml(proj.name)}</span>` : ''}
            <div class="idea-content">${escapeHtml(idea.content)}</div>
            <div class="idea-tags" style="margin-bottom:8px;">
              ${idea.tags.map(t => `<span class="inspiration-tag">#${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="idea-actions">
              <button class="btn btn-sm ${idea.liked ? 'btn-terracotta' : 'btn-ghost'}" data-action="toggle-like" data-id="${idea.id}">${idea.liked ? '❤️' : '🤍'} 喜欢</button>
              <button class="btn btn-sm btn-ghost" data-action="edit-idea" data-id="${idea.id}">✏️</button>
              <select class="form-input" style="width:auto;padding:4px 8px;font-size:0.8rem;" data-action="idea-project" data-id="${idea.id}">
                <option value="">📁 归入花束</option>
                ${projects.map(p => `<option value="${p.id}" ${idea.projectId === p.id ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('')}
              </select>
              <button class="btn btn-sm btn-ghost" data-action="delete-idea" data-id="${idea.id}">🗑️</button>
              <span class="idea-time">${formatDate(idea.createdAt)}</span>
            </div>
          </div>
        `}).join('')
      : '<div class="empty-state"><div class="empty-icon">🧺</div><p>收获篮还空着，去温室培育一些点子吧</p></div>';

    return `
      <h3 style="font-size:1.1rem;margin-bottom:16px;">🧺 收获篮 · 所有点子 (${items.length})</h3>
      <div class="idea-grid">${listHTML}</div>
    `;
  };

  // ==================== 花束 ====================

  const renderBouquetList = () => {
    const items = state.projects;
    const listHTML = items.length > 0
      ? items.map(p => {
          const ideaCount = p.ideaIds.length;
          const inspCount = p.inspirationIds.length;
          return `
          <div class="bouquet-card">
            <div class="bouquet-header">
              <span class="bouquet-name">💐 ${escapeHtml(p.name)}</span>
              <span class="bouquet-count">${ideaCount} 个点子 · ${inspCount} 个灵感</span>
            </div>
            <div class="bouquet-desc">${escapeHtml(p.description)}</div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm btn-primary" data-action="view-bouquet" data-id="${p.id}">查看详情</button>
              <button class="btn btn-sm btn-ghost bouquet-export-btn" data-action="export-bouquet" data-id="${p.id}">📥 导出 Markdown</button>
              <button class="btn btn-sm btn-danger" data-action="delete-bouquet" data-id="${p.id}">🗑️</button>
            </div>
          </div>
        `}).join('')
      : '<div class="empty-state"><div class="empty-icon">💐</div><p>还没有花束，创建一个来收集你的点子吧</p></div>';

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-size:1.1rem;">💐 花束 · 项目集</h3>
        <button class="btn btn-primary" data-action="create-bouquet">💐 新花束</button>
      </div>
      <div class="bouquet-list">${listHTML}</div>
    `;
  };

  const renderBouquetDetail = () => {
    const p = state.projects.find(pr => pr.id === state.bouquetDetail);
    if (!p) { state.bouquetDetail = null; return renderBouquetList(); }

    // 获取关联的点子和灵感
    const projectIdeas = state.ideas.filter(i => p.ideaIds.includes(i.id));
    const projectInspirations = state.inspirations.filter(i => p.inspirationIds.includes(i.id));
    // 可用的其他点子和灵感（未加入的）
    const availableIdeas = state.ideas.filter(i => !p.ideaIds.includes(i.id));
    const availableInspirations = state.inspirations.filter(i => !p.inspirationIds.includes(i.id) && !i.archived);

    return `
      <button class="back-btn" data-action="back-bouquet-list">← 返回花束列表</button>
      <div class="bouquet-card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h3 style="font-size:1.2rem;">💐 ${escapeHtml(p.name)}</h3>
            <p style="color:var(--text-secondary);font-size:0.9rem;margin:4px 0 8px;">${escapeHtml(p.description)}</p>
          </div>
          <button class="btn btn-sm btn-terracotta" data-action="export-bouquet" data-id="${p.id}">📥 导出 Markdown</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="settings-section">
          <h3>🧺 已加入的点子 (${projectIdeas.length})</h3>
          ${projectIdeas.length > 0
            ? `<ul class="sortable-list">${projectIdeas.map(idea => `
              <li class="sortable-item" data-idea-id="${idea.id}">
                <span>🔬</span>
                <span style="flex:1;">${escapeHtml(idea.content.slice(0, 60))}${idea.content.length > 60 ? '…' : ''}</span>
                <button class="btn btn-sm btn-ghost" data-action="remove-idea-from-bouquet" data-bid="${p.id}" data-iid="${idea.id}">✕</button>
              </li>
            `).join('')}</ul>`
            : '<p style="color:var(--text-muted);font-size:0.9rem;">还没有加入点子</p>'
          }
        </div>
        <div class="settings-section">
          <h3>🌰 已加入的灵感 (${projectInspirations.length})</h3>
          ${projectInspirations.length > 0
            ? `<ul class="sortable-list">${projectInspirations.map(insp => `
              <li class="sortable-item">
                <span>${insp.mood || '🌱'}</span>
                <span style="flex:1;">${escapeHtml(insp.content.slice(0, 60))}${insp.content.length > 60 ? '…' : ''}</span>
                <button class="btn btn-sm btn-ghost" data-action="remove-insp-from-bouquet" data-bid="${p.id}" data-iid="${insp.id}">✕</button>
              </li>
            `).join('')}</ul>`
            : '<p style="color:var(--text-muted);font-size:0.9rem;">还没有加入灵感</p>'
          }
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="settings-section">
          <h3>📎 添加点子</h3>
          ${availableIdeas.length > 0
            ? `<select class="form-input" id="addIdeaSelect"><option value="">选择点子…</option>${availableIdeas.map(i => `<option value="${i.id}">${escapeHtml(i.content.slice(0, 50))}${i.content.length > 50 ? '…' : ''}</option>`).join('')}</select>
               <button class="btn btn-sm btn-primary" style="margin-top:8px;" data-action="add-idea-to-bouquet" data-bid="${p.id}">＋ 加入</button>`
            : '<p style="color:var(--text-muted);font-size:0.9rem;">所有点子都已加入</p>'
          }
        </div>
        <div class="settings-section">
          <h3>📎 添加灵感</h3>
          ${availableInspirations.length > 0
            ? `<select class="form-input" id="addInspSelect"><option value="">选择灵感…</option>${availableInspirations.map(i => `<option value="${i.id}">${escapeHtml(i.content.slice(0, 50))}${i.content.length > 50 ? '…' : ''}</option>`).join('')}</select>
               <button class="btn btn-sm btn-primary" style="margin-top:8px;" data-action="add-insp-to-bouquet" data-bid="${p.id}">＋ 加入</button>`
            : '<p style="color:var(--text-muted);font-size:0.9rem;">所有灵感都已加入</p>'
          }
        </div>
      </div>

      <div class="settings-section">
        <h3>📝 备注</h3>
        <textarea class="edit-textarea" id="bouquetNotes" rows="4">${escapeHtml(p.notes || '')}</textarea>
        <button class="btn btn-sm btn-primary" data-action="save-bouquet-notes" data-bid="${p.id}">保存备注</button>
      </div>
    `;
  };

  // ==================== 花园地图 ====================

  const renderGardenMap = () => {
    // 找出有子点子的灵感
    const inspirationsWithIdeas = state.inspirations.filter(insp =>
      state.ideas.some(idea => idea.inspirationId === insp.id)
    );

    if (inspirationsWithIdeas.length === 0) {
      return '<div class="empty-state"><div class="empty-icon">🗺️</div><p>还没有关联的灵感树，在温室里培育一些点子吧</p></div>';
    }

    const getToolColor = (toolName) => {
      const idx = TOOLS.findIndex(t => t.name === toolName);
      const colors = ['#c17f59', '#8fa88a', '#d4a853', '#7a9a74', '#b87855', '#c8956a', '#a88a6a', '#8a9a7a'];
      return colors[idx % colors.length] || '#8fa88a';
    };

    const mapHTML = inspirationsWithIdeas.map(insp => {
      const relatedIdeas = state.ideas.filter(idea => idea.inspirationId === insp.id);
      return `
        <div class="map-root">
          <span style="font-size:1.3rem;">${insp.mood || '🌱'}</span>
          <div>
            <div style="font-size:0.95rem;">${escapeHtml(insp.content)}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${insp.tags.map(t => '#' + escapeHtml(t)).join(' ')}</div>
          </div>
        </div>
        <div class="map-children">
          ${relatedIdeas.map(idea => `
            <div class="map-child" style="border-left: 3px solid ${getToolColor(idea.tool)};">
              <span class="tool-dot" style="background:${getToolColor(idea.tool)};"></span>
              <span style="font-size:0.75rem;color:var(--text-muted);">🔬 ${escapeHtml(idea.tool)}</span>
              <div style="margin-top:4px;">${escapeHtml(idea.content.slice(0, 80))}${idea.content.length > 80 ? '…' : ''}</div>
              ${idea.liked ? '<span style="font-size:0.8rem;">❤️</span>' : ''}
            </div>
          `).join('')}
        </div>
      `;
    }).join('<div style="border-top:1px solid var(--border);margin:8px 0;"></div>');

    return `
      <h3 style="font-size:1.1rem;margin-bottom:16px;">🗺️ 花园地图 · 灵感树</h3>
      <div class="garden-map">
        <div class="map-tree">${mapHTML}</div>
      </div>
    `;
  };

  // ==================== 手账日历 ====================

  const renderCalendar = () => {
    const { year, month, selectedDate } = state.calendar;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayStr = toDateStr(today.toISOString());

    // 收集有内容的日期
    const entriesByDate = {};
    state.inspirations.forEach(insp => {
      const ds = toDateStr(insp.createdAt);
      if (!entriesByDate[ds]) entriesByDate[ds] = [];
      entriesByDate[ds].push({ type: 'inspiration', data: insp });
    });
    state.ideas.forEach(idea => {
      const ds = toDateStr(idea.createdAt);
      if (!entriesByDate[ds]) entriesByDate[ds] = [];
      entriesByDate[ds].push({ type: 'idea', data: idea });
    });

    // 构建日历网格
    let cells = [];
    // 上月填充
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, otherMonth: true });
    }
    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      cells.push({ day: d, dateStr, isToday: dateStr === todayStr, hasEntry: !!entriesByDate[dateStr] });
    }
    // 下月填充
    const remaining = Math.max(0, 42 - cells.length); // 6 rows
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, otherMonth: true });
    }

    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    const gridHTML = cells.map(cell => {
      if (cell.otherMonth) {
        return `<div class="calendar-day other-month">${cell.day}</div>`;
      }
      let cls = 'calendar-day';
      if (cell.isToday) cls += ' today';
      if (cell.hasEntry) cls += ' has-entry';
      if (selectedDate === cell.dateStr) cls += ' selected';
      return `<div class="${cls}" data-action="select-date" data-date="${cell.dateStr}">${cell.day}</div>`;
    }).join('');

    // 选中日期的条目
    let entriesHTML = '';
    if (selectedDate && entriesByDate[selectedDate]) {
      const entries = entriesByDate[selectedDate];
      entriesHTML = `
        <div class="calendar-entries">
          <div class="calendar-entries-title">📝 ${selectedDate} 的条目</div>
          ${entries.map(e => {
            if (e.type === 'inspiration') {
              return `<div class="inspiration-item" style="margin-bottom:8px;">
                <div class="inspiration-header">
                  <span class="inspiration-mood">${e.data.mood || '🌱'}</span>
                  <span class="inspiration-time">灵感</span>
                </div>
                <div class="inspiration-content">${escapeHtml(e.data.content)}</div>
                <div class="inspiration-tags">${e.data.tags.map(t => `<span class="inspiration-tag">#${escapeHtml(t)}</span>`).join('')}</div>
              </div>`;
            } else {
              return `<div class="idea-card" style="margin-bottom:8px;">
                <span class="idea-tool-label">🔬 ${escapeHtml(e.data.tool)}</span>
                <div class="idea-content">${escapeHtml(e.data.content)}</div>
              </div>`;
            }
          }).join('')}
        </div>
      `;
    } else if (selectedDate) {
      entriesHTML = `<div class="calendar-entries"><p style="color:var(--text-muted);">这一天还没有记录</p></div>`;
    }

    return `
      <div class="calendar-header">
        <button class="calendar-nav" data-action="prev-month">‹</button>
        <div class="calendar-title">${year} ${monthNames[month]}</div>
        <button class="calendar-nav" data-action="next-month">›</button>
      </div>
      <div class="calendar-grid">
        <div class="calendar-weekday">日</div>
        <div class="calendar-weekday">一</div>
        <div class="calendar-weekday">二</div>
        <div class="calendar-weekday">三</div>
        <div class="calendar-weekday">四</div>
        <div class="calendar-weekday">五</div>
        <div class="calendar-weekday">六</div>
        ${gridHTML}
      </div>
      ${entriesHTML}
    `;
  };

  // ==================== 设置 ====================

  const renderSettings = () => {
    const s = state.settings;
    return `
      <div class="settings-section">
        <h3>🌐 AI 深度扩展</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">配置兼容 OpenAI 的 API（如 Ollama 本地或任意 OpenAI 兼容端点），启用后可在温室中使用 AI 辅助扩展创意。</p>
        <div class="form-group">
          <label>API 端点</label>
          <input class="form-input" id="setApiEndpoint" value="${escapeHtml(s.apiEndpoint)}" placeholder="http://localhost:11434/v1/chat/completions">
        </div>
        <div class="form-group">
          <label>API 密钥</label>
          <input class="form-input" id="setApiKey" value="${escapeHtml(s.apiKey)}" placeholder="sk-... (可选)">
        </div>
        <div class="form-group">
          <label>模型</label>
          <input class="form-input" id="setApiModel" value="${escapeHtml(s.apiModel)}" placeholder="gpt-3.5-turbo">
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" data-action="save-api-settings">保存设置</button>
          <button class="btn btn-ghost" data-action="test-api-connection">🔌 测试连接</button>
        </div>
      </div>

      <div class="settings-section">
        <h3>🎨 主题</h3>
        <div style="display:flex;gap:10px;">
          <button class="btn ${s.theme === 'light' ? 'btn-primary' : 'btn-ghost'}" data-action="set-theme" data-theme="light">☀️ 浅色</button>
          <button class="btn ${s.theme === 'dark' ? 'btn-primary' : 'btn-ghost'}" data-action="set-theme" data-theme="dark">🌙 深色</button>
        </div>
      </div>

      <div class="settings-section">
        <h3>💾 数据管理</h3>
        <div class="settings-actions">
          <button class="btn btn-primary" data-action="export-json">📤 导出 JSON</button>
          <button class="btn btn-ghost" data-action="import-json">📥 导入 JSON</button>
          <button class="btn btn-ghost" data-action="export-html">📄 导出纪念册 HTML</button>
          <button class="btn btn-danger" data-action="reset-data">⚠️ 重置数据</button>
        </div>
        <input type="file" id="importFileInput" accept=".json" style="display:none" data-action="import-file">
      </div>
    `;
  };

  // ================================================================
  // HTML 转义
  // ================================================================

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  // ================================================================
  // 事件处理（事件委托）
  // ================================================================

  const handleClick = (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;

    switch (action) {

      // ========== 苗圃 ==========
      case 'select-mood':
        state.nursery.mood = target.dataset.mood;
        // 更新 UI
        document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === state.nursery.mood));
        break;

      case 'save-inspiration': {
        const content = document.getElementById('nurseryContent')?.value?.trim();
        const tagsStr = document.getElementById('nurseryTags')?.value?.trim();
        if (!content) { toast('请写下你的灵感'); break; }
        state.inspirations.unshift({
          id: uid(),
          content,
          mood: state.nursery.mood || '🌱',
          tags: parseTags(tagsStr),
          createdAt: new Date().toISOString(),
          archived: false
        });
        state.nursery.content = '';
        state.nursery.tags = '';
        state.nursery.mood = null;
        save();
        render();
        toast('🌱 灵感已种下！');
        break;
      }

      // ========== 种子箱筛选 ==========
      case 'filter-tag':
        state.nursery.filterTag = target.dataset.tag || null;
        render();
        break;
      case 'sfilter-tag':
        state.seedbox.filterTag = target.dataset.tag || null;
        render();
        break;
      case 'toggle-archived':
        state.seedbox.showArchived = target.checked;
        render();
        break;

      // ========== 灵感操作 ==========
      case 'cultivate': {
        const inspId = target.dataset.id;
        state.greenhouse.activeInspirationId = inspId;
        state.currentView = 'greenhouse';
        render();
        break;
      }

      case 'edit-inspiration': {
        const insp = state.inspirations.find(i => i.id === target.dataset.id);
        if (!insp) break;
        openModal('✏️ 编辑灵感', '', `
          <textarea class="edit-textarea" id="editInspContent" rows="4">${escapeHtml(insp.content)}</textarea>
          <input class="form-input" id="editInspTags" value="${escapeHtml(insp.tags.map(t => '#' + t).join(' '))}" placeholder="#标签">
          <div style="margin-top:8px;">
            <label style="font-size:0.9rem;color:var(--text-secondary);">心情：</label>
            <div class="mood-selector" style="display:inline-flex;">
              ${['😌', '😆', '🤔', '😢', '🔥', '🌊'].map(m =>
                `<button class="mood-btn ${insp.mood === m ? 'active' : ''}" data-action="modal-mood" data-mood="${m}">${m}</button>`
              ).join('')}
            </div>
          </div>
        `, `
          <button class="btn btn-ghost" data-action="close-modal">取消</button>
          <button class="btn btn-primary" data-action="save-edit-inspiration" data-id="${insp.id}">保存</button>
        `);
        break;
      }

      case 'save-edit-inspiration': {
        const inspId = target.dataset.id;
        const insp = state.inspirations.find(i => i.id === inspId);
        if (!insp) break;
        const newContent = document.getElementById('editInspContent')?.value?.trim();
        const newTags = document.getElementById('editInspTags')?.value?.trim();
        // 读取模态框内选中的心情
        const activeMood = document.querySelector('#modalBody .mood-btn.active');
        if (newContent) {
          insp.content = newContent;
          insp.tags = parseTags(newTags);
          if (activeMood) insp.mood = activeMood.dataset.mood;
          save();
          closeModal(true);
          render();
          toast('✅ 已更新');
        }
        break;
      }

      case 'archive-inspiration': {
        const insp = state.inspirations.find(i => i.id === target.dataset.id);
        if (insp) { insp.archived = true; save(); render(); toast('📦 已归档'); }
        break;
      }

      case 'unarchive-inspiration': {
        const insp = state.inspirations.find(i => i.id === target.dataset.id);
        if (insp) { insp.archived = false; save(); render(); toast('📂 已恢复'); }
        break;
      }

      case 'delete-inspiration': {
        if (!confirm('确定要删除这条灵感吗？')) break;
        const deletedId = target.dataset.id;
        state.inspirations = state.inspirations.filter(i => i.id !== deletedId);
        // 清理孤儿引用
        state.ideas.forEach(idea => { if (idea.inspirationId === deletedId) idea.inspirationId = null; });
        state.projects.forEach(p => { p.inspirationIds = p.inspirationIds.filter(id => id !== deletedId); });
        if (state.greenhouse.activeInspirationId === deletedId) state.greenhouse.activeInspirationId = null;
        save();
        render();
        toast('🗑️ 已删除');
        break;
      }

      // ========== 温室工具 ==========
      case 'open-tool': {
        const idx = parseInt(target.dataset.toolIndex);
        const tool = TOOLS[idx];
        if (!tool) break;
        openToolModal(idx);
        break;
      }

      case 'clear-active-inspiration':
        state.greenhouse.activeInspirationId = null;
        render();
        break;

      // ========== 收获篮 ==========
      case 'toggle-like': {
        const idea = state.ideas.find(i => i.id === target.dataset.id);
        if (idea) { idea.liked = !idea.liked; save(); render(); }
        break;
      }

      case 'edit-idea': {
        const idea = state.ideas.find(i => i.id === target.dataset.id);
        if (!idea) break;
        openModal('✏️ 编辑点子', '', `
          <textarea class="edit-textarea" id="editIdeaContent" rows="4">${escapeHtml(idea.content)}</textarea>
          <input class="form-input" id="editIdeaTags" value="${escapeHtml(idea.tags.map(t => '#' + t).join(' '))}" placeholder="#标签">
        `, `
          <button class="btn btn-ghost" data-action="close-modal">取消</button>
          <button class="btn btn-primary" data-action="save-edit-idea" data-id="${idea.id}">保存</button>
        `);
        break;
      }

      case 'save-edit-idea': {
        const ideaId = target.dataset.id;
        const idea = state.ideas.find(i => i.id === ideaId);
        if (!idea) break;
        const newContent = document.getElementById('editIdeaContent')?.value?.trim();
        const newTags = document.getElementById('editIdeaTags')?.value?.trim();
        if (newContent) {
          idea.content = newContent;
          idea.tags = parseTags(newTags);
          save();
          closeModal(true);
          render();
          toast('✅ 已更新');
        }
        break;
      }

      case 'delete-idea': {
        if (!confirm('确定要删除这个点子吗？')) break;
        const deletedId = target.dataset.id;
        state.ideas = state.ideas.filter(i => i.id !== deletedId);
        // 清理孤儿引用
        state.projects.forEach(p => { p.ideaIds = p.ideaIds.filter(id => id !== deletedId); });
        save();
        render();
        toast('🗑️ 已删除');
        break;
      }

      // ========== 花束 ==========
      case 'create-bouquet':
        openModal('💐 新花束', '创建一个项目来收集你的点子和灵感', `
          <input class="form-input" id="newBouquetName" placeholder="花束名字" style="margin-bottom:12px;">
          <textarea class="edit-textarea" id="newBouquetDesc" rows="3" placeholder="简单描述这个项目……"></textarea>
        `, `
          <button class="btn btn-ghost" data-action="close-modal">取消</button>
          <button class="btn btn-primary" data-action="save-new-bouquet">创建</button>
        `);
        break;

      case 'save-new-bouquet': {
        const name = document.getElementById('newBouquetName')?.value?.trim();
        const desc = document.getElementById('newBouquetDesc')?.value?.trim();
        if (!name) { toast('请输入花束名字'); break; }
        state.projects.push({
          id: uid(),
          name,
          description: desc || '',
          ideaIds: [],
          inspirationIds: [],
          notes: '',
          createdAt: new Date().toISOString()
        });
        save();
        closeModal(true);
        render();
        toast('💐 新花束已创建！');
        break;
      }

      case 'view-bouquet':
        state.bouquetDetail = target.dataset.id;
        render();
        break;

      case 'back-bouquet-list':
        state.bouquetDetail = null;
        render();
        break;

      case 'delete-bouquet': {
        if (!confirm('确定要删除这个花束吗？')) break;
        const deletedId = target.dataset.id;
        state.projects = state.projects.filter(p => p.id !== deletedId);
        // 清理孤儿引用：将关联点子的 projectId 清空
        state.ideas.forEach(idea => { if (idea.projectId === deletedId) idea.projectId = null; });
        if (state.bouquetDetail === deletedId) state.bouquetDetail = null;
        save();
        render();
        toast('🗑️ 已删除');
        break;
      }

      case 'export-bouquet': {
        const p = state.projects.find(pr => pr.id === target.dataset.id);
        if (!p) break;
        const relatedIdeas = state.ideas.filter(i => p.ideaIds.includes(i.id));
        const relatedInsp = state.inspirations.filter(i => p.inspirationIds.includes(i.id));
        let md = `# 💐 ${p.name}\n\n`;
        md += `> ${p.description || '无描述'}\n\n`;
        md += `---\n\n`;
        if (p.notes) md += `## 备注\n\n${p.notes}\n\n---\n\n`;
        if (relatedInsp.length > 0) {
          md += `## 🌰 灵感来源\n\n`;
          relatedInsp.forEach((insp, i) => {
            md += `${i+1}. ${insp.mood || ''} ${insp.content}\n`;
          });
          md += '\n';
        }
        if (relatedIdeas.length > 0) {
          md += `## 🧺 点子\n\n`;
          relatedIdeas.forEach((idea, i) => {
            md += `${i+1}. **${idea.tool}** ${idea.liked ? '❤️ ' : ''}${idea.content}\n`;
          });
          md += '\n';
        }
        md += `---\n*由 MindGarden 创意花园生成于 ${new Date().toLocaleDateString('zh-CN')}*\n`;
        downloadFile(`${p.name}.md`, md, 'text/markdown');
        toast('📥 已导出 Markdown');
        break;
      }

      case 'remove-idea-from-bouquet': {
        const p = state.projects.find(pr => pr.id === target.dataset.bid);
        if (p) { p.ideaIds = p.ideaIds.filter(id => id !== target.dataset.iid); save(); render(); }
        break;
      }

      case 'remove-insp-from-bouquet': {
        const p = state.projects.find(pr => pr.id === target.dataset.bid);
        if (p) { p.inspirationIds = p.inspirationIds.filter(id => id !== target.dataset.iid); save(); render(); }
        break;
      }

      case 'add-idea-to-bouquet': {
        const p = state.projects.find(pr => pr.id === target.dataset.bid);
        const select = document.getElementById('addIdeaSelect');
        if (p && select && select.value) {
          if (!p.ideaIds.includes(select.value)) { p.ideaIds.push(select.value); save(); render(); toast('✅ 已加入'); }
        }
        break;
      }

      case 'add-insp-to-bouquet': {
        const p = state.projects.find(pr => pr.id === target.dataset.bid);
        const select = document.getElementById('addInspSelect');
        if (p && select && select.value) {
          if (!p.inspirationIds.includes(select.value)) { p.inspirationIds.push(select.value); save(); render(); toast('✅ 已加入'); }
        }
        break;
      }

      case 'save-bouquet-notes': {
        const p = state.projects.find(pr => pr.id === target.dataset.bid);
        const notes = document.getElementById('bouquetNotes')?.value;
        if (p) { p.notes = notes || ''; save(); render(); toast('✅ 备注已保存'); }
        break;
      }

      // ========== 日历 ==========
      case 'prev-month':
        state.calendar.month--;
        if (state.calendar.month < 0) { state.calendar.month = 11; state.calendar.year--; }
        state.calendar.selectedDate = null;
        render();
        break;

      case 'next-month':
        state.calendar.month++;
        if (state.calendar.month > 11) { state.calendar.month = 0; state.calendar.year++; }
        state.calendar.selectedDate = null;
        render();
        break;

      case 'select-date':
        state.calendar.selectedDate = target.dataset.date;
        render();
        break;

      // ========== 设置 ==========
      case 'set-theme':
        state.settings.theme = target.dataset.theme;
        document.documentElement.setAttribute('data-theme', state.settings.theme);
        save();
        render();
        break;

      case 'save-api-settings': {
        state.settings.apiEndpoint = document.getElementById('setApiEndpoint')?.value?.trim() || '';
        state.settings.apiKey = document.getElementById('setApiKey')?.value?.trim() || '';
        state.settings.apiModel = document.getElementById('setApiModel')?.value?.trim() || '';
        save();
        toast('✅ 设置已保存');
        break;
      }

      case 'test-api-connection': {
        testApiConnection();
        break;
      }

      case 'export-json': {
        const safeSettings = { ...state.settings, apiKey: '' };
        const data = {
          inspirations: state.inspirations,
          ideas: state.ideas,
          projects: state.projects,
          settings: safeSettings,
          exportedAt: new Date().toISOString()
        };
        downloadFile('mindgarden-backup.json', JSON.stringify(data, null, 2), 'application/json');
        toast('📤 已导出');
        break;
      }

      case 'import-json':
        document.getElementById('importFileInput').click();
        break;

      case 'export-html': {
        exportAlbumHTML();
        break;
      }

      case 'reset-data': {
        if (!confirm('⚠️ 确定要重置所有数据吗？此操作不可恢复！')) break;
        if (!confirm('再次确认：所有灵感和点子将被清空。')) break;
        const sample = createSampleData();
        state.inspirations = sample.inspirations;
        state.ideas = sample.ideas;
        state.projects = sample.projects;
        state.settings = { ...defaultSettings };
        document.documentElement.setAttribute('data-theme', 'light');
        save();
        render();
        toast('🔄 已重置为示例数据');
        break;
      }

      // ========== 模态框 ==========
      case 'close-modal':
        closeModal(null);
        break;

      case 'modal-mood':
        document.querySelectorAll('#modalBody .mood-btn').forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        break;

      // ========== 温室工具模态框内的操作在工具栏单独处理 ==========
      case 'save-tool-result': {
        const toolIdx = parseInt(target.dataset.toolIdx);
        const tool = TOOLS[toolIdx];
        if (!tool) break;
        saveToolResult(toolIdx);
        break;
      }
    }
  };

  // ================================================================
  // 输入事件委托
  // ================================================================

  const handleInput = (e) => {
    const target = e.target;

    // 苗圃实时内容
    if (target.id === 'nurseryContent') {
      state.nursery.content = target.value;
    }
    if (target.id === 'nurseryTags') {
      state.nursery.tags = target.value;
    }

    // 收获篮项目选择
    if (target.dataset.action === 'idea-project') {
      const idea = state.ideas.find(i => i.id === target.dataset.id);
      if (idea) {
        idea.projectId = target.value || null;
        save();
        // 重新渲染以更新标签
        render();
        toast(idea.projectId ? '📁 已归入花束' : '📁 已移出花束');
      }
    }
  };

  // ================================================================
  // 温室工具逻辑
  // ================================================================

  // 工具临时状态
  const toolState = {
    scamperActiveTag: 0,
    extremeCurrent: 0,
    analogyCurrent: 0,
    analogyAnswer: '',
    pollenCurrent: 0,
    hatsCurrent: 0,
    sandboxTimer: null,
    sandboxWords: []
  };

  /** 打开某个工具的模态框 */
  const openToolModal = (idx) => {
    const tool = TOOLS[idx];
    const activeInsp = state.greenhouse.activeInspirationId
      ? state.inspirations.find(i => i.id === state.greenhouse.activeInspirationId)
      : null;
    const inspText = activeInsp ? `\n\n当前灵感：${activeInsp.content}` : '';

    switch (tool.id) {
      case 'reverse':
        openReverseModal(tool, inspText);
        break;
      case 'scamper':
        openScamperModal(tool, inspText);
        break;
      case 'extreme':
        openExtremeModal(tool, inspText);
        break;
      case 'analogy':
        openAnalogyModal(tool, inspText);
        break;
      case 'firstprinciples':
        openFirstPrinciplesModal(tool, inspText);
        break;
      case 'pollen':
        openPollenModal(tool, inspText);
        break;
      case 'hats':
        openHatsModal(tool, inspText);
        break;
      case 'sandbox':
        openSandboxModal(tool, inspText);
        break;
    }
  };

  /** 保存工具生成的点子 */
  const saveToolResult = (toolIdx) => {
    const tool = TOOLS[toolIdx];
    const content = document.getElementById('toolResultContent')?.value?.trim();
    if (!content) { toast('请写下你的想法'); return; }
    const tagsStr = document.getElementById('toolResultTags')?.value?.trim();
    state.ideas.unshift({
      id: uid(),
      inspirationId: state.greenhouse.activeInspirationId,
      content,
      tool: tool.name,
      liked: false,
      tags: parseTags(tagsStr),
      projectId: null,
      createdAt: new Date().toISOString()
    });
    save();
    closeModal(true);
    // 清除沙盘定时器
    if (toolState.sandboxTimer) { clearInterval(toolState.sandboxTimer); toolState.sandboxTimer = null; }
    render();
    toast('🧺 点子已收入收获篮！');
  };

  // ----- 工具1: 逆向花园 -----
  const openReverseModal = (tool, inspText) => {
    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      `<div class="tool-guide">💡 试着想想：如果要让这件事彻底失败，你会怎么做？然后我们一起来反转它。</div>
       <textarea id="reverseGoal" rows="2" placeholder="你的目标或灵感是什么？${inspText ? '（已自动带入当前灵感）' : ''}">${inspText.replace('当前灵感：', '')}</textarea>
       <textarea id="reverseFail" rows="3" placeholder="如何搞砸它？越具体越好：
· 忽略什么？
· 过度做什么？
· 故意做错什么？"></textarea>
       <hr style="border-color:var(--border);margin:12px 0;">
       <div class="tool-guide" style="border-left-color:var(--accent-gold);">✨ 现在，把上面的"搞砸方案"反过来，就是一个好点子！</div>
       <textarea id="toolResultContent" rows="3" placeholder="把反转后的点子写下来……"></textarea>
       <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`,
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );
  };

  // ----- 工具2: SCAMPER 嫁接实验室 -----
  const openScamperModal = (tool, inspText) => {
    const renderScamperBody = () => {
      const active = SCAMPER_TAGS[toolState.scamperActiveTag];
      return `
        <div class="tool-guide">当前灵感：${inspText || '（自由模式，选一个方向开始思考）'}</div>
        <div class="scamper-tabs" id="scamperTabs">
          ${SCAMPER_TAGS.map((t, i) => `
            <button class="scamper-tab ${i === toolState.scamperActiveTag ? 'active' : ''}" data-action="scamper-tab" data-index="${i}">${t.key}. ${t.label}</button>
          `).join('')}
        </div>
        <div class="tool-guide" style="border-left-color:var(--accent-gold);">${active.question}</div>
        <textarea id="toolResultContent" rows="4" placeholder="从这个角度出发，你有什么新想法？"></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`;
    };

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      renderScamperBody(),
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );

    // SCAMPER 标签切换 — 使用事件委托，避免重复绑定
    setTimeout(() => {
      const body = document.getElementById('modalBody');
      if (!body) return;
      if (toolState._scamperHandler) body.removeEventListener('click', toolState._scamperHandler);
      toolState._scamperHandler = (e) => {
        const tab = e.target.closest('[data-action="scamper-tab"]');
        if (!tab) return;
        toolState.scamperActiveTag = parseInt(tab.dataset.index);
        const active = SCAMPER_TAGS[toolState.scamperActiveTag];
        // 保存用户已输入的内容
        const savedContent = document.getElementById('toolResultContent')?.value || '';
        const savedTags = document.getElementById('toolResultTags')?.value || '';
        body.innerHTML = `
            <div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
            <div class="scamper-tabs" id="scamperTabs">
              ${SCAMPER_TAGS.map((t, i) => `
                <button class="scamper-tab ${i === toolState.scamperActiveTag ? 'active' : ''}" data-action="scamper-tab" data-index="${i}">${t.key}. ${t.label}</button>
              `).join('')}
            </div>
            <div class="tool-guide" style="border-left-color:var(--accent-gold);">${active.question}</div>
            <textarea id="toolResultContent" rows="4" placeholder="从这个角度出发，你有什么新想法？">${savedContent}</textarea>
            <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割" value="${savedTags}">`;
      };
      body.addEventListener('click', toolState._scamperHandler);
    }, 50);
  };

  // ----- 工具3: 极限温室 -----
  const openExtremeModal = (tool, inspText) => {
    const randomIdx = Math.floor(Math.random() * EXTREME_CONDITIONS.length);
    toolState.extremeCurrent = randomIdx;
    const condition = EXTREME_CONDITIONS[randomIdx];

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      `<div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
       <div class="extreme-condition">${condition}</div>
       <div class="tool-guide" style="border-left-color:var(--accent-gold);">在这个极端条件下，你的灵感会变成什么？</div>
       <textarea id="toolResultContent" rows="4" placeholder="写下你的极限创意……"></textarea>
       <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">
       <div style="margin-top:10px;">
         <button class="btn btn-sm btn-ghost" data-action="tool-extreme-reroll">🎲 换一个条件</button>
       </div>`,
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );
  };

  // ----- 工具4: 自然类比 -----
  const openAnalogyModal = (tool, inspText) => {
    const randomIdx = Math.floor(Math.random() * NATURE_PHENOMENA.length);
    toolState.analogyCurrent = randomIdx;
    const phenom = NATURE_PHENOMENA[randomIdx];

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      `<div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
       <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:16px;">
         <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">${phenom.title}</div>
         <div style="font-size:0.9rem;color:var(--text-secondary);">${phenom.desc}</div>
       </div>
       <div class="tool-guide" style="border-left-color:var(--accent-gold);">这个自然现象给你的灵感带来了什么启发？它们之间有什么相似之处？</div>
       <textarea id="toolResultContent" rows="4" placeholder="写下你的类比联想……"></textarea>
       <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">
       <div style="margin-top:10px;">
         <button class="btn btn-sm btn-ghost" data-action="tool-analogy-reroll">🎲 换一个自然现象</button>
       </div>`,
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );
  };

  // ----- 工具5: 本源之土（第一性原理）-----
  const openFirstPrinciplesModal = (tool, inspText) => {
    const layers = [
      { q: '这个想法/问题是什么？用一句话说清楚。', a: '' },
      { q: '拆开来看，它由哪些基本元素组成？', a: '' },
      { q: '这些元素中，哪些是"本质属性"，哪些是"人为附加"的？', a: '' },
      { q: '去掉人为附加的部分，剩下的核心是什么？', a: '' },
      { q: '基于这个核心，我们能重新构建什么？', a: '' }
    ];

    const renderOnion = () => layers.map((l, i) => `
      <div class="onion-layer">
        <div class="onion-question">🧅 第 ${i+1} 层：${l.q}</div>
        <textarea class="onion-answer" data-layer="${i}" rows="2" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.9rem;background:var(--bg-input);color:var(--text-primary);">${l.a}</textarea>
      </div>
    `).join('');

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      `<div class="tool-guide">${inspText || '想一个你想要深入探索的想法或问题。'}</div>
       <div id="onionLayers">${renderOnion()}</div>
       <hr style="border-color:var(--border);margin:12px 0;">
       <div class="tool-guide" style="border-left-color:var(--accent-gold);">经过层层剥开，你有什么新的认识？</div>
       <textarea id="toolResultContent" rows="3" placeholder="写下你的核心洞察……"></textarea>
       <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`,
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );

    // 监听洋葱层输入 — 移除旧监听器，避免重复绑定
    setTimeout(() => {
      const body = document.getElementById('modalBody');
      if (!body) return;
      if (toolState._onionHandler) body.removeEventListener('input', toolState._onionHandler);
      toolState._onionHandler = (e) => {
        const textarea = e.target.closest('.onion-answer');
        if (!textarea) return;
        const idx = parseInt(textarea.dataset.layer);
        if (!isNaN(idx) && layers[idx]) layers[idx].a = textarea.value;
      };
      body.addEventListener('input', toolState._onionHandler);
    }, 50);
  };

  // ----- 工具6: 随机花粉 -----
  const openPollenModal = (tool, inspText) => {
    const randomIdx = Math.floor(Math.random() * POLLEN_WORDS.length);
    toolState.pollenCurrent = randomIdx;
    const word = POLLEN_WORDS[randomIdx];

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      `<div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
       <div class="pollen-word">🌸 ${word} 🌸</div>
       <div class="tool-guide" style="border-left-color:var(--accent-gold);">这个词汇和你的灵感之间有什么联系？强行建立一个关联！</div>
       <textarea id="toolResultContent" rows="4" placeholder="把"${word}"和你的想法连接起来……"></textarea>
       <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">
       <div style="margin-top:10px;">
         <button class="btn btn-sm btn-ghost" data-action="tool-pollen-reroll">🎲 换一个词</button>
       </div>`,
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );
  };

  // ----- 工具7: 六顶思考帽 -----
  const openHatsModal = (tool, inspText) => {
    const currentHat = HATS[toolState.hatsCurrent];

    const renderHatBody = () => `
      <div class="tool-guide">当前灵感：${inspText || '（自由模式，选一个角度开始思考）'}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
        ${HATS.map((hat, i) => `
          <button class="btn btn-sm ${i === toolState.hatsCurrent ? 'btn-terracotta' : 'btn-ghost'}" data-action="hat-switch" data-index="${i}" style="border-left:3px solid ${hat.color};">${hat.label.split('·')[0].trim()}</button>
        `).join('')}
      </div>
      <div class="tool-guide hat-${currentHat.key}" style="border-left:3px solid ${currentHat.color};">
        <span class="hat-label hat-${currentHat.key}-bg">${currentHat.label}</span>
        <div>${currentHat.question}</div>
      </div>
      <textarea id="toolResultContent" rows="4" placeholder="戴上这顶帽子，你看到了什么？"></textarea>
      <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`;

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      renderHatBody(),
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );

    // 帽子切换 — 使用事件委托，避免重复绑定
    setTimeout(() => {
      const body = document.getElementById('modalBody');
      if (!body) return;
      if (toolState._hatsHandler) body.removeEventListener('click', toolState._hatsHandler);
      toolState._hatsHandler = (e) => {
        const btn = e.target.closest('[data-action="hat-switch"]');
        if (!btn) return;
        toolState.hatsCurrent = parseInt(btn.dataset.index);
        const hat = HATS[toolState.hatsCurrent];
        // 保存用户已输入的内容
        const savedContent = document.getElementById('toolResultContent')?.value || '';
        const savedTags = document.getElementById('toolResultTags')?.value || '';
        body.innerHTML = `
          <div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">
            ${HATS.map((h, i) => `
              <button class="btn btn-sm ${i === toolState.hatsCurrent ? 'btn-terracotta' : 'btn-ghost'}" data-action="hat-switch" data-index="${i}" style="border-left:3px solid ${h.color};">${h.label.split('·')[0].trim()}</button>
            `).join('')}
          </div>
          <div class="tool-guide hat-${hat.key}" style="border-left:3px solid ${hat.color};">
            <span class="hat-label hat-${hat.key}-bg">${hat.label}</span>
            <div>${hat.question}</div>
          </div>
          <textarea id="toolResultContent" rows="4" placeholder="戴上这顶帽子，你看到了什么？">${savedContent}</textarea>
          <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割" value="${savedTags}">`;
      };
      body.addEventListener('click', toolState._hatsHandler);
    }, 50);
  };

  // ----- 工具8: 空想沙盘 -----
  const openSandboxModal = (tool, inspText) => {
    toolState.sandboxWords = [];

    openModal(
      `${tool.icon} ${tool.name}`,
      tool.guide,
      `<div class="tool-guide">${inspText || '让思绪自由流淌，什么都不用想，只管写。'}</div>
       <div class="sandbox-words" id="sandboxWords"></div>
       <textarea id="toolResultContent" rows="6" placeholder="写下任何出现在脑海里的东西……
不用组织语言，不用判断好坏，只是写。"></textarea>
       <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`,
      `<button class="btn btn-ghost" data-action="close-modal">取消</button>
       <button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="${TOOLS.indexOf(tool)}">🌾 收获</button>`
    );

    // 启动引导词定时器
    if (toolState.sandboxTimer) clearInterval(toolState.sandboxTimer);
    toolState.sandboxTimer = setInterval(() => {
      const container = document.getElementById('sandboxWords');
      if (!container) { clearInterval(toolState.sandboxTimer); toolState.sandboxTimer = null; return; }
      const word = SANDBOX_WORDS[Math.floor(Math.random() * SANDBOX_WORDS.length)];
      const el = document.createElement('span');
      el.className = 'sandbox-word';
      el.textContent = word;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
      // 限制最多显示 8 个
      while (container.children.length > 8) container.removeChild(container.firstChild);
    }, 10000);
  };

  // ================================================================
  // 额外工具按钮的事件绑定（非 data-action 通用模式）
  // ================================================================

  // 这些工具特定的按钮需要在模态框 open 后重新绑定
  // 我们使用全局点击委托来处理这些"二次点击"

  // （继续使用 handleClick 中的路由）

  // 工具 reroll 按钮在 handleClick 中处理
  // 但需要额外的事件监听，因为它们在模态框内

  // 我们增强 handleClick，在 document 层面捕获
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    // 工具 reroll 按钮（模态框内）
    if (target.dataset.action === 'tool-extreme-reroll') {
      const randomIdx = Math.floor(Math.random() * EXTREME_CONDITIONS.length);
      toolState.extremeCurrent = randomIdx;
      const condition = EXTREME_CONDITIONS[randomIdx];
      const el = document.querySelector('.extreme-condition');
      if (el) el.textContent = condition;
      return;
    }

    if (target.dataset.action === 'tool-analogy-reroll') {
      const randomIdx = Math.floor(Math.random() * NATURE_PHENOMENA.length);
      toolState.analogyCurrent = randomIdx;
      const phenom = NATURE_PHENOMENA[randomIdx];
      const body = document.getElementById('modalBody');
      if (body) {
        // 只更新自然现象卡片（保留 textarea）
        const card = body.querySelector('div[style*="background:var(--bg-card)"]');
        if (card) {
          card.innerHTML = `
            <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">${phenom.title}</div>
            <div style="font-size:0.9rem;color:var(--text-secondary);">${phenom.desc}</div>`;
        }
      }
      return;
    }

    if (target.dataset.action === 'tool-pollen-reroll') {
      const randomIdx = Math.floor(Math.random() * POLLEN_WORDS.length);
      toolState.pollenCurrent = randomIdx;
      const word = POLLEN_WORDS[randomIdx];
      const el = document.querySelector('.pollen-word');
      if (el) el.textContent = `🌸 ${word} 🌸`;
      // 更新引导语中的词
      const guide = document.querySelector('.tool-guide[style*="border-left-color:var(--accent-gold)"]');
      if (guide) guide.textContent = `这个词汇和你的灵感之间有什么联系？强行建立一个关联！`;
      // 更新 textarea placeholder
      const ta = document.getElementById('toolResultContent');
      if (ta) ta.placeholder = `把"${word}"和你的想法连接起来……`;
      return;
    }
  });

  // ================================================================
  // API 连接测试
  // ================================================================

  const testApiConnection = async () => {
    const endpoint = document.getElementById('setApiEndpoint')?.value?.trim() || state.settings.apiEndpoint;
    const key = document.getElementById('setApiKey')?.value?.trim() || state.settings.apiKey;
    const model = document.getElementById('setApiModel')?.value?.trim() || state.settings.apiModel;

    if (!endpoint) { toast('请先输入 API 端点'); return; }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'Authorization': `Bearer ${key}` } : {})
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hello! 请用一句话回应。' }],
          max_tokens: 50
        })
      });
      if (response.ok) {
        toast('🔌 连接成功！API 工作正常');
      } else {
        const errText = await response.text().catch(() => '未知错误');
        toast(`❌ 连接失败 (${response.status}): ${errText.slice(0, 60)}`);
      }
    } catch (err) {
      toast(`❌ 连接失败: ${err.message}`);
    }
  };

  // ================================================================
  // 文件下载
  // ================================================================

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ================================================================
  // 导出纪念册 HTML
  // ================================================================

  const exportAlbumHTML = () => {
    const sortedInps = [...state.inspirations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const sortedIdeas = [...state.ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>🌱 MindGarden 纪念册</title>
<style>
body { font-family: "Noto Serif SC", "Songti SC", serif; background: #fdf8f0; color: #3b2b1f; max-width: 720px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; }
h1 { text-align: center; color: #c17f59; font-size: 1.8rem; }
.subtitle { text-align: center; color: #7a6a5a; margin-bottom: 40px; }
h2 { color: #8fa88a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 40px; }
.card { background: #fffcf5; border: 1px solid #e8ddd0; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(59,43,31,0.06); }
.mood { font-size: 1.3rem; }
.time { font-size: 0.8rem; color: #a89888; }
.tag { display:inline-block; font-size:0.8rem; color:#c17f59; background:#f0d5c4; padding:2px 10px; border-radius:12px; margin:2px; }
.idea-tool { font-size:0.8rem; color:#fff; background:#8fa88a; padding:2px 10px; border-radius:12px; display:inline-block; }
.liked { color: #e74c3c; }
.footer { text-align: center; color: #a89888; font-size: 0.85rem; margin-top: 60px; border-top: 1px solid #e8ddd0; padding-top: 20px; }
</style></head>
<body>
<h1>🌱 MindGarden 纪念册</h1>
<p class="subtitle">我的创意花园 · 点滴记录</p>
<p style="text-align:center;color:#7a6a5a;">共 ${sortedInps.length} 条灵感 · ${sortedIdeas.length} 个点子 · ${state.projects.length} 个项目</p>
`;

    if (sortedInps.length > 0) {
      html += '<h2>🌰 灵感集</h2>';
      sortedInps.forEach(insp => {
        html += `<div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="mood">${insp.mood || '🌱'}</span>
            <span class="time">${new Date(insp.createdAt).toLocaleDateString('zh-CN')}</span>
          </div>
          <div style="margin:8px 0;">${escapeHtml(insp.content)}</div>
          <div>${insp.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join(' ')}</div>
        </div>`;
      });
    }

    if (sortedIdeas.length > 0) {
      html += '<h2>🧺 点子集</h2>';
      sortedIdeas.forEach(idea => {
        html += `<div class="card">
          <div><span class="idea-tool">🔬 ${escapeHtml(idea.tool)}</span> ${idea.liked ? '<span class="liked">❤️</span>' : ''}</div>
          <div style="margin:8px 0;">${escapeHtml(idea.content)}</div>
          <div>${idea.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join(' ')}</div>
        </div>`;
      });
    }

    if (state.projects.length > 0) {
      html += '<h2>💐 项目</h2>';
      state.projects.forEach(p => {
        html += `<div class="card">
          <h3 style="margin:0 0 4px;">💐 ${escapeHtml(p.name)}</h3>
          <p style="color:#7a6a5a;margin:0 0 8px;">${escapeHtml(p.description)}</p>
          <p style="color:#a89888;font-size:0.85rem;">${p.ideaIds.length} 个点子 · ${p.inspirationIds.length} 个灵感</p>
        </div>`;
      });
    }

    html += `<div class="footer">由 MindGarden 创意花园生成 · ${new Date().toLocaleDateString('zh-CN')}</div></body></html>`;

    downloadFile('mindgarden-纪念册.html', html, 'text/html;charset=utf-8');
    toast('📄 纪念册已导出');
  };

  // ================================================================
  // 主题切换按钮
  // ================================================================

  document.getElementById('themeToggle').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    save();
    updateTopBar();
  });

  // ================================================================
  // 模态框背景点击关闭
  // ================================================================

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) {
      // 如果工具有未保存内容，提示确认
      const content = document.getElementById('toolResultContent');
      if (content && content.value.trim()) {
        if (!confirm('关闭模态框将丢失未保存的内容，确定关闭吗？')) return;
      }
      closeModal(null);
    }
  });

  // ================================================================
  // 导航点击（data-view 路由）
  // ================================================================

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.dataset.view;
      if (view) {
        state.currentView = view;
        state.bouquetDetail = null;
        render();
      }
    });
  });

  // ================================================================
  // 应用内点击委托
  // ================================================================

  document.getElementById('view-container').addEventListener('click', handleClick);
  document.getElementById('view-container').addEventListener('input', handleInput);

  // 模态框内的按钮也需要委托（模态框在 view-container 之外）
  document.getElementById('modalCard').addEventListener('click', handleClick);

  // 文件导入的 change 事件（不在 click 委托中）
  document.getElementById('importFileInput').addEventListener('change', function(e) {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.inspirations) state.inspirations = data.inspirations;
        if (data.ideas) state.ideas = data.ideas;
        if (data.projects) state.projects = data.projects;
        if (data.settings) state.settings = { ...state.settings, ...data.settings };
        save();
        render();
        toast('📥 导入成功！');
      } catch (err) {
        toast('❌ 导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  // ================================================================
  // 初始化
  // ================================================================

  load();
  render();
  updateTopBar();


})();
