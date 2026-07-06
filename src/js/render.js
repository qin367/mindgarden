/* ================================================================
   MindGarden 创意花园 — 渲染函数（MG.html 模板版）
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  /** 上次渲染的视图 */
  MG._lastRenderedView = null;

  /** 强制全量渲染 */
  MG.forceRender = function() {
    MG._lastRenderedView = null;
    MG.render();
  };

  /** 主渲染入口 */
  MG.render = function(options) {
    try {
      options = options || {};
      var view = MG.state.currentView;
      var container = document.getElementById('view-container');
      var scrollTop = container.scrollTop;

      if (options.fullViewChange || MG._lastRenderedView !== view) {
        container.innerHTML = renderView(view);
        MG._lastRenderedView = view;
      } else {
        updateView(view, container);
      }

      container.scrollTop = scrollTop;

      document.querySelectorAll('.nav-tab').forEach(function(tab) {
        var isActive = tab.dataset.view === view;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });
      MG.updateTopBar();
    } catch (err) {
      console.error('Render error:', err);
      document.getElementById('view-container').innerHTML =
        '<div class="empty-state"><div class="empty-icon">⚠️</div><p>渲染出错了，请刷新页面重试</p>' +
        '<button class="btn btn-primary" onclick="location.reload()">刷新</button></div>';
      MG.toast('渲染出错，请刷新页面');
    }
  };

  function renderView(view) {
    var result;
    switch (view) {
      case 'nursery': result = renderNursery(); break;
      case 'seedbox': result = renderSeedBox(); break;
      case 'greenhouse': result = renderGreenhouse(); break;
      case 'harvest': result = renderHarvest(); break;
      case 'bouquet': result = MG.state.bouquetDetail ? renderBouquetDetail() : renderBouquetList(); break;
      case 'gardenmap': result = renderGardenMap(); break;
      case 'calendar': result = renderCalendar(); break;
      case 'settings': result = renderSettings(); break;
      default: result = renderNursery();
    }
    // MG.raw() 返回的对象需要解包为字符串
    return (result && result.__raw) ? result.value : result;
  }

  function updateView(view, container) {
    switch (view) {
      case 'nursery': updateNursery(); break;
      case 'seedbox': updateSeedBox(); break;
      case 'greenhouse': updateGreenhouse(); break;
      case 'harvest': updateHarvest(); break;
      case 'bouquet': updateBouquet(); break;
      case 'gardenmap': updateGardenMap(); break;
      case 'calendar': updateCalendar(); break;
      default: container.innerHTML = renderView(view);
    }
  }

  // ==================== 辅助函数 ====================

  function replaceEl(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function renderInspirationCard(insp, showActions) {
    var eid = MG.escapeHtml(insp.id);
    var actions = showActions === 'seedbox'
      ? MG.raw(
        '<button class="btn btn-sm btn-primary" data-action="cultivate" data-id="' + eid + '">🌱 培育</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="edit-inspiration" data-id="' + eid + '">✏️ 编辑</button>' +
        (insp.archived
          ? '<button class="btn btn-sm btn-ghost" data-action="unarchive-inspiration" data-id="' + eid + '">📂 恢复</button>'
          : '<button class="btn btn-sm btn-ghost" data-action="archive-inspiration" data-id="' + eid + '">📦 归档</button>') +
        '<button class="btn btn-sm btn-danger" data-action="delete-inspiration" data-id="' + eid + '">🗑️ 删除</button>')
      : MG.raw(
        '<button class="btn btn-sm btn-primary" data-action="cultivate" data-id="' + eid + '">🌱 培育</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="edit-inspiration" data-id="' + eid + '">✏️ 编辑</button>' +
        '<button class="btn btn-sm btn-ghost" data-action="archive-inspiration" data-id="' + eid + '">📦 归档</button>');

    return MG.html`<div class="inspiration-item${insp.archived ? ' archived' : ''}" data-id="${insp.id}">
      <div class="inspiration-header">
        <span class="inspiration-mood">${insp.mood || '🤍'}</span>
        <span class="inspiration-time">${MG.formatDate(insp.createdAt)}${showActions === 'seedbox' ? ' · ' + new Date(insp.createdAt).toLocaleDateString('zh-CN') : ''}</span>
      </div>
      <div class="inspiration-content">${insp.content}</div>
      <div class="inspiration-tags">${MG.raw(insp.tags.map(function(t) { return '<span class="inspiration-tag">#' + MG.escapeHtml(t) + '</span>'; }).join(''))}</div>
      ${insp.archived && showActions === 'seedbox' ? MG.raw('<span style="font-size:0.8rem;color:var(--text-muted);">📦 已归档</span>') : ''}
      <div class="inspiration-actions">${actions}</div>
    </div>`;
  }

  function renderFilterBar(allTags, filterTag, action) {
    if (allTags.length === 0) return '';
    return '<div class="filter-bar">' +
      '<button class="filter-tag ' + (!filterTag ? 'active' : '') + '" data-action="' + action + '" data-tag="">全部</button>' +
      allTags.map(function(t) {
        return '<button class="filter-tag ' + (filterTag === t ? 'active' : '') + '" data-action="' + action + '" data-tag="' + MG.escapeHtml(t) + '">#' + MG.escapeHtml(t) + '</button>';
      }).join('') +
    '</div>';
  }

  // ==================== 苗圃 ====================

  function renderNursery() {
    var items = MG.state.inspirations.filter(function(i) { return !i.archived; });
    var allTags = Array.from(new Set(items.flatMap(function(i) { return i.tags; })));
    var filterTag = MG.state.nursery.filterTag;
    var filtered = filterTag ? items.filter(function(i) { return i.tags.includes(filterTag); }) : items;

    var listHTML = filtered.length > 0
      ? filtered.map(function(insp) { return renderInspirationCard(insp, 'nursery'); }).join('')
      : '<div class="empty-state"><div class="empty-icon">🌱</div><p>还没有灵感，种下第一颗种子吧</p></div>';

    var moods = ['😌', '😆', '🤔', '😢', '🔥', '🌊'];
    var moodBtns = moods.map(function(m) {
      return '<button class="mood-btn ' + (MG.state.nursery.mood === m ? 'active' : '') + '" data-action="select-mood" data-mood="' + m + '">' + m + '</button>';
    }).join('');

    return MG.html`<div class="nursery-input-card">
      <div class="mood-selector" id="moodSelector" role="radiogroup" aria-label="选择心情">${MG.raw(moodBtns)}</div>
      <textarea class="nursery-textarea" id="nurseryContent" placeholder="今天风里有什么味道？记下来吧……" rows="3">${MG.state.nursery.content}</textarea>
      <div class="nursery-tags-row">
        <input class="tag-input" id="nurseryTags" placeholder="#标签 用 # 分割" value="${MG.state.nursery.tags}">
        <button class="btn btn-primary" data-action="save-inspiration">🌱 种下灵感</button>
      </div>
    </div>
    <div id="nurseryInspirationList">
      <h3 style="font-size:1rem;color:var(--text-secondary);margin-bottom:12px;">🌰 种子箱 · 最近的灵感</h3>
      ${MG.raw(renderFilterBar(allTags, filterTag, 'filter-tag'))}
      <div class="inspiration-list" role="list">${MG.raw(listHTML)}</div>
    </div>`;
  }

  // ==================== 种子箱 ====================

  function renderSeedBox() {
    var items = Array.from(MG.state.inspirations).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var filtered = MG.state.seedbox.showArchived ? items : items.filter(function(i) { return !i.archived; });
    var allTags = Array.from(new Set(items.flatMap(function(i) { return i.tags; })));
    var filterTag = MG.state.seedbox.filterTag;
    var finalItems = filterTag ? filtered.filter(function(i) { return i.tags.includes(filterTag); }) : filtered;

    var listHTML = finalItems.length > 0
      ? finalItems.map(function(insp) { return renderInspirationCard(insp, 'seedbox'); }).join('')
      : '<div class="empty-state"><div class="empty-icon">🌰</div><p>种子箱是空的，去苗圃种点灵感吧</p></div>';

    return MG.raw(
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
        '<h3 style="font-size:1.1rem;">🌰 种子箱 · 所有灵感</h3>' +
        '<label data-action="toggle-archived" style="font-size:0.9rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;cursor:pointer;">' +
          '<input type="checkbox" ' + (MG.state.seedbox.showArchived ? 'checked' : '') + '> 显示已归档' +
        '</label>' +
      '</div>' +
      '<div id="seedboxList">' +
        renderFilterBar(allTags, filterTag, 'sfilter-tag') +
        '<div class="inspiration-list" role="list">' + listHTML + '</div>' +
      '</div>'
    );
  }

  // ==================== 思维温室 ====================

  function renderGreenhouse() {
    var activeInsp = MG.state.greenhouse.activeInspirationId
      ? MG.state.inspirations.find(function(i) { return i.id === MG.state.greenhouse.activeInspirationId; })
      : null;

    var banner = activeInsp
      ? MG.html`<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 6px var(--shadow);">
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">🌱 当前培育的灵感</div>
          <div style="font-size:0.95rem;color:var(--text-primary);">${activeInsp.content}</div>
          <div style="margin-top:8px;"><button class="btn btn-sm btn-ghost" data-action="clear-active-inspiration">清除选择</button></div>
        </div>`
      : '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 6px var(--shadow);text-align:center;color:var(--text-muted);font-size:0.9rem;">💡 从苗圃或种子箱点击 "🌱 培育" 带上一个灵感，或直接用下面的工具自由创造</div>';

    var toolGrid = MG.TOOLS.map(function(t, i) {
      return '<div class="tool-card" data-action="open-tool" data-tool-index="' + i + '" role="button" aria-label="打开' + MG.escapeHtml(t.name) + '工具：' + MG.escapeHtml(t.desc) + '">' +
        '<div class="tool-icon">' + t.icon + '</div>' +
        '<div class="tool-name">' + MG.escapeHtml(t.name) + '</div>' +
        '<div class="tool-desc">' + MG.escapeHtml(t.desc) + '</div>' +
      '</div>';
    }).join('');

    return banner + '<div class="tool-grid">' + toolGrid + '</div>';
  }

  // ==================== 收获篮 ====================

  function renderHarvest() {
    var items = Array.from(MG.state.ideas).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var projects = MG.state.projects;

    var listHTML = items.length > 0
      ? items.map(function(idea) {
          var proj = idea.projectId ? projects.find(function(p) { return p.id === idea.projectId; }) : null;
          var optionsHTML = projects.map(function(p) {
            return '<option value="' + MG.escapeHtml(p.id) + '" ' + (idea.projectId === p.id ? 'selected' : '') + '>' + MG.escapeHtml(p.name) + '</option>';
          }).join('');

          return MG.html`<div class="idea-card${idea.liked ? ' liked' : ''}" data-id="${idea.id}">
            <span class="idea-tool-label">🔬 ${idea.tool}</span>
            ${proj ? MG.raw('<span style="font-size:0.75rem;color:var(--accent-terracotta);margin-left:6px;">💐 ' + MG.escapeHtml(proj.name) + '</span>') : ''}
            <div class="idea-content">${idea.content}</div>
            <div class="idea-tags" style="margin-bottom:8px;">${MG.raw(idea.tags.map(function(t) { return '<span class="inspiration-tag">#' + MG.escapeHtml(t) + '</span>'; }).join(''))}</div>
            <div class="idea-actions">
              <button class="btn btn-sm ${idea.liked ? 'btn-terracotta' : 'btn-ghost'}" data-action="toggle-like" data-id="${idea.id}">${idea.liked ? '❤️' : '🤍'} 喜欢</button>
              <button class="btn btn-sm btn-ghost" data-action="edit-idea" data-id="${idea.id}">✏️</button>
              <select class="form-input" style="width:auto;padding:4px 8px;font-size:0.8rem;" data-action="idea-project" data-id="${idea.id}" aria-label="选择归属花束">
                <option value="">📁 归入花束</option>${MG.raw(optionsHTML)}
              </select>
              <button class="btn btn-sm btn-ghost" data-action="delete-idea" data-id="${idea.id}">🗑️</button>
              <span class="idea-time">${MG.formatDate(idea.createdAt)}</span>
            </div>
          </div>`;
        }).join('')
      : '<div class="empty-state"><div class="empty-icon">🧺</div><p>收获篮还空着，去温室培育一些点子吧</p></div>';

    return MG.html`<h3 style="font-size:1.1rem;margin-bottom:16px;">🧺 收获篮 · 所有点子 (${items.length})</h3>
      <div id="harvestList" class="idea-grid">${MG.raw(listHTML)}</div>`;
  }

  // ==================== 花束 ====================

  function renderBouquetList() {
    var items = MG.state.projects;
    var listHTML = items.length > 0
      ? items.map(function(p) {
          return MG.html`<div class="bouquet-card">
            <div class="bouquet-header">
              <span class="bouquet-name">💐 ${p.name}</span>
              <span class="bouquet-count">${p.ideaIds.length} 个点子 · ${p.inspirationIds.length} 个灵感</span>
            </div>
            <div class="bouquet-desc">${p.description}</div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm btn-primary" data-action="view-bouquet" data-id="${p.id}">查看详情</button>
              <button class="btn btn-sm btn-ghost bouquet-export-btn" data-action="export-bouquet" data-id="${p.id}">📥 导出 Markdown</button>
              <button class="btn btn-sm btn-danger" data-action="delete-bouquet" data-id="${p.id}">🗑️</button>
            </div>
          </div>`;
        }).join('')
      : '<div class="empty-state"><div class="empty-icon">💐</div><p>还没有花束，创建一个来收集你的点子吧</p></div>';

    return MG.raw(
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
        '<h3 style="font-size:1.1rem;">💐 花束 · 项目集</h3>' +
        '<button class="btn btn-primary" data-action="create-bouquet">💐 新花束</button>' +
      '</div>' +
      '<div id="bouquetContent" class="bouquet-list">' + listHTML + '</div>'
    );
  }

  function renderBouquetDetail() {
    var p = MG.state.projects.find(function(pr) { return pr.id === MG.state.bouquetDetail; });
    if (!p) { MG.state.bouquetDetail = null; return renderBouquetList(); }

    var projectIdeas = MG.state.ideas.filter(function(i) { return p.ideaIds.includes(i.id); });
    var projectInspirations = MG.state.inspirations.filter(function(i) { return p.inspirationIds.includes(i.id); });
    var availableIdeas = MG.state.ideas.filter(function(i) { return !p.ideaIds.includes(i.id); });
    var availableInspirations = MG.state.inspirations.filter(function(i) { return !p.inspirationIds.includes(i.id) && !i.archived; });

    var ideasListHTML = projectIdeas.length > 0
      ? '<ul class="sortable-list">' + projectIdeas.map(function(idea) {
          return '<li class="sortable-item" data-idea-id="' + MG.escapeHtml(idea.id) + '"><span>🔬</span><span style="flex:1;">' +
            MG.escapeHtml(idea.content.slice(0, 60)) + (idea.content.length > 60 ? '…' : '') +
            '</span><button class="btn btn-sm btn-ghost" data-action="remove-idea-from-bouquet" data-bid="' + MG.escapeHtml(p.id) + '" data-iid="' + MG.escapeHtml(idea.id) + '">✕</button></li>';
        }).join('') + '</ul>'
      : '<p style="color:var(--text-muted);font-size:0.9rem;">还没有加入点子</p>';

    var inspsListHTML = projectInspirations.length > 0
      ? '<ul class="sortable-list">' + projectInspirations.map(function(insp) {
          return '<li class="sortable-item"><span>' + MG.escapeHtml(insp.mood || '🌱') + '</span><span style="flex:1;">' +
            MG.escapeHtml(insp.content.slice(0, 60)) + (insp.content.length > 60 ? '…' : '') +
            '</span><button class="btn btn-sm btn-ghost" data-action="remove-insp-from-bouquet" data-bid="' + MG.escapeHtml(p.id) + '" data-iid="' + MG.escapeHtml(insp.id) + '">✕</button></li>';
        }).join('') + '</ul>'
      : '<p style="color:var(--text-muted);font-size:0.9rem;">还没有加入灵感</p>';

    var addIdeasHTML = availableIdeas.length > 0
      ? '<select class="form-input" id="addIdeaSelect"><option value="">选择点子…</option>' +
        availableIdeas.map(function(i) { return '<option value="' + MG.escapeHtml(i.id) + '">' + MG.escapeHtml(i.content.slice(0, 50)) + (i.content.length > 50 ? '…' : '') + '</option>'; }).join('') +
        '</select><button class="btn btn-sm btn-primary" style="margin-top:8px;" data-action="add-idea-to-bouquet" data-bid="' + MG.escapeHtml(p.id) + '">＋ 加入</button>'
      : '<p style="color:var(--text-muted);font-size:0.9rem;">所有点子都已加入</p>';

    var addInspsHTML = availableInspirations.length > 0
      ? '<select class="form-input" id="addInspSelect"><option value="">选择灵感…</option>' +
        availableInspirations.map(function(i) { return '<option value="' + MG.escapeHtml(i.id) + '">' + MG.escapeHtml(i.content.slice(0, 50)) + (i.content.length > 50 ? '…' : '') + '</option>'; }).join('') +
        '</select><button class="btn btn-sm btn-primary" style="margin-top:8px;" data-action="add-insp-to-bouquet" data-bid="' + MG.escapeHtml(p.id) + '">＋ 加入</button>'
      : '<p style="color:var(--text-muted);font-size:0.9rem;">所有灵感都已加入</p>';

    return MG.raw(
      '<button class="back-btn" data-action="back-bouquet-list">← 返回花束列表</button>' +
      '<div class="bouquet-card" style="margin-bottom:16px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div><h3 style="font-size:1.2rem;">💐 ' + MG.escapeHtml(p.name) + '</h3>' +
          '<p style="color:var(--text-secondary);font-size:0.9rem;margin:4px 0 8px;">' + MG.escapeHtml(p.description) + '</p></div>' +
          '<button class="btn btn-sm btn-terracotta" data-action="export-bouquet" data-id="' + MG.escapeHtml(p.id) + '">📥 导出 Markdown</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">' +
        '<div class="settings-section"><h3>🧺 已加入的点子 (' + projectIdeas.length + ')</h3>' + ideasListHTML + '</div>' +
        '<div class="settings-section"><h3>🌰 已加入的灵感 (' + projectInspirations.length + ')</h3>' + inspsListHTML + '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">' +
        '<div class="settings-section"><h3>📎 添加点子</h3>' + addIdeasHTML + '</div>' +
        '<div class="settings-section"><h3>📎 添加灵感</h3>' + addInspsHTML + '</div>' +
      '</div>' +
      '<div class="settings-section"><h3>📝 备注</h3>' +
        '<textarea class="edit-textarea" id="bouquetNotes" rows="4">' + MG.escapeHtml(p.notes || '') + '</textarea>' +
        '<button class="btn btn-sm btn-primary" data-action="save-bouquet-notes" data-bid="' + MG.escapeHtml(p.id) + '">保存备注</button>' +
      '</div>'
    );
  }

  // ==================== 花园地图 ====================

  function renderGardenMap() {
    var inspirationsWithIdeas = MG.state.inspirations.filter(function(insp) {
      return MG.state.ideas.some(function(idea) { return idea.inspirationId === insp.id; });
    });

    if (inspirationsWithIdeas.length === 0) {
      return '<div class="empty-state"><div class="empty-icon">🗺️</div><p>还没有关联的灵感树，在温室里培育一些点子吧</p></div>';
    }

    function getToolColor(toolName) {
      var idx = MG.TOOLS.findIndex(function(t) { return t.name === toolName; });
      var colors = ['#c17f59', '#8fa88a', '#d4a853', '#7a9a74', '#b87855', '#c8956a', '#a88a6a', '#8a9a7a'];
      return colors[idx % colors.length] || '#8fa88a';
    }

    var mapHTML = inspirationsWithIdeas.map(function(insp) {
      var relatedIdeas = MG.state.ideas.filter(function(idea) { return idea.inspirationId === insp.id; });
      var childrenHTML = relatedIdeas.map(function(idea) {
        var color = getToolColor(idea.tool);
        return '<div class="map-child" style="border-left:3px solid ' + color + ';">' +
          '<span class="tool-dot" style="background:' + color + ';"></span>' +
          '<span style="font-size:0.75rem;color:var(--text-muted);">🔬 ' + MG.escapeHtml(idea.tool) + '</span>' +
          '<div style="margin-top:4px;">' + MG.escapeHtml(idea.content.slice(0, 80)) + (idea.content.length > 80 ? '…' : '') + '</div>' +
          (idea.liked ? '<span style="font-size:0.8rem;">❤️</span>' : '') +
        '</div>';
      }).join('');

      return '<div class="map-root"><span style="font-size:1.3rem;">' + MG.escapeHtml(insp.mood || '🌱') + '</span>' +
        '<div><div style="font-size:0.95rem;">' + MG.escapeHtml(insp.content) + '</div>' +
        '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">' + insp.tags.map(function(t) { return '#' + MG.escapeHtml(t); }).join(' ') + '</div></div></div>' +
        '<div class="map-children">' + childrenHTML + '</div>';
    }).join('<div style="border-top:1px solid var(--border);margin:8px 0;"></div>');

    return '<h3 style="font-size:1.1rem;margin-bottom:16px;">🗺️ 花园地图 · 灵感树</h3>' +
      '<div id="gardenMapContent" class="garden-map"><div class="map-tree">' + mapHTML + '</div></div>';
  }

  // ==================== 手账日历 ====================

  function renderCalendar() {
    var cal = MG.state.calendar;
    var year = cal.year, month = cal.month, selectedDate = cal.selectedDate;
    var firstDay = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var daysInPrevMonth = new Date(year, month, 0).getDate();
    var todayStr = MG.toDateStr(new Date().toISOString());

    var entriesByDate = {};
    MG.state.inspirations.forEach(function(insp) {
      var ds = MG.toDateStr(insp.createdAt);
      if (!entriesByDate[ds]) entriesByDate[ds] = [];
      entriesByDate[ds].push({ type: 'inspiration', data: insp });
    });
    MG.state.ideas.forEach(function(idea) {
      var ds = MG.toDateStr(idea.createdAt);
      if (!entriesByDate[ds]) entriesByDate[ds] = [];
      entriesByDate[ds].push({ type: 'idea', data: idea });
    });

    var cells = [];
    for (var i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, otherMonth: true });
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      cells.push({ day: d, dateStr: dateStr, isToday: dateStr === todayStr, hasEntry: !!entriesByDate[dateStr] });
    }
    var remaining = Math.max(0, 42 - cells.length);
    for (var j = 1; j <= remaining; j++) cells.push({ day: j, otherMonth: true });

    var monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

    var gridHTML = cells.map(function(cell) {
      if (cell.otherMonth) return '<div class="calendar-day other-month">' + cell.day + '</div>';
      var cls = 'calendar-day' + (cell.isToday ? ' today' : '') + (cell.hasEntry ? ' has-entry' : '') + (selectedDate === cell.dateStr ? ' selected' : '');
      return '<div class="' + cls + '" data-action="select-date" data-date="' + cell.dateStr + '">' + cell.day + '</div>';
    }).join('');

    var entriesHTML = '';
    if (selectedDate && entriesByDate[selectedDate]) {
      entriesHTML = '<div class="calendar-entries"><div class="calendar-entries-title">📝 ' + selectedDate + ' 的条目</div>' +
        entriesByDate[selectedDate].map(function(e) {
          if (e.type === 'inspiration') {
            return '<div class="inspiration-item" style="margin-bottom:8px;">' +
              '<div class="inspiration-header"><span class="inspiration-mood">' + MG.escapeHtml(e.data.mood || '🌱') + '</span><span class="inspiration-time">灵感</span></div>' +
              '<div class="inspiration-content">' + MG.escapeHtml(e.data.content) + '</div>' +
              '<div class="inspiration-tags">' + e.data.tags.map(function(t) { return '<span class="inspiration-tag">#' + MG.escapeHtml(t) + '</span>'; }).join('') + '</div></div>';
          }
          return '<div class="idea-card" style="margin-bottom:8px;"><span class="idea-tool-label">🔬 ' + MG.escapeHtml(e.data.tool) + '</span><div class="idea-content">' + MG.escapeHtml(e.data.content) + '</div></div>';
        }).join('') + '</div>';
    } else if (selectedDate) {
      entriesHTML = '<div class="calendar-entries"><p style="color:var(--text-muted);">这一天还没有记录</p></div>';
    }

    var weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    var weekdayHTML = weekdays.map(function(w) { return '<div class="calendar-weekday">' + w + '</div>'; }).join('');

    return '<div class="calendar-header">' +
        '<button class="calendar-nav" data-action="prev-month">‹</button>' +
        '<div class="calendar-title">' + year + ' ' + monthNames[month] + '</div>' +
        '<button class="calendar-nav" data-action="next-month">›</button>' +
      '</div>' +
      '<div id="calendarGrid" class="calendar-grid" role="grid">' + weekdayHTML + gridHTML + '</div>' +
      '<div id="calendarEntries">' + entriesHTML + '</div>';
  }

  // ==================== 设置 ====================

  function renderSettings() {
    var s = MG.state.settings;
    return MG.raw(
      '<div class="settings-section">' +
        '<h3>🌐 AI 深度扩展</h3>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">配置兼容 OpenAI 的 API（如 Ollama 本地或任意 OpenAI 兼容端点），启用后可在温室中使用 AI 辅助扩展创意。</p>' +
        '<div class="form-group"><label>API 端点</label>' +
          '<input class="form-input" id="setApiEndpoint" value="' + MG.escapeHtml(s.apiEndpoint) + '" placeholder="http://localhost:11434/v1/chat/completions"></div>' +
        '<div class="form-group"><label>API 密钥</label>' +
          '<input class="form-input" id="setApiKey" value="' + MG.escapeHtml(s.apiKey) + '" placeholder="sk-... (可选)"></div>' +
        '<div class="form-group"><label>模型</label>' +
          '<input class="form-input" id="setApiModel" value="' + MG.escapeHtml(s.apiModel) + '" placeholder="gpt-3.5-turbo"></div>' +
        '<div style="display:flex;gap:10px;">' +
          '<button class="btn btn-primary" data-action="save-api-settings">保存设置</button>' +
          '<button class="btn btn-ghost" data-action="test-api-connection">🔌 测试连接</button></div>' +
      '</div>' +
      '<div class="settings-section"><h3>🎨 主题</h3>' +
        '<div style="display:flex;gap:10px;">' +
          '<button class="btn ' + (s.theme === 'light' ? 'btn-primary' : 'btn-ghost') + '" data-action="set-theme" data-theme="light">☀️ 浅色</button>' +
          '<button class="btn ' + (s.theme === 'dark' ? 'btn-primary' : 'btn-ghost') + '" data-action="set-theme" data-theme="dark">🌙 深色</button></div>' +
      '</div>' +
      '<div class="settings-section"><h3>💾 数据管理</h3>' +
        '<div class="settings-actions">' +
          '<button class="btn btn-primary" data-action="export-json">📤 导出 JSON</button>' +
          '<button class="btn btn-ghost" data-action="import-json">📥 导入 JSON</button>' +
          '<button class="btn btn-ghost" data-action="export-html">📄 导出纪念册 HTML</button>' +
          '<button class="btn btn-danger" data-action="reset-data">⚠️ 重置数据</button></div>' +
        '<input type="file" id="importFileInput" accept=".json" style="display:none">' +
      '</div>'
    );
  }

  // ==================== 局部更新函数 ====================

  function updateNursery() {
    var items = MG.state.inspirations.filter(function(i) { return !i.archived; });
    var allTags = Array.from(new Set(items.flatMap(function(i) { return i.tags; })));
    var filterTag = MG.state.nursery.filterTag;
    var filtered = filterTag ? items.filter(function(i) { return i.tags.includes(filterTag); }) : items;

    var listHTML = filtered.length > 0
      ? filtered.map(function(insp) { return renderInspirationCard(insp, 'nursery'); }).join('')
      : '<div class="empty-state"><div class="empty-icon">🌱</div><p>还没有灵感，种下第一颗种子吧</p></div>';

    replaceEl('nurseryInspirationList',
      '<h3 style="font-size:1rem;color:var(--text-secondary);margin-bottom:12px;">🌰 种子箱 · 最近的灵感</h3>' +
      renderFilterBar(allTags, filterTag, 'filter-tag') +
      '<div class="inspiration-list" role="list">' + listHTML + '</div>'
    );
  }

  function updateSeedBox() {
    var items = Array.from(MG.state.inspirations).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var filtered = MG.state.seedbox.showArchived ? items : items.filter(function(i) { return !i.archived; });
    var allTags = Array.from(new Set(items.flatMap(function(i) { return i.tags; })));
    var filterTag = MG.state.seedbox.filterTag;
    var finalItems = filterTag ? filtered.filter(function(i) { return i.tags.includes(filterTag); }) : filtered;

    var listHTML = finalItems.length > 0
      ? finalItems.map(function(insp) { return renderInspirationCard(insp, 'seedbox'); }).join('')
      : '<div class="empty-state"><div class="empty-icon">🌰</div><p>种子箱是空的，去苗圃种点灵感吧</p></div>';

    replaceEl('seedboxList',
      renderFilterBar(allTags, filterTag, 'sfilter-tag') +
      '<div class="inspiration-list" role="list">' + listHTML + '</div>'
    );
  }

  function updateGreenhouse() {
    var activeInsp = MG.state.greenhouse.activeInspirationId
      ? MG.state.inspirations.find(function(i) { return i.id === MG.state.greenhouse.activeInspirationId; })
      : null;

    var banner = activeInsp
      ? '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 6px var(--shadow);">' +
          '<div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">🌱 当前培育的灵感</div>' +
          '<div style="font-size:0.95rem;color:var(--text-primary);">' + MG.escapeHtml(activeInsp.content) + '</div>' +
          '<div style="margin-top:8px;"><button class="btn btn-sm btn-ghost" data-action="clear-active-inspiration">清除选择</button></div></div>'
      : '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:20px;box-shadow:0 1px 6px var(--shadow);text-align:center;color:var(--text-muted);font-size:0.9rem;">💡 从苗圃或种子箱点击 "🌱 培育" 带上一个灵感，或直接用下面的工具自由创造</div>';

    var toolGrid = MG.TOOLS.map(function(t, i) {
      return '<div class="tool-card" data-action="open-tool" data-tool-index="' + i + '" role="button" aria-label="打开' + MG.escapeHtml(t.name) + '工具">' +
        '<div class="tool-icon">' + t.icon + '</div><div class="tool-name">' + MG.escapeHtml(t.name) + '</div><div class="tool-desc">' + MG.escapeHtml(t.desc) + '</div></div>';
    }).join('');

    var container = document.getElementById('view-container');
    container.innerHTML = banner + '<div class="tool-grid">' + toolGrid + '</div>';
  }

  function updateHarvest() {
    var items = Array.from(MG.state.ideas).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var projects = MG.state.projects;

    var listHTML = items.length > 0
      ? items.map(function(idea) {
          var proj = idea.projectId ? projects.find(function(p) { return p.id === idea.projectId; }) : null;
          var optionsHTML = projects.map(function(p) {
            return '<option value="' + MG.escapeHtml(p.id) + '" ' + (idea.projectId === p.id ? 'selected' : '') + '>' + MG.escapeHtml(p.name) + '</option>';
          }).join('');
          var eid = MG.escapeHtml(idea.id);
          return '<div class="idea-card ' + (idea.liked ? 'liked' : '') + '" data-id="' + eid + '">' +
            '<span class="idea-tool-label">🔬 ' + MG.escapeHtml(idea.tool) + '</span>' +
            (proj ? '<span style="font-size:0.75rem;color:var(--accent-terracotta);margin-left:6px;">💐 ' + MG.escapeHtml(proj.name) + '</span>' : '') +
            '<div class="idea-content">' + MG.escapeHtml(idea.content) + '</div>' +
            '<div class="idea-tags" style="margin-bottom:8px;">' + idea.tags.map(function(t) { return '<span class="inspiration-tag">#' + MG.escapeHtml(t) + '</span>'; }).join('') + '</div>' +
            '<div class="idea-actions">' +
              '<button class="btn btn-sm ' + (idea.liked ? 'btn-terracotta' : 'btn-ghost') + '" data-action="toggle-like" data-id="' + eid + '">' + (idea.liked ? '❤️' : '🤍') + ' 喜欢</button>' +
              '<button class="btn btn-sm btn-ghost" data-action="edit-idea" data-id="' + eid + '">✏️</button>' +
              '<select class="form-input" style="width:auto;padding:4px 8px;font-size:0.8rem;" data-action="idea-project" data-id="' + eid + '"><option value="">📁 归入花束</option>' + optionsHTML + '</select>' +
              '<button class="btn btn-sm btn-ghost" data-action="delete-idea" data-id="' + eid + '">🗑️</button>' +
              '<span class="idea-time">' + MG.formatDate(idea.createdAt) + '</span></div></div>';
        }).join('')
      : '<div class="empty-state"><div class="empty-icon">🧺</div><p>收获篮还空着，去温室培育一些点子吧</p></div>';

    replaceEl('harvestList', listHTML);
  }

  function updateBouquet() {
    document.getElementById('view-container').innerHTML = MG.state.bouquetDetail ? renderBouquetDetail() : renderBouquetList();
  }

  function updateGardenMap() {
    document.getElementById('view-container').innerHTML = renderGardenMap();
  }

  function updateCalendar() {
    document.getElementById('view-container').innerHTML = renderCalendar();
  }

  // ==================== 模态框渲染辅助函数 ====================

  MG.renderEditInspirationModal = function(insp) {
    var moodBtns = ['😌', '😆', '🤔', '😢', '🔥', '🌊'].map(function(m) {
      return '<button class="mood-btn ' + (insp.mood === m ? 'active' : '') + '" data-action="modal-mood" data-mood="' + m + '">' + m + '</button>';
    }).join('');
    return {
      title: '✏️ 编辑灵感',
      subtitle: '',
      body: '<textarea class="edit-textarea" id="editInspContent" rows="4">' + MG.escapeHtml(insp.content) + '</textarea>' +
        '<input class="form-input" id="editInspTags" value="' + MG.escapeHtml(insp.tags.map(function(t) { return '#' + t; }).join(' ')) + '" placeholder="#标签">' +
        '<div style="margin-top:8px;"><label style="font-size:0.9rem;color:var(--text-secondary);">心情：</label>' +
        '<div class="mood-selector" style="display:inline-flex;">' + moodBtns + '</div></div>',
      actions: '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
        '<button class="btn btn-primary" data-action="save-edit-inspiration" data-id="' + MG.escapeHtml(insp.id) + '">保存</button>'
    };
  };

  MG.renderEditIdeaModal = function(idea) {
    return {
      title: '✏️ 编辑点子',
      subtitle: '',
      body: '<textarea class="edit-textarea" id="editIdeaContent" rows="4">' + MG.escapeHtml(idea.content) + '</textarea>' +
        '<input class="form-input" id="editIdeaTags" value="' + MG.escapeHtml(idea.tags.map(function(t) { return '#' + t; }).join(' ')) + '" placeholder="#标签">',
      actions: '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
        '<button class="btn btn-primary" data-action="save-edit-idea" data-id="' + MG.escapeHtml(idea.id) + '">保存</button>'
    };
  };

  MG.renderCreateBouquetModal = function() {
    return {
      title: '💐 新花束',
      subtitle: '创建一个项目来收集你的点子和灵感',
      body: '<input class="form-input" id="newBouquetName" placeholder="花束名字" style="margin-bottom:12px;">' +
        '<textarea class="edit-textarea" id="newBouquetDesc" rows="3" placeholder="简单描述这个项目……"></textarea>',
      actions: '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
        '<button class="btn btn-primary" data-action="save-new-bouquet">创建</button>'
    };
  };

})(window.MindGarden);
