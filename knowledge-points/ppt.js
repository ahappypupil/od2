/* ===== Oxford Discover 2 — 双模式引擎（平铺 + PPT切换） ===== */
(function () {
  'use strict';

  var slides = [];
  var current = 0;
  var total = 0;
  var pptMode = false;

  /* ---- 初始化 ---- */
  function init() {
    var deck = document.querySelector('.deck');
    if (!deck) return;

    slides = deck.querySelectorAll('.slide');
    total = slides.length;
    if (total === 0) return;

    buildControls();
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
  }

  /* ---- 构建所有 UI 控件 ---- */
  function buildControls() {
    /* —— 平铺模式工具栏 —— */
    var toolbar = document.createElement('div');
    toolbar.className = 'ppt-toolbar';
    toolbar.innerHTML =
      '<a class="ppt-tool-btn" href="index.html" title="返回首页">🏠</a>' +
      '<button class="ppt-tool-btn" id="pptTop" title="回到顶部">⬆</button>' +
      '<button class="ppt-tool-btn" id="pptMode" title="切换为PPT模式">📺</button>';
    document.body.appendChild(toolbar);

    document.getElementById('pptTop').addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.getElementById('pptMode').addEventListener('click', enterPPT);

    /* —— PPT 模式顶部进度条 —— */
    var prog = document.createElement('div');
    prog.className = 'ppt-progress';
    document.body.appendChild(prog);

    /* —— PPT 模式退出按钮 —— */
    var exit = document.createElement('div');
    exit.className = 'ppt-exit';
    exit.innerHTML = '🏠 退出PPT';
    exit.addEventListener('click', exitPPT);
    document.body.appendChild(exit);

    /* —— PPT 模式全屏按钮 —— */
    var fs = document.createElement('div');
    fs.className = 'ppt-fs';
    fs.innerHTML = '⛶';
    fs.title = '全屏';
    fs.addEventListener('click', toggleFullscreen);
    document.body.appendChild(fs);

    /* —— PPT 模式底部导航栏 —— */
    var nav = document.createElement('div');
    nav.className = 'ppt-nav';
    nav.innerHTML =
      '<div class="ppt-nav-btn" id="pptFirst" title="首页">⏮</div>' +
      '<div class="ppt-nav-btn" id="pptPrev" title="上一页 (←)">◀</div>' +
      '<div class="ppt-counter" id="pptCounter">1 / 1</div>' +
      '<div class="ppt-nav-btn" id="pptNext" title="下一页 (→)">▶</div>' +
      '<div class="ppt-nav-btn" id="pptLast" title="末页">⏭</div>';
    document.body.appendChild(nav);

    document.getElementById('pptFirst').addEventListener('click', function () { showSlide(0, 'prev'); });
    document.getElementById('pptPrev').addEventListener('click', goPrev);
    document.getElementById('pptNext').addEventListener('click', goNext);
    document.getElementById('pptLast').addEventListener('click', function () { showSlide(total - 1, 'next'); });

    /* —— 键盘事件 —— */
    document.addEventListener('keydown', onKey);

    /* —— 触摸滑动（仅PPT模式生效） —— */
    var touchStartX = 0;
    document.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!pptMode) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 60) {
        if (dx > 0) goPrev(); else goNext();
      }
    }, { passive: true });
  }

  /* ---- 进入 PPT 模式 ---- */
  function enterPPT() {
    pptMode = true;
    document.body.classList.add('ppt-mode');
    window.scrollTo(0, 0);
    showSlide(0, null);
  }

  /* ---- 退出 PPT 模式 ---- */
  function exitPPT() {
    pptMode = false;
    document.body.classList.remove('ppt-mode');
    // 清除所有 slide 状态类
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.remove('active', 'prev', 'next');
    }
    // 滚动到之前的位置（简化为顶部）
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateScrollProgress();
  }

  /* ---- PPT 切换核心 ---- */
  function showSlide(idx, dir) {
    if (idx < 0 || idx >= total) return;

    var oldSlide = slides[current];
    var newSlide = slides[idx];

    if (oldSlide && oldSlide !== newSlide) {
      oldSlide.classList.remove('active');
      if (dir === 'next') {
        oldSlide.classList.add('prev');
        oldSlide.classList.remove('next');
      } else if (dir === 'prev') {
        oldSlide.classList.add('next');
        oldSlide.classList.remove('prev');
      }
    }

    newSlide.classList.remove('prev', 'next');
    void newSlide.offsetHeight;
    newSlide.classList.add('active');

    current = idx;
    updatePPTUI();
  }

  function goNext() {
    if (current < total - 1) showSlide(current + 1, 'next');
  }

  function goPrev() {
    if (current > 0) showSlide(current - 1, 'prev');
  }

  /* ---- 更新 PPT 模式 UI ---- */
  function updatePPTUI() {
    var prog = document.querySelector('.ppt-progress');
    if (prog) prog.style.width = ((current + 1) / total * 100) + '%';

    var counter = document.getElementById('pptCounter');
    if (counter) counter.textContent = (current + 1) + ' / ' + total;

    var prevBtn = document.getElementById('pptPrev');
    var nextBtn = document.getElementById('pptNext');
    var firstBtn = document.getElementById('pptFirst');
    var lastBtn = document.getElementById('pptLast');
    if (prevBtn) prevBtn.disabled = (current === 0);
    if (firstBtn) firstBtn.disabled = (current === 0);
    if (nextBtn) nextBtn.disabled = (current === total - 1);
    if (lastBtn) lastBtn.disabled = (current === total - 1);
  }

  /* ---- 平铺模式滚动进度条 ---- */
  function updateScrollProgress() {
    if (pptMode) return;
    var prog = document.querySelector('.ppt-progress');
    if (!prog) return;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight * 100) : 0;
    prog.style.width = pct + '%';
  }

  /* ---- 键盘事件 ---- */
  function onKey(e) {
    if (!pptMode) {
      // 平铺模式下按 P 键进入PPT模式
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); enterPPT(); }
      return;
    }
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault(); goNext(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); goPrev(); break;
      case 'Home':
        e.preventDefault(); showSlide(0, 'prev'); break;
      case 'End':
        e.preventDefault(); showSlide(total - 1, 'next'); break;
      case 'Escape':
        exitPPT(); break;
      case 'f':
      case 'F':
        toggleFullscreen(); break;
    }
  }

  /* ---- 全屏切换 ---- */
  function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      var el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  /* ---- 启动 ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
