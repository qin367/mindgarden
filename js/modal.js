/* ================================================================
   MindGarden 创意花园 — 模态框系统（含焦点陷阱）
   ================================================================ */
window.MindGarden = window.MindGarden || {};

(function(MG) {
  'use strict';

  var modalResolve = null;
  var _previousFocus = null;
  var _keydownHandler = null;

  function getFocusableElements() {
    var modal = document.getElementById('modalCard');
    if (!modal) return [];
    return Array.from(modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    ));
  }

  function trapKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      MG.closeModal(null);
      return;
    }
    if (e.key !== 'Tab') return;

    var focusables = getFocusableElements();
    if (focusables.length === 0) return;

    var first = focusables[0];
    var last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /** 打开模态框 */
  MG.openModal = function(title, subtitle, bodyHTML, actionsHTML) {
    return new Promise(function(resolve) {
      _previousFocus = document.activeElement;
      modalResolve = resolve;
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalSubtitle').textContent = subtitle || '';
      document.getElementById('modalBody').innerHTML = bodyHTML || '';
      document.getElementById('modalActions').innerHTML = actionsHTML || '';
      var overlay = document.getElementById('modalOverlay');
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');

      // 焦点陷阱
      _keydownHandler = function(e) { trapKeydown(e); };
      document.getElementById('modalCard').addEventListener('keydown', _keydownHandler);

      // 聚焦第一个可聚焦元素
      setTimeout(function() {
        var focusables = getFocusableElements();
        if (focusables.length > 0) focusables[0].focus();
      }, 50);
    });
  };

  /** 关闭模态框 */
  MG.closeModal = function(result) {
    // 清除沙盘定时器
    if (MG.toolState && MG.toolState.sandboxTimer) {
      clearInterval(MG.toolState.sandboxTimer);
      MG.toolState.sandboxTimer = null;
    }

    var overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');

    // 移除焦点陷阱
    if (_keydownHandler) {
      document.getElementById('modalCard').removeEventListener('keydown', _keydownHandler);
      _keydownHandler = null;
    }

    // 恢复焦点
    if (_previousFocus && _previousFocus.focus) {
      try { _previousFocus.focus(); } catch (e) { /* ignore */ }
    }
    _previousFocus = null;

    if (modalResolve) { modalResolve(result); modalResolve = null; }
  };

})(window.MindGarden);
