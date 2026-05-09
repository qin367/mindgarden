/* ================================================================
   MindGarden 创意花园 — 温室工具逻辑
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  // 工具临时状态
  MG.toolState = {
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
  MG.openToolModal = function(idx) {
    try {
      var tool = MG.TOOLS[idx];
      var activeInsp = MG.state.greenhouse.activeInspirationId
        ? MG.state.inspirations.find(function(i) { return i.id === MG.state.greenhouse.activeInspirationId; })
        : null;
      var inspText = activeInsp ? '\n\n当前灵感：' + activeInsp.content : '';

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
    } catch (err) {
      console.error('Tool modal error:', err);
      MG.openModal('⚠️ 工具加载失败', '', '<p>加载此工具时出错，请重试。</p>',
        '<button class="btn btn-ghost" data-action="close-modal">关闭</button>');
    }
  };

  /** 保存工具生成的点子 */
  MG.saveToolResult = function(toolIdx) {
    try {
      var tool = MG.TOOLS[toolIdx];
      var content = document.getElementById('toolResultContent');
      content = content ? content.value.trim() : '';
      if (!content) { MG.toast('请写下你的想法'); return; }
      var tagsEl = document.getElementById('toolResultTags');
      var tagsStr = tagsEl ? tagsEl.value.trim() : '';
      MG.state.ideas.unshift({
        id: MG.uid(),
        inspirationId: MG.state.greenhouse.activeInspirationId,
        content: content,
        tool: tool.name,
        liked: false,
        tags: MG.parseTags(tagsStr),
        projectId: null,
        createdAt: new Date().toISOString()
      });
      MG.save();
      MG.closeModal(true);
      if (MG.toolState.sandboxTimer) { clearInterval(MG.toolState.sandboxTimer); MG.toolState.sandboxTimer = null; }
      MG.render();
      MG.toast('🧺 点子已收入收获篮！');
    } catch (err) {
      console.error('Save tool result error:', err);
      MG.toast('保存失败，请重试');
    }
  };

  // ----- 工具1: 逆向花园 -----
  function openReverseModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    var cleanInsp = inspText.replace('当前灵感：', '');
    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      MG.html`<div class="tool-guide">💡 试着想想：如果要让这件事彻底失败，你会怎么做？然后我们一起来反转它。</div>
        <textarea id="reverseGoal" rows="2" placeholder="你的目标或灵感是什么？${inspText ? '（已自动带入当前灵感）' : ''}">${cleanInsp}</textarea>
        <textarea id="reverseFail" rows="3" placeholder="如何搞砸它？越具体越好：\n· 忽略什么？\n· 过度做什么？\n· 故意做错什么？"></textarea>
        <hr style="border-color:var(--border);margin:12px 0;">
        <div class="tool-guide" style="border-left-color:var(--accent-gold);">✨ 现在，把上面的"搞砸方案"反过来，就是一个好点子！</div>
        <textarea id="toolResultContent" rows="3" placeholder="把反转后的点子写下来……"></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`,
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );
  }

  // ----- 工具2: SCAMPER 嫁接实验室 -----
  function openScamperModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);

    function renderScamperBody() {
      var active = MG.SCAMPER_TAGS[MG.toolState.scamperActiveTag];
      return '<div class="tool-guide">当前灵感：' + MG.escapeHtml(inspText || '（自由模式，选一个方向开始思考）') + '</div>' +
        '<div class="scamper-tabs" id="scamperTabs">' +
          MG.SCAMPER_TAGS.map(function(t, i) {
            return '<button class="scamper-tab ' + (i === MG.toolState.scamperActiveTag ? 'active' : '') + '" data-action="scamper-tab" data-index="' + i + '">' + t.key + '. ' + t.label + '</button>';
          }).join('') +
        '</div>' +
        '<div class="tool-guide" style="border-left-color:var(--accent-gold);">' + active.question + '</div>' +
        '<textarea id="toolResultContent" rows="4" placeholder="从这个角度出发，你有什么新想法？"></textarea>' +
        '<input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">';
    }

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      renderScamperBody(),
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );

    setTimeout(function() {
      var body = document.getElementById('modalBody');
      if (!body) return;
      if (MG.toolState._scamperHandler) body.removeEventListener('click', MG.toolState._scamperHandler);
      MG.toolState._scamperHandler = function(e) {
        var tab = e.target.closest('[data-action="scamper-tab"]');
        if (!tab) return;
        MG.toolState.scamperActiveTag = parseInt(tab.dataset.index);
        var active = MG.SCAMPER_TAGS[MG.toolState.scamperActiveTag];
        var savedContent = document.getElementById('toolResultContent');
        savedContent = savedContent ? savedContent.value : '';
        var savedTags = document.getElementById('toolResultTags');
        savedTags = savedTags ? savedTags.value : '';
        body.innerHTML = '<div class="tool-guide">当前灵感：' + MG.escapeHtml(inspText || '（自由模式）') + '</div>' +
          '<div class="scamper-tabs" id="scamperTabs">' +
            MG.SCAMPER_TAGS.map(function(t, i) {
              return '<button class="scamper-tab ' + (i === MG.toolState.scamperActiveTag ? 'active' : '') + '" data-action="scamper-tab" data-index="' + i + '">' + t.key + '. ' + t.label + '</button>';
            }).join('') +
          '</div>' +
          '<div class="tool-guide" style="border-left-color:var(--accent-gold);">' + active.question + '</div>' +
          '<textarea id="toolResultContent" rows="4" placeholder="从这个角度出发，你有什么新想法？">' + MG.escapeHtml(savedContent) + '</textarea>' +
          '<input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割" value="' + MG.escapeHtml(savedTags) + '">';
      };
      body.addEventListener('click', MG.toolState._scamperHandler);
    }, 50);
  }

  // ----- 工具3: 极限温室 -----
  function openExtremeModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    var randomIdx = Math.floor(Math.random() * MG.EXTREME_CONDITIONS.length);
    MG.toolState.extremeCurrent = randomIdx;
    var condition = MG.EXTREME_CONDITIONS[randomIdx];

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      MG.html`<div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
        <div class="extreme-condition">${condition}</div>
        <div class="tool-guide" style="border-left-color:var(--accent-gold);">在这个极端条件下，你的灵感会变成什么？</div>
        <textarea id="toolResultContent" rows="4" placeholder="写下你的极限创意……"></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">
        <div style="margin-top:10px;"><button class="btn btn-sm btn-ghost" data-action="tool-extreme-reroll">🎲 换一个条件</button></div>`,
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );
  }

  // ----- 工具4: 自然类比 -----
  function openAnalogyModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    var randomIdx = Math.floor(Math.random() * MG.NATURE_PHENOMENA.length);
    MG.toolState.analogyCurrent = randomIdx;
    var phenom = MG.NATURE_PHENOMENA[randomIdx];

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      MG.html`<div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:16px;">
          <div style="font-size:1.1rem;font-weight:600;margin-bottom:8px;">${MG.raw(phenom.title)}</div>
          <div style="font-size:0.9rem;color:var(--text-secondary);">${phenom.desc}</div>
        </div>
        <div class="tool-guide" style="border-left-color:var(--accent-gold);">这个自然现象给你的灵感带来了什么启发？它们之间有什么相似之处？</div>
        <textarea id="toolResultContent" rows="4" placeholder="写下你的类比联想……"></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">
        <div style="margin-top:10px;"><button class="btn btn-sm btn-ghost" data-action="tool-analogy-reroll">🎲 换一个自然现象</button></div>`,
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );
  }

  // ----- 工具5: 本源之土（第一性原理）-----
  function openFirstPrinciplesModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    var layers = [
      { q: '这个想法/问题是什么？用一句话说清楚。', a: '' },
      { q: '拆开来看，它由哪些基本元素组成？', a: '' },
      { q: '这些元素中，哪些是"本质属性"，哪些是"人为附加"的？', a: '' },
      { q: '去掉人为附加的部分，剩下的核心是什么？', a: '' },
      { q: '基于这个核心，我们能重新构建什么？', a: '' }
    ];

    function renderOnion() {
      return layers.map(function(l, i) {
        return MG.html`<div class="onion-layer">
          <div class="onion-question">🧅 第 ${i+1} 层：${l.q}</div>
          <textarea class="onion-answer" data-layer="${i}" rows="2" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:var(--radius-sm);font-family:var(--font-body);font-size:0.9rem;background:var(--bg-input);color:var(--text-primary);">${l.a}</textarea>
        </div>`;
      }).join('');
    }

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      MG.html`<div class="tool-guide">${inspText || '想一个你想要深入探索的想法或问题。'}</div>
        <div id="onionLayers">${MG.raw(renderOnion())}</div>
        <hr style="border-color:var(--border);margin:12px 0;">
        <div class="tool-guide" style="border-left-color:var(--accent-gold);">经过层层剥开，你有什么新的认识？</div>
        <textarea id="toolResultContent" rows="3" placeholder="写下你的核心洞察……"></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`,
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );

    setTimeout(function() {
      var body = document.getElementById('modalBody');
      if (!body) return;
      if (MG.toolState._onionHandler) body.removeEventListener('input', MG.toolState._onionHandler);
      MG.toolState._onionHandler = function(e) {
        var textarea = e.target.closest('.onion-answer');
        if (!textarea) return;
        var idx = parseInt(textarea.dataset.layer);
        if (!isNaN(idx) && layers[idx]) layers[idx].a = textarea.value;
      };
      body.addEventListener('input', MG.toolState._onionHandler);
    }, 50);
  }

  // ----- 工具6: 随机花粉 -----
  function openPollenModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    var randomIdx = Math.floor(Math.random() * MG.POLLEN_WORDS.length);
    MG.toolState.pollenCurrent = randomIdx;
    var word = MG.POLLEN_WORDS[randomIdx];

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      MG.html`<div class="tool-guide">当前灵感：${inspText || '（自由模式）'}</div>
        <div class="pollen-word">🌸 ${word} 🌸</div>
        <div class="tool-guide" style="border-left-color:var(--accent-gold);">这个词汇和你的灵感之间有什么联系？强行建立一个关联！</div>
        <textarea id="toolResultContent" rows="4" placeholder=${'把"' + word + '"和你的想法连接起来……'}></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">
        <div style="margin-top:10px;"><button class="btn btn-sm btn-ghost" data-action="tool-pollen-reroll">🎲 换一个词</button></div>`,
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );
  }

  // ----- 工具7: 六顶思考帽 -----
  function openHatsModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    var currentHat = MG.HATS[MG.toolState.hatsCurrent];

    function renderHatBody() {
      return '<div class="tool-guide">当前灵感：' + MG.escapeHtml(inspText || '（自由模式，选一个角度开始思考）') + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">' +
          MG.HATS.map(function(hat, i) {
            return '<button class="btn btn-sm ' + (i === MG.toolState.hatsCurrent ? 'btn-terracotta' : 'btn-ghost') + '" data-action="hat-switch" data-index="' + i + '" style="border-left:3px solid ' + hat.color + ';">' + hat.label.split('·')[0].trim() + '</button>';
          }).join('') +
        '</div>' +
        '<div class="tool-guide hat-' + currentHat.key + '" style="border-left:3px solid ' + currentHat.color + ';">' +
          '<span class="hat-label hat-' + currentHat.key + '-bg">' + currentHat.label + '</span>' +
          '<div>' + currentHat.question + '</div>' +
        '</div>' +
        '<textarea id="toolResultContent" rows="4" placeholder="戴上这顶帽子，你看到了什么？"></textarea>' +
        '<input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">';
    }

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      renderHatBody(),
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );

    setTimeout(function() {
      var body = document.getElementById('modalBody');
      if (!body) return;
      if (MG.toolState._hatsHandler) body.removeEventListener('click', MG.toolState._hatsHandler);
      MG.toolState._hatsHandler = function(e) {
        var btn = e.target.closest('[data-action="hat-switch"]');
        if (!btn) return;
        MG.toolState.hatsCurrent = parseInt(btn.dataset.index);
        var hat = MG.HATS[MG.toolState.hatsCurrent];
        var savedContent = document.getElementById('toolResultContent');
        savedContent = savedContent ? savedContent.value : '';
        var savedTags = document.getElementById('toolResultTags');
        savedTags = savedTags ? savedTags.value : '';
        body.innerHTML = '<div class="tool-guide">当前灵感：' + MG.escapeHtml(inspText || '（自由模式）') + '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;">' +
            MG.HATS.map(function(h, i) {
              return '<button class="btn btn-sm ' + (i === MG.toolState.hatsCurrent ? 'btn-terracotta' : 'btn-ghost') + '" data-action="hat-switch" data-index="' + i + '" style="border-left:3px solid ' + h.color + ';">' + h.label.split('·')[0].trim() + '</button>';
            }).join('') +
          '</div>' +
          '<div class="tool-guide hat-' + hat.key + '" style="border-left:3px solid ' + hat.color + ';">' +
            '<span class="hat-label hat-' + hat.key + '-bg">' + hat.label + '</span>' +
            '<div>' + hat.question + '</div>' +
          '</div>' +
          '<textarea id="toolResultContent" rows="4" placeholder="戴上这顶帽子，你看到了什么？">' + MG.escapeHtml(savedContent) + '</textarea>' +
          '<input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割" value="' + MG.escapeHtml(savedTags) + '">';
      };
      body.addEventListener('click', MG.toolState._hatsHandler);
    }, 50);
  }

  // ----- 工具8: 空想沙盘 -----
  function openSandboxModal(tool, inspText) {
    var toolIdx = MG.TOOLS.indexOf(tool);
    MG.toolState.sandboxWords = [];

    MG.openModal(
      tool.icon + ' ' + tool.name,
      tool.guide,
      MG.html`<div class="tool-guide">${inspText || '让思绪自由流淌，什么都不用想，只管写。'}</div>
        <div class="sandbox-words" id="sandboxWords"></div>
        <textarea id="toolResultContent" rows="6" placeholder="写下任何出现在脑海里的东西……\n不用组织语言，不用判断好坏，只是写。"></textarea>
        <input class="form-input" id="toolResultTags" placeholder="#标签 用 # 分割">`,
      '<button class="btn btn-ghost" data-action="close-modal">取消</button>' +
      '<button class="btn btn-primary" data-action="save-tool-result" data-tool-idx="' + toolIdx + '">🌾 收获</button>'
    );

    if (MG.toolState.sandboxTimer) clearInterval(MG.toolState.sandboxTimer);
    MG.toolState.sandboxTimer = setInterval(function() {
      var container = document.getElementById('sandboxWords');
      if (!container) { clearInterval(MG.toolState.sandboxTimer); MG.toolState.sandboxTimer = null; return; }
      var word = MG.SANDBOX_WORDS[Math.floor(Math.random() * MG.SANDBOX_WORDS.length)];
      var el = document.createElement('span');
      el.className = 'sandbox-word';
      el.textContent = word;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
      while (container.children.length > 8) container.removeChild(container.firstChild);
    }, 10000);
  }

})(window.MindGarden);
