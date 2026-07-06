/* ================================================================
   MindGarden 创意花园 — 文件导出与 API
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  /** 文件下载 */
  MG.downloadFile = function(filename, content, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /** 导出纪念册 HTML */
  MG.exportAlbumHTML = function() {
    try {
    var sortedInps = Array.from(MG.state.inspirations).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    var sortedIdeas = Array.from(MG.state.ideas).sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    var html = '<!DOCTYPE html>\n' +
      '<html lang="zh-CN">\n' +
      '<head><meta charset="UTF-8"><title>🌱 MindGarden 纪念册</title>\n' +
      '<style>\n' +
      'body { font-family: "Noto Serif SC", "Songti SC", serif; background: #fdf8f0; color: #3b2b1f; max-width: 720px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; }\n' +
      'h1 { text-align: center; color: #c17f59; font-size: 1.8rem; }\n' +
      '.subtitle { text-align: center; color: #7a6a5a; margin-bottom: 40px; }\n' +
      'h2 { color: #8fa88a; border-bottom: 1px solid #e8ddd0; padding-bottom: 8px; margin-top: 40px; }\n' +
      '.card { background: #fffcf5; border: 1px solid #e8ddd0; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; box-shadow: 0 1px 4px rgba(59,43,31,0.06); }\n' +
      '.mood { font-size: 1.3rem; }\n' +
      '.time { font-size: 0.8rem; color: #a89888; }\n' +
      '.tag { display:inline-block; font-size:0.8rem; color:#c17f59; background:#f0d5c4; padding:2px 10px; border-radius:12px; margin:2px; }\n' +
      '.idea-tool { font-size:0.8rem; color:#fff; background:#8fa88a; padding:2px 10px; border-radius:12px; display:inline-block; }\n' +
      '.liked { color: #e74c3c; }\n' +
      '.footer { text-align: center; color: #a89888; font-size: 0.85rem; margin-top: 60px; border-top: 1px solid #e8ddd0; padding-top: 20px; }\n' +
      '</style></head>\n' +
      '<body>\n' +
      '<h1>🌱 MindGarden 纪念册</h1>\n' +
      '<p class="subtitle">我的创意花园 · 点滴记录</p>\n' +
      '<p style="text-align:center;color:#7a6a5a;">共 ' + sortedInps.length + ' 条灵感 · ' + sortedIdeas.length + ' 个点子 · ' + MG.state.projects.length + ' 个项目</p>\n';

    if (sortedInps.length > 0) {
      html += '<h2>🌰 灵感集</h2>';
      sortedInps.forEach(function(insp) {
        html += '<div class="card">\n' +
          '  <div style="display:flex;justify-content:space-between;align-items:center;">\n' +
          '    <span class="mood">' + (insp.mood || '🌱') + '</span>\n' +
          '    <span class="time">' + new Date(insp.createdAt).toLocaleDateString('zh-CN') + '</span>\n' +
          '  </div>\n' +
          '  <div style="margin:8px 0;">' + MG.escapeHtml(insp.content) + '</div>\n' +
          '  <div>' + insp.tags.map(function(t) { return '<span class="tag">#' + MG.escapeHtml(t) + '</span>'; }).join(' ') + '</div>\n' +
          '</div>\n';
      });
    }

    if (sortedIdeas.length > 0) {
      html += '<h2>🧺 点子集</h2>';
      sortedIdeas.forEach(function(idea) {
        html += '<div class="card">\n' +
          '  <div><span class="idea-tool">🔬 ' + MG.escapeHtml(idea.tool) + '</span> ' + (idea.liked ? '<span class="liked">❤️</span>' : '') + '</div>\n' +
          '  <div style="margin:8px 0;">' + MG.escapeHtml(idea.content) + '</div>\n' +
          '  <div>' + idea.tags.map(function(t) { return '<span class="tag">#' + MG.escapeHtml(t) + '</span>'; }).join(' ') + '</div>\n' +
          '</div>\n';
      });
    }

    if (MG.state.projects.length > 0) {
      html += '<h2>💐 项目</h2>';
      MG.state.projects.forEach(function(p) {
        html += '<div class="card">\n' +
          '  <h3 style="margin:0 0 4px;">💐 ' + MG.escapeHtml(p.name) + '</h3>\n' +
          '  <p style="color:#7a6a5a;margin:0 0 8px;">' + MG.escapeHtml(p.description) + '</p>\n' +
          '  <p style="color:#a89888;font-size:0.85rem;">' + p.ideaIds.length + ' 个点子 · ' + p.inspirationIds.length + ' 个灵感</p>\n' +
          '</div>\n';
      });
    }

    html += '<div class="footer">由 MindGarden 创意花园生成 · ' + new Date().toLocaleDateString('zh-CN') + '</div></body></html>';

    MG.downloadFile('mindgarden-纪念册.html', html, 'text/html;charset=utf-8');
    MG.toast('📄 纪念册已导出');
    } catch (err) {
      console.error('Export album error:', err);
      MG.toast('导出失败，请重试');
    }
  };

  /** API 连接测试 */
  MG.testApiConnection = function() {
    try {
    var endpoint = document.getElementById('setApiEndpoint');
    endpoint = endpoint ? endpoint.value.trim() : MG.state.settings.apiEndpoint;
    var key = document.getElementById('setApiKey');
    key = key ? key.value.trim() : MG.state.settings.apiKey;
    var model = document.getElementById('setApiModel');
    model = model ? model.value.trim() : MG.state.settings.apiModel;

    if (!endpoint) { MG.toast('请先输入 API 端点'); return; }

    var headers = { 'Content-Type': 'application/json' };
    if (key) headers['Authorization'] = 'Bearer ' + key;

    fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Hello! 请用一句话回应。' }],
        max_tokens: 50
      })
    }).then(function(response) {
      if (response.ok) {
        MG.toast('🔌 连接成功！API 工作正常');
      } else {
        return response.text().then(function(errText) {
          MG.toast('❌ 连接失败 (' + response.status + '): ' + (errText || '未知错误').slice(0, 60));
        }).catch(function() {
          MG.toast('❌ 连接失败 (' + response.status + ')');
        });
      }
    }).catch(function(err) {
      MG.toast('❌ 连接失败: ' + err.message);
    });
    } catch (err) {
      console.error('API test error:', err);
      MG.toast('测试失败，请检查设置');
    }
  };

})(window.MindGarden);
