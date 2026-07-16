// ============================================
// 左下角悬浮帮助按钮 + 使用指南弹框
// 不影响任何现有页面布局、动效、CSS
// ============================================
(function () {
  'use strict';

  // --- 创建帮助按钮 ---
  function createHelpButton() {
    var btn = document.createElement('button');
    btn.id = 'helpBtn';
    btn.className = 'help-btn';
    btn.setAttribute('aria-label', '使用指南');
    btn.innerHTML = '<span class="help-btn-heart">&#9829;</span>';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      openHelpModal();
    });
  }

  // --- 创建弹框 ---
  function createHelpModal() {
    var overlay = document.createElement('div');
    overlay.id = 'helpModal';
    overlay.className = 'help-modal-overlay';
    overlay.innerHTML =
      '<div class="help-modal-inner">' +
      '<button class="help-modal-close" aria-label="关闭">&times;</button>' +
      '<div class="help-modal-body">' +
      '<h2 class="help-modal-title">yulinzzy小站使用指南 <span class="help-title-icon">&#9829;</span></h2>' +
      '<div class="help-modal-content">' +
      '<p class="help-intro">整体色调采用真源应援色<strong>水玉暖炽</strong>，清新绿氛围感拉满～</p>' +
      '<ul class="help-list">' +
      '<li><span class="help-tag">开屏页</span>等待4秒自动跳转主页，点击屏幕可直接跳过</li>' +
      '<li><span class="help-tag">BGM《相思锁》</span>首次点击页面才会开启；默认媒体播放结束后自动恢复背景音乐，右下角悬浮按钮可一键关闭音源</li>' +
      '<li><span class="help-tag">悬浮特效</span>全页超多应援色专属悬浮特效，鼠标划过就能看见</li>' +
      '<li><span class="help-tag">卡片内容</span>卡片文案分两类：张真源语录 / 短片简介；单条视频弹窗在线播放，合集卡片点击直达B站</li>' +
      '<li><span class="help-tag">留言墙</span>仅留存最新50条留言，更早内容自动清除</li>' +
      '</ul>' +
      '<div class="help-easter-egg">' +
      '<p class="help-egg-title">隐藏小彩蛋 <span class="sparkle">&#10023;</span></p>' +
      '<ul class="help-list help-list--egg">' +
      '<li><span class="help-tag">&#9829;</span>和空中飘落的花瓣互动看看</li>' +
      '<li><span class="help-tag">&#9829;</span>随意选中页面文字发掘小细节</li>' +
      '</ul>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('.help-modal-close');
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeHelpModal();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeHelpModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('help-active')) {
        closeHelpModal();
      }
    });
  }

  function openHelpModal() {
    var overlay = document.getElementById('helpModal');
    if (!overlay) return;
    overlay.style.display = 'flex';
    overlay.classList.add('help-active');
    document.body.classList.add('help-modal-open');
  }

  function closeHelpModal() {
    var overlay = document.getElementById('helpModal');
    if (!overlay) return;
    overlay.classList.remove('help-active');
    document.body.classList.remove('help-modal-open');
    setTimeout(function () {
      overlay.style.display = 'none';
    }, 400);
  }

  // --- 注入 CSS ---
  function injectStyles() {
    if (document.getElementById('help-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'help-modal-styles';
    style.textContent =
      '/* Help Button */' +
      '.help-btn .help-btn-heart{color:#fff;font-size:2rem;}' +
      '.help-btn{' +
      'position:fixed;bottom:28px;left:28px;z-index:900;' +
      'width:38px;height:38px;border-radius:50%;border:none;' +
      'background:linear-gradient(135deg,#c0ebd7,#53b34d);' +
      'color:#0b0f14;font-size:1.3rem;font-weight:700;' +
      'cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.5);' +
      'opacity:0;visibility:hidden;transform:scale(0.8);' +
      'transition:opacity .35s var(--ease),transform .35s var(--ease),box-shadow .35s var(--ease);' +
      '}' +
      '.help-btn.show{opacity:1;visibility:visible;transform:scale(1);}' +
      '.help-btn:hover{background:linear-gradient(135deg,#f98d74,#e07058);color:#fff;transform:translateY(-3px);box-shadow:0 6px 24px rgba(249,141,116,0.4);}' +
      '/* Help Modal */' +
      '.help-modal-overlay{' +
      'position:fixed;inset:0;z-index:999998;' +
      'display:none;align-items:center;justify-content:center;' +
      'background:rgba(11,15,20,0.75);' +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
      'opacity:0;visibility:hidden;' +
      'transition:opacity .4s var(--ease),visibility .4s;' +
      '}' +
      '.help-modal-overlay.help-active{opacity:1;visibility:visible;display:flex;}' +
      '.help-modal-inner{' +
      'position:relative;max-width:520px;width:90vw;' +
      'max-height:85vh;overflow-y:auto;' +
      'background:#141c26;border-radius:16px;' +
      'border:1px solid rgba(192,235,215,0.12);' +
      'box-shadow:0 8px 40px rgba(0,0,0,0.6);' +
      'padding:32px 28px 28px;' +
      'transform:translateY(20px) scale(0.95);' +
      'transition:transform .4s var(--ease);' +
      '}' +
      '.help-modal-overlay.help-active .help-modal-inner{transform:translateY(0) scale(1);}' +
      '.help-modal-close{' +
      'position:absolute;top:14px;right:18px;' +
      'background:none;border:none;color:#9aab98;font-size:28px;cursor:pointer;' +
      'transition:color .2s ease;line-height:1;' +
      '}' +
      '.help-modal-close:hover{color:#f98d74;}' +
      '.help-modal-title{' +
      'font-size:1.35rem;font-weight:700;color:#e6efe6;margin:0 0 6px;' +
      'text-align:center;letter-spacing:.5px;' +
      '}' +
      '.help-title-icon{color:#53b34d;}' +
      '.help-intro{' +
      'text-align:center;color:#9aab98;font-size:.92rem;margin:0 0 20px;line-height:1.7;' +
      '}' +
      '.help-intro strong{color:#53b34d;font-weight:600;}' +
      '.help-list{' +
      'list-style:none;padding:0;margin:0 0 16px;' +
      '}' +
      '.help-list li{' +
      'padding:10px 0;border-bottom:1px solid rgba(192,235,215,0.06);' +
      'color:#e6efe6;font-size:.88rem;line-height:1.7;' +
      '}' +
      '.help-list li:last-child{border-bottom:none;}' +
      '.help-tag{' +
      'display:inline-block;background:rgba(83,179,77,0.12);' +
      'color:#53b34d;font-size:.78rem;font-weight:600;' +
      'padding:2px 8px;border-radius:6px;margin-right:8px;' +
      'vertical-align:middle;white-space:nowrap;' +
      '}' +
      '.help-easter-egg{' +
      'margin-top:20px;padding-top:18px;border-top:1px dashed rgba(192,235,215,0.12);' +
      '}' +
      '.help-egg-title{' +
      'font-size:1rem;font-weight:600;color:#53b34d;margin:0 0 12px;text-align:center;' +
      '}' +
      '.help-egg-title .sparkle{color:#53b34d;animation:helpSparkle 2s ease-in-out infinite;}' +
      '@keyframes helpSparkle{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.6;transform:scale(1.2);}}' +
      '.help-list--egg li{color:#9aab98;font-size:.85rem;}' +
      '.help-list--egg .help-tag{background:rgba(83,179,77,0.12);color:#53b34d;}' +
      '/* Mobile */' +
      '@media(max-width:768px){' +
      '.help-btn{bottom:20px;left:20px;width:40px;height:40px;font-size:1.1rem;}' +
      '.help-modal-inner{padding:28px 20px 24px;max-width:95vw;}' +
      '.help-modal-title{font-size:1.15rem;}' +
      '.help-list li{font-size:.82rem;padding:8px 0;}' +
      '.help-tag{font-size:.72rem;padding:1px 6px;}' +
      '}' +
      '@media(max-width:480px){' +
      '.help-btn{bottom:16px;left:16px;width:36px;height:36px;font-size:1rem;}' +
      '.help-modal-inner{padding:24px 16px 20px;}' +
      '.help-modal-title{font-size:1.05rem;}' +
      '.help-intro{font-size:.84rem;}' +
      '.help-list li{font-size:.78rem;}' +
      '}';
    document.head.appendChild(style);
  }

  // --- 初始化 ---
  injectStyles();
  createHelpButton();
  createHelpModal();

  // 页面滚动后显示按钮
  var helpBtn = document.getElementById('helpBtn');
  if (helpBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 200) {
        helpBtn.classList.add('show');
      } else {
        helpBtn.classList.remove('show');
      }
    });
  }
})();
