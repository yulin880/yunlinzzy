// ============================================
// 背景音乐系统 - 独立模块，不影响原有代码
// 歌曲：相思锁（来自云数据库）
// ============================================

(function () {
  'use strict';

  var BGM_CONFIG = {
    src: 'https://mp3tourl.com/audio/1783346868817-76abafa2-1e61-4745-b325-b58940bb1232.mp3',
    volume: 0.6,
    loop: true
  };

  var bgm = document.createElement('audio');
  bgm.id = 'bgm-audio';
  bgm.src = BGM_CONFIG.src;
  bgm.volume = BGM_CONFIG.volume;
  bgm.loop = BGM_CONFIG.loop;
  bgm.preload = 'auto';

  var bgmStarted = false;
  var pausedByOther = false;
  var savedTime = 0;

  // 记录所有正在播放的 iframe 的 src
  var playingIframes = {};

  // ========== 背景音乐控制 ==========

  function startBGM() {
    if (bgmStarted) return;
    bgm.play().then(function () {
      bgmStarted = true;
      updateBGMIcon();
    }).catch(function (err) {
      console.warn('[BGM] 播放需要用户交互:', err);
    });
  }

  function updateBGMIcon() {
    var icon = document.getElementById('bgm-icon');
    if (!icon) return;
    icon.textContent = (bgmStarted && !bgm.paused) ? '🎵' : '🔇';
  }

  function pauseBGM() {
    if (!bgmStarted || bgm.paused) return;
    savedTime = bgm.currentTime;
    bgm.pause();
    pausedByOther = true;
    updateBGMIcon();
  }

  function resumeBGM() {
    if (!pausedByOther || !bgmStarted) return;
    bgm.currentTime = savedTime;
    bgm.play().then(function () {
      pausedByOther = false;
      updateBGMIcon();
    }).catch(function (err) {
      console.warn('[BGM] 恢复播放失败:', err);
    });
  }

  function toggleBGM() {
    if (!bgmStarted) {
      startBGM();
    } else if (!bgm.paused) {
      pauseBGM();
    } else {
      resumeBGM();
    }
  }

  // ========== 检测是否有其他媒体在播放 ==========

  function hasActiveVideoOrAudio() {
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
      if (!videos[i].paused) return true;
    }

    var audios = document.querySelectorAll('audio:not(#bgm-audio)');
    for (var j = 0; j < audios.length; j++) {
      if (!audios[j].paused) return true;
    }

    return false;
  }

  function hasActiveIframe() {
    // 检查是否有有效的 iframe 正在播放
    var bilibiliIframes = document.querySelectorAll('iframe[src*="bilibili"]');
    for (var i = 0; i < bilibiliIframes.length; i++) {
      var iframe = bilibiliIframes[i];
      if (iframe.src && iframe.src.length > 0 && iframe.src.indexOf('about:blank') === -1) {
        return true;
      }
    }

    var douyinIframes = document.querySelectorAll('iframe[src*="douyin"]');
    for (var j = 0; j < douyinIframes.length; j++) {
      var iframe2 = douyinIframes[j];
      if (iframe2.src && iframe2.src.length > 0 && iframe2.src.indexOf('about:blank') === -1) {
        return true;
      }
    }

    return false;
  }

  function isAnyMediaPlaying() {
    return hasActiveVideoOrAudio() || hasActiveIframe();
  }

  // ========== 监听原生 video/audio 元素 ==========

  function watchNativeMedia() {
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
      (function (video) {
        video.addEventListener('play', function () { pauseBGM(); });
        video.addEventListener('pause', function () { resumeBGM(); });
      })(videos[i]);
    }

    var audios = document.querySelectorAll('audio:not(#bgm-audio)');
    for (var j = 0; j < audios.length; j++) {
      (function (audio) {
        audio.addEventListener('play', function () { pauseBGM(); });
        audio.addEventListener('pause', function () { resumeBGM(); });
      })(audios[j]);
    }
  }

  // ========== 监听 iframe 媒体卡片点击 ==========

  function watchMediaCards() {
    var cards = document.querySelectorAll('[data-type="bilibili"], [data-type="douyin"]');
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        card.addEventListener('click', function () {
          // 卡片被点击，视频即将打开，暂停背景音乐
          pauseBGM();
        });
      })(cards[i]);
    }
  }

  // ========== 监听视频弹窗关闭 ==========

  function watchVideoModal() {
    var videoModal = document.getElementById('videoModal');
    var videoIframe = document.getElementById('videoIframe');

    if (!videoModal || !videoIframe) return;

    // 使用 MutationObserver 监听 iframe 的 src 属性变化
    var observer = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        var mutation = mutations[m];
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          var newSrc = videoIframe.getAttribute('src');
          // src 被清空 = 弹窗关闭，恢复背景音乐
          if (!newSrc || newSrc === '' || newSrc === 'about:blank') {
            setTimeout(function () {
              if (!hasActiveIframe() && !hasActiveVideoOrAudio()) {
                resumeBGM();
              }
            }, 300);
          }
        }
      }
    });

    observer.observe(videoIframe, { attributes: true, attributeFilter: ['src'] });
  }

  // ========== 创建悬浮控制图标 ==========

  function createBGMControl() {
    if (document.getElementById('bgm-control')) return;

    var control = document.createElement('div');
    control.id = 'bgm-control';
    control.innerHTML = '<span id="bgm-icon">🔇</span>';
    control.title = '背景音乐';
    control.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:10000;width:36px;height:36px;background:rgba(11,15,20,0.8);backdrop-filter:blur(8px);border:1px solid rgba(192,235,215,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 2px 8px rgba(0,0,0,0.3);user-select:none;';

    control.addEventListener('mouseenter', function () {
      control.style.transform = 'scale(1.08)';
      control.style.boxShadow = '0 2px 12px rgba(83,179,77,0.3)';
    });

    control.addEventListener('mouseleave', function () {
      control.style.transform = 'scale(1)';
      control.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    });

    control.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleBGM();
    });

    document.body.appendChild(control);
  }

  // ========== 初始化 ==========

  function init() {
    document.body.appendChild(bgm);
    createBGMControl();
    watchNativeMedia();
    watchMediaCards();
    watchVideoModal();

    // 页面可见性变化处理
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && bgmStarted && !pausedByOther) {
        if (bgm.paused) bgm.play().catch(function () { });
      }
    });

    // 首次点击页面启动背景音乐
    document.addEventListener('click', function firstClick() {
      startBGM();
      document.removeEventListener('click', firstClick);
    }, { once: true });

    console.log('[BGM] 相思锁背景音乐已就绪');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BGM = {
    pause: pauseBGM,
    resume: resumeBGM,
    toggle: toggleBGM,
    start: startBGM,
    isPlaying: function () { return bgmStarted && !bgm.paused; }
  };

})();


