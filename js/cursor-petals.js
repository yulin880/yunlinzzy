// ============================================
// 鼠标花瓣粒子效果（性能优化版：CSS 动画替代 rAF）
// ============================================

(function () {
  'use strict';

  var IMAGES = ['media/piaofu/1.webp', 'media/piaofu/2.webp', 'media/piaofu/3.webp', 'media/piaofu/4.webp', 'media/piaofu/5.webp'];
  var MIN_SIZE = 3;
  var MAX_SIZE = 7;
  var PARTICLES_PER_SPAWN = 3;
  var MAX_LIFETIME = 300;
  var MAX_PARTICLES = 50;

  var container = null;
  var images = [];
  var particles = [];
  var lastMouseX = -1;
  var lastMouseY = -1;
  var lastSpawnTime = 0;

  function preload() {
    var loaded = 0;
    IMAGES.forEach(function (src) {
      var img = new Image();
      img.onload = img.onerror = function () {
        images.push(img);
        loaded++;
        if (loaded === IMAGES.length) start();
      };
      img.src = src;
    });
  }

  function createContainer() {
    if (document.getElementById('cp-container')) return;
    container = document.createElement('div');
    container.id = 'cp-container';
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden;';
    document.body.appendChild(container);
  }

  function spawn(x, y) {
    if (images.length === 0 || particles.length >= MAX_PARTICLES) return;

    // 清理过期粒子（仅在 spawn 时做一次，减少 rAF 负担）
    particles = particles.filter(function (p) {
      if (Date.now() - p.birth > MAX_LIFETIME) {
        if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
        return false;
      }
      return true;
    });

    var img = images[Math.floor(Math.random() * images.length)];
    var size = MIN_SIZE + Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1));
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.2 + Math.random() * 0.5;
    var driftX = Math.cos(angle) * speed * 40;
    var driftY = Math.sin(angle) * speed * 50 - 20;
    var rotation = Math.random() * 360;
    var rotSpeed = (Math.random() - 0.5) * 300;
    var opacity = 0.5 + Math.random() * 0.4;

    var el = document.createElement('img');
    el.src = img.src;
    // 使用 CSS 变量传递动画参数，由浏览器合成层处理
    el.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;'
      + 'left:' + x + 'px;top:' + y + 'px;'
      + '--drift-x:' + driftX + 'px;--drift-y:' + driftY + ';'
      + '--rot-start:' + rotation + 'deg;--rot-speed:' + rotSpeed + 'deg;'
      + 'opacity:' + opacity + ';'
      + 'pointer-events:none;will-change:transform,opacity;'
      + 'animation: cpParticleFade ' + MAX_LIFETIME + 'ms linear forwards;';
    container.appendChild(el);

    particles.push({ el: el, birth: Date.now() });
  }

  // 一次性注入 CSS 动画关键帧
  if (!document.getElementById('cp-keyframes')) {
    var style = document.createElement('style');
    style.id = 'cp-keyframes';
    style.textContent = '@keyframes cpParticleFade {'
      + '0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: var(--base-opacity, 0.8); }'
      + '100% { transform: translate(calc(var(--drift-x, 0) * 0.5), calc(var(--drift-y, 0) * 0.5)) rotate(calc(var(--rot-start, 0deg) + var(--rot-speed, 0deg))) scale(0.5); opacity: 0; }'
      + '}';
    document.head.appendChild(style);
  }

  function start() {
    createContainer();

    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - lastSpawnTime < 80) return;
      lastSpawnTime = now;

      if (e.clientX === lastMouseX && e.clientY === lastMouseY) return;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      for (var i = 0; i < PARTICLES_PER_SPAWN; i++) {
        var ox = (Math.random() - 0.5) * 12;
        var oy = (Math.random() - 0.5) * 12;
        spawn(lastMouseX + ox, lastMouseY + oy);
      }
    });

    // 仅用 rAF 做清理，不再每帧更新 DOM
    function cleanup() {
      var now = Date.now();
      for (var i = 0; i < particles.length; i++) {
        if (now - particles[i].birth > MAX_LIFETIME) {
          if (particles[i].el.parentNode) particles[i].el.parentNode.removeChild(particles[i].el);
          particles.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(cleanup);
    }
    requestAnimationFrame(cleanup);
  }

  preload();
})();

