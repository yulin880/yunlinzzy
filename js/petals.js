// ============================================
// 飘落花瓣特效 - 独立样式模块
// ============================================

(function () {
  'use strict';

  var PETAL_CONFIG = {
    images: [
      'media/piaofu/1.webp',
      'media/piaofu/2.webp',
      'media/piaofu/3.webp',
      'media/piaofu/4.webp',
      'media/piaofu/5.webp'
    ],
    clickSound: 'media/piaofu/zzy.mp3',
    initialCount: 12,
    durationMin: 16,
    durationMax: 30,
    enableSound: true
  };

  var petalContainer = null;
  var soundCache = {};
  var isMobile = window.innerWidth <= 768;
  var isSmallMobile = window.innerWidth <= 480;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createContainer() {
    if (document.getElementById('petal-container')) return;
    petalContainer = document.createElement('div');
    petalContainer.id = 'petal-container';
    document.body.appendChild(petalContainer);
  }

  function createPetalDOM(imgPath, size) {
    var wrapper = document.createElement('div');
    wrapper.className = 'petal';
    wrapper.style.width = size + 'px';
    wrapper.style.height = size + 'px';

    var img = document.createElement('img');
    img.src = imgPath;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.pointerEvents = 'none';
    img.style.display = 'block';
    wrapper.appendChild(img);
    return wrapper;
  }

  function bindPetalEvents(petal) {
    function handleClick(e) {
      e.stopPropagation();
      e.preventDefault();
      playPetalSound();
      petal.style.opacity = '0';
      petal.style.transition = 'opacity 0.3s ease';
      setTimeout(function () { resetPetal(petal); }, 300);
    }
    petal.addEventListener('click', handleClick);
    petal.addEventListener('touchend', function (e) {
      e.stopPropagation();
      e.preventDefault();
      handleClick(e);
    });
  }

  function playPetalSound() {
    if (!PETAL_CONFIG.enableSound) return;
    var audio = soundCache['default'];
    if (!audio) {
      audio = new Audio(PETAL_CONFIG.clickSound);
      audio.volume = 0.6;
      audio.preload = 'auto';
      soundCache['default'] = audio;
    } else {
      audio.currentTime = 0;
    }
    audio.play().catch(function () { });
  }

  function getPetalCount() {
    if (isSmallMobile) return 4;
    if (isMobile) return 6;
    var count = Math.floor(window.innerWidth / 120);
    return Math.min(Math.max(count, PETAL_CONFIG.initialCount - 3), PETAL_CONFIG.initialCount + 3);
  }

  // 分配大小策略：每 12 片一个循环
  // 中号：28-35px占 60%，小号：18-24px占 30%，大号：45-55px占 10%
  function assignSizeAndSide(index, total) {
    var size, xPercent;
    var rand = Math.random();
    if (rand < 0.1) {
      // 10% 大号
      size = random(45, 55);
    } else if (rand < 0.4) {
      // 30% 小号
      size = random(18, 24);
    } else {
      // 60% 中号
      size = random(28, 35);
    }

    // 左右交替出现
    var side = (index % 2 === 0) ? 'left' : 'right';
    if (side === 'left') {
      xPercent = random(5, 35);
    } else {
      xPercent = random(65, 95);
    }

    return { size: size, xPercent: xPercent };
  }

  function createAllPetals() {
    if (!petalContainer) return;
    petalContainer.innerHTML = '';
    var count = getPetalCount();

    for (var i = 0; i < count; i++) {
      var imgPath = PETAL_CONFIG.images[i % PETAL_CONFIG.images.length];
      var assignment = assignSizeAndSide(i, count);
      var petal = createPetalDOM(imgPath, assignment.size);

      petal.style.left = assignment.xPercent + '%';
      petal.style.top = random(-100, -40) + 'px';

      var speedSlots = [16, 19, 22, 25, 28, 30];
      var duration = speedSlots[i % speedSlots.length];

      var delay = i * 2;

      var driftPx = random(-15, 15);
      petal.style.setProperty('--drift', driftPx + 'px');

      petal.style.animation = 'petalFall ' + duration + 's linear ' + delay + 's infinite';

      bindPetalEvents(petal);
      petalContainer.appendChild(petal);
    }
  }

  function resetPetal(petal) {
    // Use rAF to avoid forced synchronous layout
    var resetAnim = (function (p) {
      return function () {
        p.style.animation = 'none';
      };
    })(petal);
    requestAnimationFrame(function () {
      resetAnim();
    });

    var side = random(0, 2) > 1 ? 'right' : 'left';
    var xPercent = side === 'left' ? random(5, 35) : random(65, 95);
    petal.style.left = xPercent + '%';
    petal.style.top = random(-100, -40) + 'px';
    petal.style.opacity = '';
    petal.style.transition = '';

    var speedSlots = [16, 19, 22, 25, 28, 30];
    var duration = speedSlots[Math.floor(random(0, speedSlots.length))];
    var driftPx = random(-15, 15);
    petal.style.setProperty('--drift', driftPx + 'px');
    var delay = random(2, 4);
    petal.style.animation = 'petalFall ' + duration + 's linear ' + delay + 's infinite';
  }

  function observeModals() {
    var splashOverlay = document.getElementById('splashOverlay');
    var videoModal = document.getElementById('videoModal');

    if (splashOverlay) {
      var observer = new MutationObserver(function () {
        if (!splashOverlay.classList.contains('hidden')) {
          petalContainer.style.opacity = '0.3';
        } else {
          petalContainer.style.opacity = '1';
        }
      });
      observer.observe(splashOverlay, { attributes: true, attributeFilter: ['class'] });
    }

    if (videoModal) {
      var observer2 = new MutationObserver(function () {
        if (videoModal.classList.contains('active') || videoModal.style.display === 'flex' || videoModal.style.display === '') {
          petalContainer.style.opacity = '0.2';
        } else {
          petalContainer.style.opacity = '1';
        }
      });
      observer2.observe(videoModal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function observeVisibility() {
    var visibilityObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          // 花瓣离开视口，暂停所有花瓣动画
          var petals = petalContainer.querySelectorAll('.petal');
          for (var i = 0; i < petals.length; i++) {
            petals[i].style.animationPlayState = 'paused';
          }
        } else {
          // 恢复进入视口，恢复所有花瓣动画
          var petals2 = petalContainer.querySelectorAll('.petal');
          for (var j = 0; j < petals2.length; j++) {
            petals2[j].style.animationPlayState = 'running';
          }
        }
      });
    }, { threshold: 0.01 });
    visibilityObserver.observe(petalContainer);
  }
  function init() {
    createContainer();
    createAllPetals();
    observeVisibility();
    observeModals();
    window.addEventListener('resize', function () {
      var newIsMobile = window.innerWidth <= 768;
      var newIsSmallMobile = window.innerWidth <= 480;
      if (newIsMobile !== isMobile || newIsSmallMobile !== isSmallMobile) {
        isMobile = newIsMobile;
        isSmallMobile = newIsSmallMobile;
        createAllPetals();
        observeVisibility();
      }
    });
    console.log('[花瓣] 飘落特效已初始化 ' + getPetalCount() + ' 片花瓣');;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
