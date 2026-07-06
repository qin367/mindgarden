/* ================================================================
   MindGarden 创意花园 — 事件处理（注册表模式）
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  // ==================== 事件注册表 ====================

  MG._actionHandlers = {};
  MG._inputHandlers = {};

  MG.registerHandler = function(action, fn) {
    MG._actionHandlers[action] = fn;
  };

  MG.registerInputHandler = function(id, fn) {
    MG._inputHandlers[id] = fn;
  };

  MG.handleClick = function(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.dataset.action;
    var handler = MG._actionHandlers[action];
    if (handler) {
      try {
        handler(target, e);
      } catch (err) {
        console.error('Action handler error:', action, err);
        MG.toast('操作失败，请重试');
      }
    } else if (action) {
      console.warn('未注册的 action:', action);
    }
  };

  MG.handleInput = function(e) {
    var target = e.target;
    var handler = MG._inputHandlers[target.id] || MG._inputHandlers[target.dataset.action];
    if (handler) {
      try {
        handler(target);
      } catch (err) {
        console.error('Input handler error:', err);
      }
    }
  };

  // ==================== 苗圃 ====================

  MG.registerHandler('select-mood', function(target) {
    MG.state.nursery.mood = target.dataset.mood;
    document.querySelectorAll('.mood-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.mood === MG.state.nursery.mood);
    });
  });

  MG.registerHandler('save-inspiration', function(target) {
    var contentEl = document.getElementById('nurseryContent');
    var content = contentEl ? contentEl.value.trim() : '';
    var tagsEl = document.getElementById('nurseryTags');
    var tagsStr = tagsEl ? tagsEl.value.trim() : '';
    if (!content) { MG.toast('请写下你的灵感'); return; }
    MG.state.inspirations.unshift({
      id: MG.uid(),
      content: content,
      mood: MG.state.nursery.mood || '🌱',
      tags: MG.parseTags(tagsStr),
      createdAt: new Date().toISOString(),
      archived: false
    });
    MG.state.nursery.content = '';
    MG.state.nursery.tags = '';
    MG.state.nursery.mood = null;
    MG.save();
    MG.render();
    MG.toast('🌱 灵感已种下！');
  });

  MG.registerHandler('filter-tag', function(target) {
    MG.state.nursery.filterTag = target.dataset.tag || null;
    MG.render();
  });

  // ==================== 种子箱 ====================

  MG.registerHandler('sfilter-tag', function(target) {
    MG.state.seedbox.filterTag = target.dataset.tag || null;
    MG.render();
  });

  MG.registerHandler('toggle-archived', function(target) {
    var cb = target.querySelector ? target.querySelector('input[type="checkbox"]') : null;
    if (cb) { cb.checked = !cb.checked; MG.state.seedbox.showArchived = cb.checked; }
    else { MG.state.seedbox.showArchived = !MG.state.seedbox.showArchived; }
    MG.render();
  });

  // ==================== 灵感操作 ====================

  MG.registerHandler('cultivate', function(target) {
    MG.state.greenhouse.activeInspirationId = target.dataset.id;
    MG.state.currentView = 'greenhouse';
    MG._lastRenderedView = null; // force full render
    MG.render();
  });

  MG.registerHandler('edit-inspiration', function(target) {
    var insp = MG.state.inspirations.find(function(i) { return i.id === target.dataset.id; });
    if (!insp) return;
    var tpl = MG.renderEditInspirationModal(insp);
    MG.openModal(tpl.title, tpl.subtitle, tpl.body, tpl.actions);
  });

  MG.registerHandler('save-edit-inspiration', function(target) {
    var inspId = target.dataset.id;
    var insp = MG.state.inspirations.find(function(i) { return i.id === inspId; });
    if (!insp) return;
    var newContentEl = document.getElementById('editInspContent');
    var newContent = newContentEl ? newContentEl.value.trim() : '';
    var newTagsEl = document.getElementById('editInspTags');
    var newTags = newTagsEl ? newTagsEl.value.trim() : '';
    var activeMood = document.querySelector('#modalBody .mood-btn.active');
    if (newContent) {
      insp.content = newContent;
      insp.tags = MG.parseTags(newTags);
      if (activeMood) insp.mood = activeMood.dataset.mood;
      MG.save();
      MG.closeModal(true);
      MG.render();
      MG.toast('✅ 已更新');
    }
  });

  MG.registerHandler('archive-inspiration', function(target) {
    var insp = MG.state.inspirations.find(function(i) { return i.id === target.dataset.id; });
    if (insp) { insp.archived = true; MG.markDirty(); MG.render(); MG.toast('📦 已归档'); }
  });

  MG.registerHandler('unarchive-inspiration', function(target) {
    var insp = MG.state.inspirations.find(function(i) { return i.id === target.dataset.id; });
    if (insp) { insp.archived = false; MG.markDirty(); MG.render(); MG.toast('📂 已恢复'); }
  });

  MG.registerHandler('delete-inspiration', function(target) {
    if (!confirm('确定要删除这条灵感吗？')) return;
    var deletedId = target.dataset.id;
    MG.state.inspirations = MG.state.inspirations.filter(function(i) { return i.id !== deletedId; });
    MG.state.ideas.forEach(function(idea) { if (idea.inspirationId === deletedId) idea.inspirationId = null; });
    MG.state.projects.forEach(function(p) { p.inspirationIds = p.inspirationIds.filter(function(id) { return id !== deletedId; }); });
    if (MG.state.greenhouse.activeInspirationId === deletedId) MG.state.greenhouse.activeInspirationId = null;
    MG.save();
    MG.render();
    MG.toast('🗑️ 已删除');
  });

  // ==================== 温室工具 ====================

  MG.registerHandler('open-tool', function(target) {
    var idx = parseInt(target.dataset.toolIndex);
    var tool = MG.TOOLS[idx];
    if (!tool) return;
    MG.openToolModal(idx);
  });

  MG.registerHandler('clear-active-inspiration', function() {
    MG.state.greenhouse.activeInspirationId = null;
    MG.render();
  });

  // ==================== 收获篮 ====================

  MG.registerHandler('toggle-like', function(target) {
    var idea = MG.state.ideas.find(function(i) { return i.id === target.dataset.id; });
    if (idea) { idea.liked = !idea.liked; MG.markDirty(); MG.render(); }
  });

  MG.registerHandler('edit-idea', function(target) {
    var idea = MG.state.ideas.find(function(i) { return i.id === target.dataset.id; });
    if (!idea) return;
    var tpl = MG.renderEditIdeaModal(idea);
    MG.openModal(tpl.title, tpl.subtitle, tpl.body, tpl.actions);
  });

  MG.registerHandler('save-edit-idea', function(target) {
    var ideaId = target.dataset.id;
    var idea = MG.state.ideas.find(function(i) { return i.id === ideaId; });
    if (!idea) return;
    var ncEl = document.getElementById('editIdeaContent');
    var newContent = ncEl ? ncEl.value.trim() : '';
    var ntEl = document.getElementById('editIdeaTags');
    var newTags = ntEl ? ntEl.value.trim() : '';
    if (newContent) {
      idea.content = newContent;
      idea.tags = MG.parseTags(newTags);
      MG.save();
      MG.closeModal(true);
      MG.render();
      MG.toast('✅ 已更新');
    }
  });

  MG.registerHandler('delete-idea', function(target) {
    if (!confirm('确定要删除这个点子吗？')) return;
    var deletedId = target.dataset.id;
    MG.state.ideas = MG.state.ideas.filter(function(i) { return i.id !== deletedId; });
    MG.state.projects.forEach(function(p) { p.ideaIds = p.ideaIds.filter(function(id) { return id !== deletedId; }); });
    MG.save();
    MG.render();
    MG.toast('🗑️ 已删除');
  });

  // ==================== 花束 ====================

  MG.registerHandler('create-bouquet', function() {
    var btpl = MG.renderCreateBouquetModal();
    MG.openModal(btpl.title, btpl.subtitle, btpl.body, btpl.actions);
  });

  MG.registerHandler('save-new-bouquet', function() {
    var nameEl = document.getElementById('newBouquetName');
    var name = nameEl ? nameEl.value.trim() : '';
    var descEl = document.getElementById('newBouquetDesc');
    var desc = descEl ? descEl.value.trim() : '';
    if (!name) { MG.toast('请输入花束名字'); return; }
    MG.state.projects.push({
      id: MG.uid(),
      name: name,
      description: desc || '',
      ideaIds: [],
      inspirationIds: [],
      notes: '',
      createdAt: new Date().toISOString()
    });
    MG.save();
    MG.closeModal(true);
    MG.render();
    MG.toast('💐 新花束已创建！');
  });

  MG.registerHandler('view-bouquet', function(target) {
    MG.state.bouquetDetail = target.dataset.id;
    MG.render();
  });

  MG.registerHandler('back-bouquet-list', function() {
    MG.state.bouquetDetail = null;
    MG.render();
  });

  MG.registerHandler('delete-bouquet', function(target) {
    if (!confirm('确定要删除这个花束吗？')) return;
    var deletedId = target.dataset.id;
    MG.state.projects = MG.state.projects.filter(function(p) { return p.id !== deletedId; });
    MG.state.ideas.forEach(function(idea) { if (idea.projectId === deletedId) idea.projectId = null; });
    if (MG.state.bouquetDetail === deletedId) MG.state.bouquetDetail = null;
    MG.save();
    MG.render();
    MG.toast('🗑️ 已删除');
  });

  MG.registerHandler('export-bouquet', function(target) {
    var p = MG.state.projects.find(function(pr) { return pr.id === target.dataset.id; });
    if (!p) return;
    var relatedIdeas = MG.state.ideas.filter(function(i) { return p.ideaIds.includes(i.id); });
    var relatedInsp = MG.state.inspirations.filter(function(i) { return p.inspirationIds.includes(i.id); });
    var md = '# 💐 ' + p.name + '\n\n';
    md += '> ' + (p.description || '无描述') + '\n\n';
    md += '---\n\n';
    if (p.notes) md += '## 备注\n\n' + p.notes + '\n\n---\n\n';
    if (relatedInsp.length > 0) {
      md += '## 🌰 灵感来源\n\n';
      relatedInsp.forEach(function(insp, i) {
        md += (i+1) + '. ' + (insp.mood || '') + ' ' + insp.content + '\n';
      });
      md += '\n';
    }
    if (relatedIdeas.length > 0) {
      md += '## 🧺 点子\n\n';
      relatedIdeas.forEach(function(idea, i) {
        md += (i+1) + '. **' + idea.tool + '** ' + (idea.liked ? '❤️ ' : '') + idea.content + '\n';
      });
      md += '\n';
    }
    md += '---\n*由 MindGarden 创意花园生成于 ' + new Date().toLocaleDateString('zh-CN') + '*\n';
    MG.downloadFile(p.name + '.md', md, 'text/markdown');
    MG.toast('📥 已导出 Markdown');
  });

  MG.registerHandler('remove-idea-from-bouquet', function(target) {
    var p = MG.state.projects.find(function(pr) { return pr.id === target.dataset.bid; });
    if (p) { p.ideaIds = p.ideaIds.filter(function(id) { return id !== target.dataset.iid; }); MG.markDirty(); MG.render(); }
  });

  MG.registerHandler('remove-insp-from-bouquet', function(target) {
    var p = MG.state.projects.find(function(pr) { return pr.id === target.dataset.bid; });
    if (p) { p.inspirationIds = p.inspirationIds.filter(function(id) { return id !== target.dataset.iid; }); MG.markDirty(); MG.render(); }
  });

  MG.registerHandler('add-idea-to-bouquet', function(target) {
    var p = MG.state.projects.find(function(pr) { return pr.id === target.dataset.bid; });
    var select = document.getElementById('addIdeaSelect');
    if (p && select && select.value) {
      if (!p.ideaIds.includes(select.value)) { p.ideaIds.push(select.value); MG.markDirty(); MG.render(); MG.toast('✅ 已加入'); }
    }
  });

  MG.registerHandler('add-insp-to-bouquet', function(target) {
    var p = MG.state.projects.find(function(pr) { return pr.id === target.dataset.bid; });
    var select = document.getElementById('addInspSelect');
    if (p && select && select.value) {
      if (!p.inspirationIds.includes(select.value)) { p.inspirationIds.push(select.value); MG.markDirty(); MG.render(); MG.toast('✅ 已加入'); }
    }
  });

  MG.registerHandler('save-bouquet-notes', function(target) {
    var p = MG.state.projects.find(function(pr) { return pr.id === target.dataset.bid; });
    var notesEl = document.getElementById('bouquetNotes');
    if (p) { p.notes = notesEl ? notesEl.value || '' : ''; MG.save(); MG.render(); MG.toast('✅ 备注已保存'); }
  });

  // ==================== 日历 ====================

  MG.registerHandler('prev-month', function() {
    MG.state.calendar.month--;
    if (MG.state.calendar.month < 0) { MG.state.calendar.month = 11; MG.state.calendar.year--; }
    MG.state.calendar.selectedDate = null;
    MG.render();
  });

  MG.registerHandler('next-month', function() {
    MG.state.calendar.month++;
    if (MG.state.calendar.month > 11) { MG.state.calendar.month = 0; MG.state.calendar.year++; }
    MG.state.calendar.selectedDate = null;
    MG.render();
  });

  MG.registerHandler('select-date', function(target) {
    MG.state.calendar.selectedDate = target.dataset.date;
    MG.render();
  });

  // ==================== 设置 ====================

  MG.registerHandler('set-theme', function(target) {
    MG.state.settings.theme = target.dataset.theme;
    document.documentElement.setAttribute('data-theme', MG.state.settings.theme);
    MG.save();
    MG.render();
  });

  MG.registerHandler('save-api-settings', function() {
    var epEl = document.getElementById('setApiEndpoint');
    var keyEl = document.getElementById('setApiKey');
    var modelEl = document.getElementById('setApiModel');
    MG.state.settings.apiEndpoint = epEl ? epEl.value.trim() || '' : '';
    MG.state.settings.apiKey = keyEl ? keyEl.value.trim() || '' : '';
    MG.state.settings.apiModel = modelEl ? modelEl.value.trim() || '' : '';
    MG.save();
    MG.toast('✅ 设置已保存');
  });

  MG.registerHandler('test-api-connection', function() {
    MG.testApiConnection();
  });

  MG.registerHandler('export-json', function() {
    var safeSettings = Object.assign({}, MG.state.settings, { apiKey: '' });
    var data = {
      inspirations: MG.state.inspirations,
      ideas: MG.state.ideas,
      projects: MG.state.projects,
      settings: safeSettings,
      exportedAt: new Date().toISOString()
    };
    MG.downloadFile('mindgarden-backup.json', JSON.stringify(data, null, 2), 'application/json');
    MG.toast('📤 已导出');
  });

  MG.registerHandler('import-json', function() {
    document.getElementById('importFileInput').click();
  });

  MG.registerHandler('export-html', function() {
    MG.exportAlbumHTML();
  });

  MG.registerHandler('reset-data', function() {
    if (!confirm('⚠️ 确定要重置所有数据吗？此操作不可恢复！')) return;
    if (!confirm('再次确认：所有灵感和点子将被清空。')) return;
    var sample = MG.createSampleData();
    MG.state.inspirations = sample.inspirations;
    MG.state.ideas = sample.ideas;
    MG.state.projects = sample.projects;
    MG.state.settings = { theme: 'light', apiEndpoint: 'http://localhost:11434/v1/chat/completions', apiKey: '', apiModel: 'gpt-3.5-turbo' };
    document.documentElement.setAttribute('data-theme', 'light');
    MG.save();
    MG.render();
    MG.toast('🔄 已重置为示例数据');
  });

  // ==================== 模态框 ====================

  MG.registerHandler('close-modal', function() {
    MG.closeModal(null);
  });

  MG.registerHandler('modal-mood', function(target) {
    document.querySelectorAll('#modalBody .mood-btn').forEach(function(b) { b.classList.remove('active'); });
    target.classList.add('active');
  });

  // ==================== 工具结果 ====================

  MG.registerHandler('save-tool-result', function(target) {
    var toolIdx = parseInt(target.dataset.toolIdx);
    var tool = MG.TOOLS[toolIdx];
    if (!tool) return;
    MG.saveToolResult(toolIdx);
  });

  // ==================== 工具 reroll ====================

  MG.registerHandler('tool-extreme-reroll', function() {
    var randomIdx = Math.floor(Math.random() * MG.EXTREME_CONDITIONS.length);
    MG.toolState.extremeCurrent = randomIdx;
    var condition = MG.EXTREME_CONDITIONS[randomIdx];
    var condEl = document.querySelector('.extreme-condition');
    if (condEl) condEl.textContent = condition;
  });

  MG.registerHandler('tool-analogy-reroll', function() {
    var ri = Math.floor(Math.random() * MG.NATURE_PHENOMENA.length);
    MG.toolState.analogyCurrent = ri;
    var phenom = MG.NATURE_PHENOMENA[ri];
    var body = document.getElementById('modalBody');
    if (body) {
      var card = body.querySelector('div[style*="background:var(--bg-card)"]');
      if (card) {
        card.innerHTML = '<div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">' + phenom.title + '</div>' +
          '<div style="font-size:0.9rem;color:var(--text-secondary);">' + phenom.desc + '</div>';
      }
    }
  });

  MG.registerHandler('tool-pollen-reroll', function() {
    var ri = Math.floor(Math.random() * MG.POLLEN_WORDS.length);
    MG.toolState.pollenCurrent = ri;
    var word = MG.POLLEN_WORDS[ri];
    var pwEl = document.querySelector('.pollen-word');
    if (pwEl) pwEl.textContent = '🌸 ' + word + ' 🌸';
    var guide = document.querySelector('.tool-guide[style*="border-left-color:var(--accent-gold)"]');
    if (guide) guide.textContent = '这个词汇和你的灵感之间有什么联系？强行建立一个关联！';
    var ta = document.getElementById('toolResultContent');
    if (ta) ta.placeholder = '把"' + word + '"和你的想法连接起来……';
  });

  // ==================== 输入处理器 ====================

  MG.registerInputHandler('nurseryContent', function(target) {
    MG.state.nursery.content = target.value;
  });

  MG.registerInputHandler('nurseryTags', function(target) {
    MG.state.nursery.tags = target.value;
  });

  MG.registerInputHandler('idea-project', function(target) {
    var idea = MG.state.ideas.find(function(i) { return i.id === target.dataset.id; });
    if (idea) {
      idea.projectId = target.value || null;
      MG.markDirty();
      MG.render();
      MG.toast(idea.projectId ? '📁 已归入花束' : '📁 已移出花束');
    }
  });

})(window.MindGarden);
