/* ================================================================
   MindGarden 创意花园 — 工具函数
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  /** 生成短 UID */
  MG.uid = function() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  /** 格式化日期为友好字符串 */
  MG.formatDate = function(iso) {
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
  MG.toDateStr = function(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  /** 解析 #标签 */
  MG.parseTags = function(str) {
    if (!str || !str.trim()) return [];
    return str.split('#').map(t => t.trim()).filter(t => t.length > 0);
  };

  /** Toast 通知 */
  MG.toast = function(msg) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(function() { el.remove(); }, 300);
    }, 2500);
  };

  /** 更新问候语和主题按钮 */
  MG.updateTopBar = function() {
    var greetingEl = document.getElementById('greeting');
    greetingEl.textContent = '';
    var strong = document.createElement('strong');
    strong.textContent = MG.getGreeting();
    greetingEl.appendChild(strong);
    greetingEl.appendChild(document.createTextNode(' 🌱'));
    var themeBtn = document.getElementById('themeToggle');
    themeBtn.textContent = MG.state.settings.theme === 'dark' ? '☀️' : '🌙';
  };

  /** 屏幕阅读器通知 */
  MG.announce = function(msg) {
    var el = document.getElementById('srAnnounce');
    if (!el) {
      el = document.createElement('div');
      el.id = 'srAnnounce';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.className = 'sr-only';
      document.body.appendChild(el);
    }
    el.textContent = '';
    setTimeout(function() { el.textContent = msg; }, 50);
  };

  /** HTML 转义 */
  MG.escapeHtml = function(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /** 属性值转义（额外转义单引号） */
  MG.safeAttr = function(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /** 标记为安全原始 HTML（跳过转义） */
  MG.raw = function(str) {
    return { __raw: true, value: String(str == null ? '' : str) };
  };

  /** 安全模板标签函数：自动转义插值 */
  MG.html = function(strings) {
    var result = '';
    for (var i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < arguments.length - 1) {
        var val = arguments[i + 1];
        if (val == null) {
          result += '';
        } else if (val && val.__raw) {
          result += val.value;
        } else if (Array.isArray(val)) {
          result += val.map(function(item) {
            return item && item.__raw ? item.value : MG.escapeHtml(item);
          }).join('');
        } else {
          result += MG.escapeHtml(val);
        }
      }
    }
    return result;
  };

})(window.MindGarden);
