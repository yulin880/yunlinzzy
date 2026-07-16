
document.addEventListener('DOMContentLoaded', function () {
  window.scrollTo(0, 0);


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

  indicators.forEach(function (btn) {

    btn.addEventListener('click', function () {

      goToSlide(parseInt(this.dataset.index));

      resetCarousel();

    });

  });

  startCarousel();


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


    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    if (window.scrollY > 600) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }


    highlightNav();

    checkFade();
  }

  window.addEventListener("scroll", function () {
    _scrollDirty = true;
    if (!_rafScheduled) {
      _rafScheduled = true;
      requestAnimationFrame(onScrollTick);
    }
  });


  navToggle.addEventListener('click', function () {

    navMenu.classList.toggle('open');

  });

  navMenu.querySelectorAll('a').forEach(function (link) {

    link.addEventListener('click', function () {

      navMenu.classList.remove('open');

    });

  });

  const sections = document.querySelectorAll('.section[id]');

  const navLinks = document.querySelectorAll('.nav-menu a');

  function highlightNav() {

    var scrollPos = window.scrollY + 100;

    sections.forEach(function (section) {

      var top = section.offsetTop;

      var height = section.offsetHeight;

      var id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {

        navLinks.forEach(function (link) {

          link.classList.remove('active');

          if (link.getAttribute('href') === '#' + id) {

            link.classList.add('active');

          }

        });

      }

    });

  }



  var musicTabs = document.querySelectorAll('.music-tab');

  var tabOriginal = document.getElementById('tab-original');

  var tabLive = document.getElementById('tab-live');

  musicTabs.forEach(function (tab) {

    tab.addEventListener('click', function () {

      musicTabs.forEach(function (t) { t.classList.remove('active'); });

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


  var audioEl = document.getElementById('audioElement');

  var songLists = {};

  var currentList = [];

  var currentIndex = -1;

  var currentTab = 'original';

  var isPlaying = false;

  if (audioEl) {
    audioEl.addEventListener('ended', function () {
      isPlaying = false;
      var allCards = document.querySelectorAll('.music-circle.playing');
      for (var i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove('playing');
      }
    });
  }

  function renderCards(gridId, listKey) {

    var grid = document.getElementById(gridId);

    var songs = songLists[listKey] || [];

    grid.innerHTML = '';

    if (songs.length === 0) {

      grid.innerHTML = '<p class="loading-text">暂无歌曲数据，欢迎刷新页面重试~</p>';

      return;

    }

    songs.forEach(function (song, idx) {

      var a = document.createElement('a');

      a.className = 'music-circle';

      a.href = 'javascript:void(0)';

      a.setAttribute('data-index', idx);

      a.innerHTML = '<div class="disc-outer"><div class="disc-grooves"></div><img class="disc-art" src="' + song.cover_img + '" alt="' + song.audio_name + '" ><div class="disc-spindle"></div></div><div class="circle-title">' + song.audio_name + '</div>';

      a.addEventListener('click', function () {

        var index = parseInt(this.getAttribute('data-index'));

        var allCards = document.querySelectorAll('.music-circle.playing');
        for (var i = 0; i < allCards.length; i++) {
          allCards[i].classList.remove('playing');
        }

        if (listKey !== currentTab || index !== currentIndex) {

          currentTab = listKey;

          currentIndex = index;

          currentList = songLists[listKey];

          if (audioEl) {

            audioEl.src = currentList[index].audio_url;

            audioEl.play().catch(function () { });

            isPlaying = true;

            this.classList.add('playing');

          }

        } else {

          if (audioEl && isPlaying) {

            audioEl.pause();

            isPlaying = false;

          } else if (audioEl) {

            audioEl.play().catch(function () { });

            isPlaying = true;

            this.classList.add('playing');

          }

        }

      });

      grid.appendChild(a);

    });

  }

  function loadMusicData() {

    fetch('/api/original')

      .then(function (r) { return r.json(); })

      .then(function (res) {

        songLists.original = res.data;

        renderCards('originalGrid', 'original');

      })

      .catch(function (err) {

        console.warn('翻唱请求失败', err);
        console.warn('请求原因丢失', err);

        document.getElementById('originalGrid').innerHTML = '<p class="loading-text">加载失败，刷新页面重试~</p>';

      });

    fetch('/api/cover')

      .then(function (r) { return r.json(); })

      .then(function (res) {

        songLists.live = res.data;

        renderCards('liveGrid', 'live');

      })

      .catch(function (err) {

        console.warn('翻唱请求失败', err);

        document.getElementById('liveGrid').innerHTML = '<p class="loading-text">加载失败，刷新页面重试~</p>';

      });

  }

  loadMusicData();



  backToTop = document.getElementById('backToTop');


  backToTop.addEventListener('click', function () {

    window.scrollTo({ top: 0, behavior: 'smooth' });

  });



  var fadeElements = document.querySelectorAll('.fade-in');

  function checkFade() {

    fadeElements.forEach(function (el) {

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



  var messageForm = document.getElementById('messageForm');
  var messageWallGrid = document.getElementById('messageWallGrid');
  var formMsg = document.getElementById('formMsg');

  if (messageForm && messageWallGrid) {


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

      bubble.pauseAnimation = function () {
        bubble.style.animationPlayState = 'paused';
      };

      bubble.restartAnimation = function (duration, delay) {
        bubble.style.animationPlayState = 'running';
        bubble.style.animation = 'danmakuScroll ' + duration + 's linear ' + delay + 's infinite';
      };

      bubble.updateContent = function (nick, text) {
        bubble.innerHTML = '<span class="bubble-nick">' + nick + '</span><span class="bubble-text">' + text + '</span>';
      };

      bubble.setNewStyle = function (topOffset, duration) {
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
      };

      bubble.setNormalStyle = function (topOffset, duration) {
        bubble.classList.remove('message-new');
        bubble.style.top = topOffset + 'px';
        bubble.style.left = '105%';
        bubble.style.color = '#e6efe6';
        bubble.style.background = 'rgba(20,28,38,0.85)';
        bubble.style.border = '1px solid rgba(192,235,215,0.15)';
        bubble.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';

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

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(text));
      return div.innerHTML;
    }

    function appendDanmakuBatch(msgArray, isUserMsg) {
      var total = msgArray.length;
      var offset = 0;

      function processNextBatch() {
        if (offset >= total) return;
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

        bubble = reuseIdleBubble();
        applyBubbleData(bubble, msgData, isUserMsg);
      } else if (poolActive.length + poolIdle.length < DANMAKU_MAX) {

        bubble = createDanmakuBubble();
        applyBubbleData(bubble, msgData, isUserMsg);
        messageWallGrid.appendChild(bubble);
      } else {

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


      var gridWidth = messageWallGrid.clientWidth || 1000;
      var scrollDistance = -(gridWidth * 2.25);
      bubble.style.setProperty('--scroll-amount', scrollDistance + 'px');

      if (isUserMsg) {
        bubble.setNewStyle(params.topOffset, duration);
      } else {
        bubble.setNormalStyle(params.topOffset, duration);
      }

      bubble.updateContent(msgData.nick, msgData.text);


      bubble.style.animation = animName + ' ' + duration + 's linear ' + delay + 's infinite';

      bubble.style.opacity = '1';
      bubble._danmakuIdle = false;
      bubble._danmakuDuration = duration;

      bubble._danmakuStartTime = Date.now();
    }



    messageWallGrid.addEventListener('mouseover', function (e) {
      var bubble = e.target.closest('.message-bubble');
      if (bubble) bubble.style.animationPlayState = 'paused';
    });
    messageWallGrid.addEventListener('mouseout', function (e) {
      var bubble = e.target.closest('.message-bubble');
      if (bubble) bubble.style.animationPlayState = 'running';
    });


    var danmakuObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {

          var bubbles = messageWallGrid.querySelectorAll('.message-bubble');
          for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].style.animationPlayState = 'paused';
          }
        } else {

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
        .then(function (r) { return r.json(); })
        .then(function (res) {
          var msgs = res.data || [];
          messageWallGrid.innerHTML = '';
          poolActive = [];
          poolIdle = [];

          if (msgs.length === 0) {
            messageWallGrid.innerHTML = '<div class="message-loading">暂无留言，期待你的第一句表白✦</div>';
            return;
          }

          appendDanmakuBatch(msgs.map(function (m) {
            return { nick: m.nick_name, text: m.msg_text };
          }), false);

        })
        .catch(function () {
          messageWallGrid.innerHTML = '<div class="message-loading">加载失败，请稍后再试或刷新页面~</div>';
        });
    }



    messageForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nick = document.getElementById('nickInput').value.trim();
      var msg = document.getElementById('msgInput').value.trim();
      formMsg.textContent = '';

      fetch('/api/addMsg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nick_name: nick, msg_text: msg })
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          var success = (res.code === 200) || (res.msg && res.msg.includes('成功'));

          if (success) {
            document.getElementById('nickInput').value = '';
            document.getElementById('msgInput').value = '';

            addSingleBubble({ nick: nick, text: msg }, true);
          } else {
            formMsg.textContent = res.msg || '提交失败';
          }
        })
        .catch(function () {
          formMsg.textContent = "网络异常，请检查连接";
        });
    });

    loadMessages();

  }


  var videoModal = document.getElementById("videoModal");
  var videoIframe = document.getElementById("videoIframe");
  var modalCloseBtn = document.querySelector(".modal-close");

  function openVideoModal(url, type) {
    if (!videoModal || !videoIframe) return;
    videoIframe.src = url;

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

  document.querySelectorAll('a[data-type="bilibili"], a[data-type="douyin"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
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
    modalCloseBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeVideoModal();
    });
  }

  if (videoModal) {
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && videoModal && videoModal.classList.contains("active")) {
      closeVideoModal();
    }
  });
});


(function initSplash() {
  const overlay = document.getElementById('splashOverlay');
  const dismissBtn = document.getElementById('splashDismiss');
  if (!overlay) return;

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => closeSplash());
  }


  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSplash();
  });


  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeSplash();
    }
  });


  setTimeout(closeSplash, 4000);

  function closeSplash() {
    overlay.classList.add('hidden');
    setTimeout(() => { overlay.remove(); }, 700);
  }
})();



