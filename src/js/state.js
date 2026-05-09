/* ================================================================
   MindGarden 创意花园 — 状态管理
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  /** 默认设置 */
  var defaultSettings = {
    theme: 'light',
    apiEndpoint: 'http://localhost:11434/v1/chat/completions',
    apiKey: '',
    apiModel: 'gpt-3.5-turbo'
  };

  /** 示例数据：让首次打开就有丰富的花园 */
  MG.createSampleData = function() {
    var now = Date.now();
    var day = 86400000;

    var inspirations = [
      { id: MG.uid(), content: '傍晚的风吹过窗台的花，突然想做一个关于时间的装置——不是显示时间，而是让人感受到时间。', mood: '😌', tags: ['灵感', '装置'], createdAt: new Date(now - 2*day).toISOString(), archived: false },
      { id: MG.uid(), content: '如果把城市的灯光做成可以穿在身上的衣服，会不会让夜晚变得温柔？', mood: '🤔', tags: ['设计', '时尚'], createdAt: new Date(now - 3*day).toISOString(), archived: false },
      { id: MG.uid(), content: '在雨天的咖啡馆里，听到隔壁桌说起童年的纸飞机。突然觉得很多好的设计，都有童年的影子。', mood: '😢', tags: ['回忆', '童年'], createdAt: new Date(now - 5*day).toISOString(), archived: false },
      { id: MG.uid(), content: '今天看到蜘蛛网上的露珠，像是自然编织的项链。每个节点都恰到好处。', mood: '😌', tags: ['自然', '首饰'], createdAt: new Date(now - 7*day).toISOString(), archived: false },
      { id: MG.uid(), content: '如果用菌丝体做包装材料，是不是可以减少泡沫污染？真菌可能是环保的答案。', mood: '🔥', tags: ['环保', '材料'], createdAt: new Date(now - 8*day).toISOString(), archived: false },
      { id: MG.uid(), content: '海浪的声音总是让人平静，想做一个能听到海声的枕头。城市里需要自然的白噪音。', mood: '😆', tags: ['产品', '睡眠'], createdAt: new Date(now - 12*day).toISOString(), archived: false },
      { id: MG.uid(), content: '旧毛衣拆了可以做成什么？毛线画的质感很特别，像印象派的笔触。', mood: '🤔', tags: ['手作', '再生'], createdAt: new Date(now - 14*day).toISOString(), archived: false },
      { id: MG.uid(), content: '蚂蚁搬运食物的路线像是一个高效的物流系统。它们不需要地图，却能找到最优路径。', mood: '🌊', tags: ['自然', '系统'], createdAt: new Date(now - 20*day).toISOString(), archived: false },
      { id: MG.uid(), content: '月亮在不同文化中都是诗的源头。想做一个月相日历，记录情绪和月亮一起变化。', mood: '😌', tags: ['文化', '设计'], createdAt: new Date(now - 22*day).toISOString(), archived: false },
      { id: MG.uid(), content: '咖啡渍在纸上晕开的样子像一幅水墨画。日常的意外，常常是最美的。', mood: '🔥', tags: ['艺术', '日常'], createdAt: new Date(now - 30*day).toISOString(), archived: false }
    ];

    var ideas = [
      { id: MG.uid(), inspirationId: inspirations[0].id, content: '做一个显示"情绪时间"的钟——用不同颜色代表不同时刻的情绪。早上是清澈的蓝，午后是暖橙，深夜是深紫。指针走的不是均匀的速度，而是跟着你的感受走。', tool: '逆向花园', liked: true, tags: ['产品', '情感'], projectId: null, createdAt: new Date(now - 1*day).toISOString() },
      { id: MG.uid(), inspirationId: inspirations[1].id, content: '温度感应变色服装：在衣服中编织温感纤维，让服装随体温和外界温度变化而改变颜色。聚会时大家靠在一起，接触的地方会变成暖色。', tool: '嫁接实验室', liked: false, tags: ['时尚', '科技'], projectId: null, createdAt: new Date(now - 1*day).toISOString() },
      { id: MG.uid(), inspirationId: inspirations[4].id, content: '用回收塑料瓶做灯罩，手机闪光灯做光源，纸箱做结构——一个零成本的氛围灯。粗糙但温暖。', tool: '极限温室', liked: true, tags: ['环保', '手作'], projectId: null, createdAt: new Date(now - 2*day).toISOString() },
      { id: MG.uid(), inspirationId: inspirations[7].id, content: '像菌丝网络一样，做一个去中心化的知识分享平台。每个节点都能独立生长，又通过地下网络连接。没有中心服务器，每个人都是自己数据的根系。', tool: '自然类比', liked: false, tags: ['科技', '社区'], projectId: null, createdAt: new Date(now - 3*day).toISOString() },
      { id: MG.uid(), inspirationId: inspirations[6].id, content: '用咖啡渍把旧毛衣染成自然的暖棕色，拆了重新织——每一件都是独一无二的渐变。线的纹理里藏着咖啡的香气。', tool: '随机花粉', liked: false, tags: ['手作', '再生'], projectId: null, createdAt: new Date(now - 3*day).toISOString() },
      { id: MG.uid(), inspirationId: null, content: '想象一个完全靠声音导航的城市。每条街道有独特的音景，转角有特定的回声，广场是交响乐。盲人在这里比看得见的人更自在。', tool: '六顶思考帽', liked: false, tags: ['设计', '未来'], projectId: null, createdAt: new Date(now - 5*day).toISOString() }
    ];

    var projects = [
      {
        id: MG.uid(), name: '时间的形状', description: '关于时间感知的一系列创作——让时间变得可见、可触、可感。',
        ideaIds: [ideas[0].id], inspirationIds: [inspirations[0].id, inspirations[8].id],
        notes: '这个系列想要探索的是：时间不只是线性的流逝，它可以是情绪、是颜色、是声音。\n下一步可以做一个 Time Feeling 的展览。',
        createdAt: new Date(now - 1*day).toISOString()
      },
      {
        id: MG.uid(), name: '日常再生计划', description: '用日常废弃物创造新价值——从旧毛衣到咖啡渣，每一样都值得第二次生命。',
        ideaIds: [ideas[2].id, ideas[4].id], inspirationIds: [inspirations[4].id, inspirations[6].id],
        notes: '这个计划的核心不是"环保"，而是"珍惜"。当你有感情地对待物品，自然就不想扔掉它们了。',
        createdAt: new Date(now - 2*day).toISOString()
      }
    ];

    return { inspirations: inspirations, ideas: ideas, projects: projects };
  };

  /** 全局状态 */
  MG.state = {
    inspirations: [],
    ideas: [],
    projects: [],
    settings: Object.assign({}, defaultSettings),
    currentView: 'nursery',
    // UI 状态
    nursery: { mood: null, tags: '', content: '', filterTag: null },
    seedbox: { filterTag: null, showArchived: false },
    greenhouse: { activeInspirationId: null },
    calendar: { year: new Date().getFullYear(), month: new Date().getMonth(), selectedDate: null },
    bouquetDetail: null
  };

  /** 保存到 localStorage */
  MG.save = function() {
    try {
      var data = {
        version: MG.DATA_VERSION,
        inspirations: MG.state.inspirations,
        ideas: MG.state.ideas,
        projects: MG.state.projects,
        settings: MG.state.settings
      };
      localStorage.setItem(MG.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('保存失败:', e);
    }
  };

  /** 防抖保存（300ms），用于频繁操作 */
  MG._saveTimer = null;
  MG.markDirty = function() {
    clearTimeout(MG._saveTimer);
    MG._saveTimer = setTimeout(function() { MG.save(); }, 300);
  };

  /** 校验并补全数据 */
  MG.validateData = function(data) {
    if (!data || typeof data !== 'object') return null;

    if (!Array.isArray(data.inspirations)) return null;
    data.inspirations = data.inspirations.map(function(insp) {
      if (!insp || typeof insp !== 'object' || !insp.id || !insp.createdAt) return null;
      insp.content = typeof insp.content === 'string' ? insp.content : '';
      insp.mood = insp.mood || '🌱';
      insp.tags = Array.isArray(insp.tags) ? insp.tags : [];
      insp.archived = !!insp.archived;
      return insp;
    }).filter(Boolean);

    if (!Array.isArray(data.ideas)) return null;
    data.ideas = data.ideas.map(function(idea) {
      if (!idea || typeof idea !== 'object' || !idea.id || !idea.createdAt) return null;
      idea.content = typeof idea.content === 'string' ? idea.content : '';
      idea.tool = idea.tool || '';
      idea.liked = !!idea.liked;
      idea.tags = Array.isArray(idea.tags) ? idea.tags : [];
      idea.projectId = idea.projectId || null;
      idea.inspirationId = idea.inspirationId || null;
      return idea;
    }).filter(Boolean);

    if (!Array.isArray(data.projects)) return null;
    data.projects = data.projects.map(function(p) {
      if (!p || typeof p !== 'object' || !p.id || !p.createdAt) return null;
      p.name = typeof p.name === 'string' ? p.name : '';
      p.description = typeof p.description === 'string' ? p.description : '';
      p.ideaIds = Array.isArray(p.ideaIds) ? p.ideaIds : [];
      p.inspirationIds = Array.isArray(p.inspirationIds) ? p.inspirationIds : [];
      p.notes = typeof p.notes === 'string' ? p.notes : '';
      return p;
    }).filter(Boolean);

    if (data.settings && typeof data.settings === 'object') {
      data.settings = Object.assign({}, defaultSettings, data.settings);
    } else {
      data.settings = Object.assign({}, defaultSettings);
    }

    return data;
  };

  /** 数据版本迁移 */
  MG.migrateData = function(data) {
    var fromVersion = data.version || 0;

    if (fromVersion < 1) {
      // v0 → v1: 确保所有必需字段存在（首次引入版本号）
      data.inspirations = (data.inspirations || []).map(function(i) {
        i.archived = i.archived || false;
        i.tags = Array.isArray(i.tags) ? i.tags : [];
        return i;
      });
    }

    data.version = MG.DATA_VERSION;
    return data;
  };

  /** 从 localStorage 加载，无数据则用示例 */
  MG.load = function() {
    try {
      var raw = localStorage.getItem(MG.STORAGE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        var needsSave = false;

        // 版本迁移
        if (!data.version || data.version < MG.DATA_VERSION) {
          data = MG.migrateData(data);
          needsSave = true;
        }

        // 数据校验
        data = MG.validateData(data);
        if (!data) {
          console.warn('数据校验失败，使用示例数据');
          MG.toast('数据加载失败，使用示例数据');
          data = MG.createSampleData();
        }

        MG.state.inspirations = data.inspirations;
        MG.state.ideas = data.ideas;
        MG.state.projects = data.projects;
        MG.state.settings = data.settings;

        if (needsSave) MG.save();
      } else {
        var sample = MG.createSampleData();
        MG.state.inspirations = sample.inspirations;
        MG.state.ideas = sample.ideas;
        MG.state.projects = sample.projects;
        MG.save();
      }
    } catch (e) {
      console.warn('加载失败，使用示例数据:', e);
      MG.toast('数据加载失败，使用示例数据');
      var sample = MG.createSampleData();
      MG.state.inspirations = sample.inspirations;
      MG.state.ideas = sample.ideas;
      MG.state.projects = sample.projects;
    }
    // 设置主题
    document.documentElement.setAttribute('data-theme', MG.state.settings.theme);
  };

})(window.MindGarden);
