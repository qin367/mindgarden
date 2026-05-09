/* ================================================================
   MindGarden 创意花园 — 入口与初始化
   ================================================================
   加载顺序：config → utils → modal → state → render → tools → export → events → main
   ================================================================ */
(function() {
  'use strict';

  var MG = window.MindGarden;

  // ================================================================
  // 主题切换按钮
  // ================================================================

  document.getElementById('themeToggle').addEventListener('click', function() {
    MG.state.settings.theme = MG.state.settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', MG.state.settings.theme);
    MG.save();
    MG.updateTopBar();
  });

  // ================================================================
  // 模态框背景点击关闭
  // ================================================================

  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('modalOverlay')) {
      var content = document.getElementById('toolResultContent');
      if (content && content.value.trim()) {
        if (!confirm('关闭模态框将丢失未保存的内容，确定关闭吗？')) return;
      }
      MG.closeModal(null);
    }
  });

  // ================================================================
  // 导航点击（data-view 路由）
  // ================================================================

  var tabs = document.querySelectorAll('.nav-tab');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var view = tab.dataset.view;
      if (view) {
        MG.state.currentView = view;
        MG.state.bouquetDetail = null;
        MG.render();
        MG.announce('已切换到' + tab.querySelector('.nav-label').textContent + '视图');
      }
    });
  });

  // 侧边栏键盘导航（方向键切换 tab）
  document.getElementById('sidebar').addEventListener('keydown', function(e) {
    var tabArray = Array.from(tabs);
    var currentIndex = tabArray.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    var newIndex = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabArray.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabArray.length - 1;
    }

    if (newIndex !== -1) {
      e.preventDefault();
      tabArray[newIndex].click();
      tabArray[newIndex].focus();
    }
  });

  // ================================================================
  // 应用内点击与输入事件委托
  // ================================================================

  document.getElementById('view-container').addEventListener('click', MG.handleClick);
  document.getElementById('view-container').addEventListener('input', MG.handleInput);
  document.getElementById('view-container').addEventListener('change', MG.handleInput);

  // 模态框内的按钮也需要委托（模态框在 view-container 之外）
  document.getElementById('modalCard').addEventListener('click', MG.handleClick);

  // ================================================================
  // 文件导入的 change 事件
  // ================================================================

  // importFileInput 由 renderSettings() 动态渲染，用事件委托处理
  document.body.addEventListener('change', function(e) {
    if (e.target.id !== 'importFileInput') return;
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (data.inspirations) MG.state.inspirations = data.inspirations;
        if (data.ideas) MG.state.ideas = data.ideas;
        if (data.projects) MG.state.projects = data.projects;
        if (data.settings) MG.state.settings = Object.assign(MG.state.settings, data.settings);
        MG.save();
        MG.render();
        MG.toast('📥 导入成功！');
      } catch (err) {
        MG.toast('❌ 导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // ================================================================
  // 初始化
  // ================================================================

  try {
    MG.load();
    MG.render();
    MG.updateTopBar();
  } catch (err) {
    console.error('Initialization error:', err);
    document.body.innerHTML = '<div style="text-align:center;padding:60px 20px;font-family:sans-serif;">' +
      '<div style="font-size:3rem;margin-bottom:16px;">⚠️</div>' +
      '<h2>应用加载失败</h2>' +
      '<p style="color:#666;">请刷新页面重试，如果问题持续存在，请清除浏览器缓存。</p>' +
      '<button onclick="localStorage.removeItem(\'mindgarden_data\');location.reload()" ' +
      'style="margin-top:16px;padding:8px 24px;border:none;border-radius:8px;background:#8fa88a;color:#fff;font-size:1rem;cursor:pointer;">' +
      '重置数据并刷新</button></div>';
  }

  // ================================================================
  // 全局错误处理
  // ================================================================

  window.onerror = function(msg, url, line) {
    console.error('Global error:', msg, url, line);
    if (typeof MG !== 'undefined' && MG.toast) MG.toast('发生了一个意外错误');
  };

  window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    if (typeof MG !== 'undefined' && MG.toast) MG.toast('操作失败');
  });

})();
