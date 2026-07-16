// ============================================
// 张真源粉丝站 - 主交互逻辑
// 包含幻灯片、导航特效、视频弹窗、弹幕留言
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  window.scrollTo(0, 0);

  // --- 1. 幻灯片自动切换 ---

  const slides = document.querySelectorAll('.carousel-slide');

  const indicators = document.querySelectorAll('.carousel-indicators button');

  let currentSlide = 0;

  let carouselTimer;

  function goToSlide(index) {

    slides[currentSlide].classList.remove('active');

    indicators[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');

    indicators[currentSlide].classList.add('active');

  }

  function nextSlide() {

    const next = (currentSlide + 1) % slides.length;

    goToSlide(next);

  }

  function startCarousel() {

    carouselTimer = setInterval(nextSlide, 5000);

  }

  function resetCarousel() {

    clearInterval(carouselTimer);

    startCarousel();

  }

  indicators.forEach(function(btn) {

    btn.addEventListener('click', function() {

      goToSlide(parseInt(this.dataset.index));

      resetCarousel();

    });

  });

  startCarousel();

  // --- 2. 导航栏滚动特效 ---

  const navbar = document.getElementById('navbar');
  var backToTop;

  const navToggle = document.getElementById('navToggle');

  const navMenu = document.getElementById('navMenu');

  var _scrollDirty = true;
  var _rafScheduled = false;

  function onScrollTick() {
    if (!_scrollDirty) return;
    _rafScheduled = false;
    _scrollDirty = false;

    // Navbar scrolled state
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // Back to top visibility
    if (window.scrollY > 600) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }

    // Nav highlight
    highlightNav();

    // Fade-in check
    checkFade();
  }

  window.addEventListener("scroll", function() {
    _scrollDirty = true;
    if (!_rafScheduled) {
      _rafScheduled = true;
      requestAnimationFrame(onScrollTick);
    }
  });


  navToggle.addEventListener('click', function() {

    navMenu.classList.toggle('open');

  });

  navMenu.querySelectorAll('a').forEach(function(link) {

    link.addEventListener('click', function() {

      navMenu.classList.remove('open');

    });

  });

  const sections = document.querySelectorAll('.section[id]');

  const navLinks = document.querySelectorAll('.nav-menu a');

  function highlightNav() {

    var scrollPos = window.scrollY + 100;

    sections.forEach(function(section) {

      var top = section.offsetTop;

      var height = section.offsetHeight;

      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {

        navLinks.forEach(function(link) {

          link.classList.remove('active');

          if (link.getAttribute('href') === '#' + id) {

            link.classList.add('active');

          }

        });

      }

    });

  }


  // --- 3. 音乐卡片Tab切换 ---

  var musicTabs = document.querySelectorAll('.music-tab');

  var tabOriginal = document.getElementById('tab-original');

  var tabLive = document.getElementById('tab-live');

  musicTabs.forEach(function(tab) {

    tab.addEventListener('click', function() {

      musicTabs.forEach(function(t) { t.classList.remove('active'); });

      this.classList.add('active');

      var target = this.dataset.tab;

      if (target === 'original') {

        tabOriginal.style.display = '';

        tabLive.style.display = 'none';

      } else {

        tabOriginal.style.display = 'none';

        tabLive.style.display = '';

      }

    });

  });

  // 卡片封面渲染视频嵌入
  function renderMusicCards(grid, list) {

    grid.innerHTML = '';

    if (!list || list.length === 0) {

      grid.innerHTML = '<p class="loading-text">暂无歌曲数据，欢迎刷新页面重试~</p>';

      return;

    }

    list.forEach(function(song, idx) {

      var card = document.createElement('div');

      card.className = 'music-card fade-in';

      card.style.transitionDelay = (idx >= 0 ? idx * 50 : 0) + 'ms';

      var isCover = song.cover_img && song.cover_img !== '';

      var coverSrc = isCover ? song.cover_img : 'media/图片/splash-iris.webp';

      var audioUrl = song.audio_url || '';

      var name = song.audio_name || '未知曲目';

      card.innerHTML = '<div class="music-card-inner">' +

        '<div class="music-cover">' +

          '<img src="' + coverSrc + '" alt="' + name + '" loading="lazy">' +

          '<div class="music-play-overlay">' +

            '<svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>' +

          '</div>' +

        '</div>' +

        '<div class="music-info">' +

          '<h3 class="music-name">' + name + '</h3>' +

        '</div>' +

      '</div>';

      grid.appendChild(card);

      // 封面点击播放音频
      var playOverlay = card.querySelector('.music-play-overlay');

      var disc = card.querySelector('.music-disc');

      if (playOverlay && audioUrl) {

        playOverlay.addEventListener('click', function(e) {

          e.stopPropagation();

          var audio = new Audio(audioUrl);

          audio.volume = 0.5;

          audio.play().catch(function(err) {

            console.warn('播放失败', err);

          });

          // 移除其他卡片 playing 状态
          grid.querySelectorAll('.music-card').forEach(function(c) {

            if (c !== card) c.classList.remove('playing');

          });

          card.classList.toggle('playing');

          // 检查当前卡片有 playing 状态
          if (card.classList.contains('playing')) {

            audio.addEventListener('ended', function() {

              card.classList.remove('playing');

            });

          }

        });

      }

    });

  }

  // 自动加载音乐卡片
  function loadMusicData() {

    var originalGrid = document.getElementById('originalGrid');

    var liveGrid = document.getElementById('liveGrid');

    if (!originalGrid || !liveGrid) return;

    // 原创歌曲
    fetch('/api/original')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.code === 200 && res.data) {
          renderMusicCards(originalGrid, res.data);
        }
      })
      .catch(function(err) {
        console.warn('原创歌曲加载失败', err);
      });

    // 翻唱歌曲
    fetch('/api/cover')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.code === 200 && res.data) {
          renderMusicCards(liveGrid, res.data);
        }
      })
      .catch(function(err) {
        console.warn('翻唱歌曲加载失败', err);
      });

  }

  loadMusicData();

  // --- 4. 回到顶部按钮 ---

  backToTop = document.getElementById('backToTop');


  backToTop.addEventListener('click', function() {

    window.scrollTo({ top: 0, behavior: 'smooth' });

  });

  // --- 5. 滚动渐入动画 ---

  var fadeElements = document.querySelectorAll('.fade-in');

  function checkFade() {

    fadeElements.forEach(function(el) {

      var rect = el.getBoundingClientRect();

      var windowHeight = window.innerHeight;

      if (rect.top < windowHeight * 0.75) {

        var parent = el.parentElement;

        var siblings = parent ? Array.from(parent.querySelectorAll('.fade-in')) : [];

        var idx = siblings.indexOf(el);

        el.style.transitionDelay = (idx >= 0 ? idx * 50 : 0) + 'ms';

        el.classList.add('visible');

      }

    });

  }


  checkFade();

  // --- 6. 弹幕留言墙 (优化版: transform动画 + 对象池 + 分片渲染) ---

  var messageForm = document.getElementById('messageForm');
  var messageWallGrid = document.getElementById('messageWallGrid');
  var formMsg = document.getElementById('formMsg');

  if (messageForm && messageWallGrid) {

    /* ========== 弹幕留言逻辑 ========== */
    var DANMAKU_MAX = 50;
    var DANMAKU_BATCH = 6;
    var poolActive = [];
    var poolIdle = [];

    function getPoolSize() {
      return poolActive.length + poolIdle.length;
    }

    function reuseIdleBubble() {
      if (poolIdle.length > 0) {
        var b = poolIdle.pop();
        b.pauseAnimation();
        b.classList.remove('message-new');
        if (poolActive.indexOf(b) === -1) poolActive.push(b);
        return b;
      }
      return null;
    }

    function createDanmakuBubble() {
      var bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      poolActive.push(bubble);

      bubble.pauseAnimation = function() {
        bubble.style.animationPlayState = 'paused';
      };

      bubble.restartAnimation = function(duration, delay) {
        bubble.style.animationPlayState = 'running';
        bubble.style.animation = 'danmakuScroll ' + duration + 's linear ' + delay + 's infinite';
      };

      bubble.updateContent = function(nick, text) {
        bubble.innerHTML = '<span class="bubble-nick">' + nick + '</span><span class="bubble-text">' + text + '</span>';
      };

      bubble.setNewStyle = function(topOffset, duration) {
        bubble.classList.add('message-new');
        bubble.style.top = topOffset + 'px';
        bubble.style.left = '105%';
        bubble.style.zIndex = '200';
        bubble.style.fontSize = '18px';
        bubble.style.fontWeight = 'bold';
        bubble.style.padding = '10px 22px';
        bubble.style.borderRadius = '20px';
        bubble.style.borderColor = 'rgba(83,179,77,0.9)';
        bubble.style.boxShadow = '0 2px 12px rgba(83,179,77,0.15)';
        bubble.style.background = 'linear-gradient(135deg, #53b34d, #c0ebd7)';
        bubble.style.color = '#fff';
        bubble.style.textShadow = '0 1px 3px rgba(0,0,0,0.2)';
        // animation 由 applyBubbleData 统一设置，此处不再重复
      };

      bubble.setNormalStyle = function(topOffset, duration) {
        bubble.style.top = topOffset + 'px';
        bubble.style.left = '105%';
        bubble.style.zIndex = '1';
        bubble.style.fontSize = '14px';
        bubble.style.fontWeight = 'normal';
        bubble.style.padding = '6px 18px';
        bubble.style.borderRadius = '24px';
        bubble.style.borderColor = 'transparent';
        bubble.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
        bubble.style.background = 'rgba(20, 28, 38, 0.85)';
        bubble.style.color = '#e6efe6';
        bubble.style.textShadow = 'none';
        // animation 由 applyBubbleData 统一设置，此处不再重复
      };

      return bubble;
    }

    function calcBubbleParams() {
      var gridHeight = messageWallGrid.clientHeight || 360;
      var randomLane = Math.floor(Math.random() * 9);
      var rowHeight = gridHeight / 9;
      var topOffset = randomLane * rowHeight + Math.random() * (rowHeight - 40);
      return { topOffset: topOffset, gridHeight: gridHeight };
    }

    function appendDanmakuBatch(msgArray, isUserMsg) {
      var total = msgArray.length;
      if (total === 0) return;

      var offset = 0;

      function processNextBatch() {
        var end = Math.min(offset + DANMAKU_BATCH, total);
        for (var i = offset; i < end; i++) {
          addSingleBubble(msgArray[i], isUserMsg);
        }
        offset = end;
        if (offset < total) {
          setTimeout(processNextBatch, 0);
        }
      }

      processNextBatch();
    }

    function addSingleBubble(msgData, isUserMsg) {
      var bubble;

      if (poolIdle.length > 0) {
        // Priority 1: reuse idle node
        bubble = reuseIdleBubble();
        applyBubbleData(bubble, msgData, isUserMsg);
      } else if (poolActive.length + poolIdle.length < DANMAKU_MAX) {
        // Priority 2: create new node (under limit)
        bubble = createDanmakuBubble();
        applyBubbleData(bubble, msgData, isUserMsg);
        messageWallGrid.appendChild(bubble);
      } else {
        // Priority 3: pool full, force-recycle oldest active bubble
        var oldest = poolActive.shift();
        applyBubbleData(oldest, msgData, isUserMsg);
        poolActive.push(oldest);
      }
    }

    function applyBubbleData(bubble, msgData, isUserMsg) {
      var params = calcBubbleParams();
      var duration = isUserMsg ? 22 : (18 + Math.random() * 10);
      var delay = isUserMsg ? 0 : (Math.random() * duration);
      var animName = isUserMsg ? 'danmakuScrollNew' : 'danmakuScroll';

      // 动态计算scroll距离：容器宽度 * 2.25，等价于 left:105% -> left:-120%
      var gridWidth = messageWallGrid.clientWidth || 1000;
      var scrollDistance = -(gridWidth * 2.25);
      bubble.style.setProperty('--scroll-amount', scrollDistance + 'px');

      if (isUserMsg) {
        bubble.setNewStyle(params.topOffset, duration);
      } else {
        bubble.setNormalStyle(params.topOffset, duration);
      }

      bubble.updateContent(msgData.nick, msgData.text);
      // Override animation with correct name (setNewStyle sets danmakuScrollNew,
      // setNormalStyle doesn't set animation, so restartAnimation handles both)
      /* 直接设置动画属性 */

      bubble.style.animation = animName + ' ' + duration + 's linear ' + delay + 's infinite';

      bubble.style.opacity = '1';
      bubble._danmakuIdle = false;
      bubble._danmakuDuration = duration;

      bubble._danmakuStartTime = Date.now();
    }


    // 事件委托，动画暂停统一由 hover 控制
    messageWallGrid.addEventListener('mouseover', function(e) {
      var bubble = e.target.closest('.message-bubble');
      if (bubble) bubble.style.animationPlayState = 'paused';
    });
    messageWallGrid.addEventListener('mouseout', function(e) {
      var bubble = e.target.closest('.message-bubble');
      if (bubble) bubble.style.animationPlayState = 'running';
    });

    // IntersectionObserver检测屏幕不可见时暂停弹幕
    var danmakuObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) {
          // 弹幕离开视口，暂停所有弹幕动画
          var bubbles = messageWallGrid.querySelectorAll('.message-bubble');
          for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].style.animationPlayState = 'paused';
          }
        } else {
          // 弹幕进入视口，恢复所有弹幕动画，同时恢复 hover 暂停状态
          var bubbles2 = messageWallGrid.querySelectorAll('.message-bubble');
          for (var j = 0; j < bubbles2.length; j++) {
            bubbles2[j].style.animationPlayState = 'running';
          }
        }
      });
    }, { threshold: 0.01 });
    danmakuObserver.observe(messageWallGrid);

    function loadMessages() {
      fetch('/api/message')
        .then(function(r) { return r.json(); })
        .then(function(res) {
          var msgs = res.data || [];
          messageWallGrid.innerHTML = '';
          poolActive = [];
          poolIdle = [];

          if (msgs.length === 0) {
            messageWallGrid.innerHTML = '<div class="message-loading">暂无留言，来抢沙发吧~</div>';
            return;
          }

          appendDanmakuBatch(msgs.map(function(m) {
            return { nick: m.nick_name, text: m.msg_text };
          }), false);

        })
        .catch(function() {
          messageWallGrid.innerHTML = '<div class="message-loading">加载失败，请检查网络连接或稍后重试~</div>';
        });
    }

    /* 弹幕定时清空，已禁用，改为 CSS @keyframes 无限循环滚动 */

    messageForm.addEventListener('submit', function(e) {
      e.preventDefault();

      var nick = document.getElementById('nickInput').value.trim();
      var msg = document.getElementById('msgInput').value.trim();
      formMsg.textContent = '';

      fetch('/api/addMsg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick_name: nick, msg_text: msg })
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        // 双重判断：优先 code === 200，其次 includes 模糊匹配兜底
        var success = (res.code === 200) || (res.msg && res.msg.includes('成功'));

        if (success) {
          document.getElementById('nickInput').value = '';
          document.getElementById('msgInput').value = '';

          addSingleBubble({ nick: nick, text: msg }, true);
        } else {
          formMsg.textContent = res.msg || '提交失败';
        }
      })
      .catch(function() {
        formMsg.textContent = "网络异常，请检查连接";
      });
    });

    loadMessages();

  }

  // ============================================
  // Video Modal - B站/抖音 视频弹窗
  // ============================================
  var videoModal = document.getElementById("videoModal");
  var videoIframe = document.getElementById("videoIframe");
  var modalCloseBtn = document.querySelector(".modal-close");

  function openVideoModal(url, type) {
    if (!videoModal || !videoIframe) return;
    videoIframe.src = url;
    // Force ALL positioning props inline to bypass any CSS override
    videoModal.style.setProperty("display", "flex", "important");
    videoModal.style.setProperty("position", "fixed", "important");
    videoModal.style.setProperty("top", "0", "important");
    videoModal.style.setProperty("left", "0", "important");
    videoModal.style.setProperty("width", "100vw", "important");
    videoModal.style.setProperty("height", "100vh", "important");
    videoModal.style.setProperty("z-index", "999999", "important");
    videoModal.style.setProperty("align-items", "center", "important");
    videoModal.style.setProperty("justify-content", "center", "important");
    videoModal.classList.add("active");
    if (type === "douyin") {
      videoModal.classList.add("douyin-mode");
    } else {
      videoModal.classList.remove("douyin-mode");
    }
    document.body.classList.add("modal-open");

  }

  function closeVideoModal() {
    if (!videoModal || !videoIframe) return;
    videoModal.style.setProperty("display", "none", "important");
    videoModal.classList.remove("active");
    videoModal.classList.remove("douyin-mode");
    // Reset inline styles
    videoModal.style.removeProperty("position");
    videoModal.style.removeProperty("top");
    videoModal.style.removeProperty("left");
    videoModal.style.removeProperty("width");
    videoModal.style.removeProperty("height");
    videoModal.style.removeProperty("z-index");
    videoModal.style.removeProperty("align-items");
    videoModal.style.removeProperty("justify-content");
    videoModal.style.removeProperty("background");

    videoIframe.src = "";
    document.body.classList.remove("modal-open");
  }

  document.querySelectorAll('a[data-type="bilibili"], a[data-type="douyin"]').forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      var type = this.getAttribute("data-type");
      var id = this.getAttribute("data-id");
      if (!id) return;
      var playerUrl = "";
      if (type === "bilibili") {
        playerUrl = "https://player.bilibili.com/player.html?bvid=" + encodeURIComponent(id) + "&high_quality=1&autoplay=1";
      } else if (type === "douyin") {
        playerUrl = "https://open.douyin.com/player/video?vid=" + encodeURIComponent(id) + "&autoplay=1";
      }
      if (playerUrl) {
        openVideoModal(playerUrl, type);
      }
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeVideoModal();
    });
  }

  if (videoModal) {
    videoModal.addEventListener("click", function(e) {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && videoModal && videoModal.classList.contains("active")) {
      closeVideoModal();
    }
  });
});

// ========== 开屏欢迎页 ==========
(function initSplash() {
  const overlay = document.getElementById('splashOverlay');
  const dismissBtn = document.getElementById('splashDismiss');
  if (!overlay) return;

  // 绑定关闭按钮
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => closeSplash());
  }

  // 点击遮罩也可关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSplash();
  });

  // ESC 键关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeSplash();
    }
  });

  // 3秒自动关闭
  setTimeout(closeSplash, 4000);

  function closeSplash() {
    overlay.classList.add('hidden');
    setTimeout(() => { overlay.remove(); }, 700);
  }
})();