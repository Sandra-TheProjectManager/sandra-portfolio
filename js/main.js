/* Sandra Aibangbee — Portfolio
   Progressive enhancement only: every page is complete and usable without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js', 'ready');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initTicket();
    initMobileNav();
    initHeaderShadow();
    initReveal();
    initFilters();
    initStepper();
    initGallery();
    initVideoModal();
    initProjectReader();
    initMediaPlayers();
    initCopyEmail();
    initSliders();
    initExpandAll();
    initRoadmap();
    initToolbox();
    initSiteRoadmap();
    initCountUp();
    initMessBoard();
    initAnimateOnce();
    initDeliveryBar();
    initPmApp();
    initWatClock();
    initCommandPalette();

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  });

  /* ---------- Mobile navigation ---------- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-header')) setOpen(false);
    });
    var desktop = window.matchMedia('(min-width: 901px)');
    var onChange = function () { if (desktop.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Header border once the page scrolls ---------- */
  function initHeaderShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var update = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Fade sections in as they scroll into view ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    var showAll = function () {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-visible');
    };
    if (reduceMotion || !('IntersectionObserver' in window)) { showAll(); return; }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    for (var i = 0; i < items.length; i++) observer.observe(items[i]);

    // Backup for the observer: reveal anything on (or above) the screen after load,
    // anchor jumps and scrolling, so content can never stay hidden.
    var pending = false;
    var revealOnScreen = function () {
      pending = false;
      var limit = window.innerHeight;
      for (var j = 0; j < items.length; j++) {
        var el = items[j];
        if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top < limit) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      }
    };
    var schedule = function () {
      if (!pending) { pending = true; window.requestAnimationFrame(revealOnScreen); }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    window.addEventListener('load', revealOnScreen);
    revealOnScreen();
    window.addEventListener('beforeprint', showAll);
  }

  /* ---------- Filterable project collection ---------- */
  function initFilters() {
    var bar = document.querySelector('[data-filters]');
    var grid = document.querySelector('[data-filter-grid]');
    if (!bar || !grid) return;
    var buttons = bar.querySelectorAll('[data-filter]');
    var cards = grid.querySelectorAll('[data-category]');
    var count = bar.querySelector('.filter-count');
    bar.hidden = false;

    function apply(filter, updateUrl) {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = card.getAttribute('data-category').split(/\s+/);
        var match = filter === 'all' || cats.indexOf(filter) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === filter)); });
      if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
      grid.querySelectorAll('[data-col-count]').forEach(function (n) {
        n.textContent = n.closest('.kanban-col').querySelectorAll('[data-category]:not([hidden])').length;
      });
      if (updateUrl && window.history && history.replaceState) {
        var url = new URL(window.location.href);
        if (filter === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', filter);
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter'), true); });
    });
    // deep link: /work/?category=crm-sfa
    var match = /[?&]category=([a-z-]+)/.exec(location.search);
    var start = 'all';
    if (match) buttons.forEach(function (b) { if (b.getAttribute('data-filter') === match[1]) start = match[1]; });
    apply(start, false);
  }

  /* ---------- Process stepper (tabs) ---------- */
  function initStepper() {
    document.querySelectorAll('[data-stepper]').forEach(function (wrap) {
      var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));
      var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
      if (!tabs.length) return;

      function select(i, focus) {
        tabs.forEach(function (t, j) {
          var on = i === j;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          if (panels[j]) panels[j].hidden = !on;
        });
        if (focus) tabs[i].focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(i, false); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, n = tabs.length, next = null;
          if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % n;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + n) % n;
          else if (k === 'Home') next = 0;
          else if (k === 'End') next = n - 1;
          if (next !== null) { e.preventDefault(); select(next, true); }
        });
      });
      // Panels act as tab panels only once JS is running.
      panels.forEach(function (p, j) {
        if (!p) return;
        p.setAttribute('role', 'tabpanel');
        p.setAttribute('aria-labelledby', tabs[j].id);
        p.tabIndex = 0;
      });
      select(0, false);
    });
  }

  /* ---------- Screenshot gallery + lightbox ---------- */
  function initGallery() {
    var galleries = document.querySelectorAll('[data-gallery]');
    if (!galleries.length || typeof HTMLDialogElement !== 'function') return;

    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML =
      '<button type="button" class="lb-btn lb-close" aria-label="Close image viewer">' +
        '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
      '<figure class="lb-figure">' +
        '<img alt="">' +
        '<div class="lb-bar">' +
          '<figcaption class="lb-caption"></figcaption>' +
          '<div class="lb-nav">' +
            '<span class="lb-count" aria-live="polite"></span>' +
            '<button type="button" class="lb-btn lb-prev" aria-label="Previous image"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>' +
            '<button type="button" class="lb-btn lb-next" aria-label="Next image"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>' +
          '</div>' +
        '</div>' +
      '</figure>';
    document.body.appendChild(dialog);

    var img = dialog.querySelector('img');
    var cap = dialog.querySelector('.lb-caption');
    var counter = dialog.querySelector('.lb-count');
    var prev = dialog.querySelector('.lb-prev');
    var next = dialog.querySelector('.lb-next');
    var items = [], index = 0, opener = null;

    function show(i) {
      index = i;
      var it = items[i];
      img.src = it.href;
      img.alt = it.alt;
      cap.textContent = it.caption;
      counter.textContent = (i + 1) + ' of ' + items.length;
      prev.disabled = i === 0;
      next.disabled = i === items.length - 1;
      var single = items.length < 2;
      prev.hidden = single; next.hidden = single; counter.hidden = single;
    }
    function open(list, i, trigger) {
      items = list; opener = trigger;
      show(i);
      dialog.showModal();
    }
    dialog.querySelector('.lb-close').addEventListener('click', function () { dialog.close(); });
    prev.addEventListener('click', function () { if (index > 0) show(index - 1); });
    next.addEventListener('click', function () { if (index < items.length - 1) show(index + 1); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight' && index < items.length - 1) { e.preventDefault(); show(index + 1); }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); }); // backdrop
    dialog.addEventListener('close', function () { if (opener) opener.focus(); });

    // swipe on touch screens
    var x0 = null;
    img.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      x0 = e.clientX;
      if (img.setPointerCapture) img.setPointerCapture(e.pointerId);
    });
    img.addEventListener('pointercancel', function () { x0 = null; });
    img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    img.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      if (dx < 0 && index < items.length - 1) show(index + 1);
      if (dx > 0 && index > 0) show(index - 1);
    });

    galleries.forEach(function (g) {
      var links = Array.prototype.slice.call(g.querySelectorAll('[data-gallery-item]'));
      var list = [], indices = [];
      links.forEach(function (a) {
        var href = a.getAttribute('href');
        var index = list.findIndex(function (item) { return item.href === href; });
        if (index === -1) { index = list.length; list.push({ href: href, alt: a.getAttribute('data-alt') || '', caption: a.getAttribute('data-caption') || '' }); }
        indices.push(index);
      });
      links.forEach(function (a, i) {
        a.addEventListener('click', function (e) { e.preventDefault(); open(list, indices[i], a); });
      });
    });
  }

  /* ---------- One readable project-details experience; native details fallback ---------- */
  function initProjectReader() {
    var modal = document.getElementById('project-reader-modal');
    var entries = document.querySelectorAll('[data-project-reader]');
    if (!modal || !entries.length || typeof modal.showModal !== 'function') return;
    var close = modal.querySelector('[data-project-reader-close]');
    var title = modal.querySelector('#project-reader-title');
    var body = modal.querySelector('[data-project-reader-body]');
    var opener = null;
    if (!close || !title || !body) return;
    entries.forEach(function (entry) {
      var trigger = entry.querySelector('summary');
      var source = entry.querySelector('.project-details-source');
      if (!trigger || !source) return;
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'project-reader-modal');
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        entry.open = false;
        opener = trigger;
        title.textContent = entry.getAttribute('data-project-title');
        body.innerHTML = source.innerHTML;
        modal.showModal();
        modal.scrollTop = 0;
        close.focus();
      });
    });
    function shut() { modal.close(); }
    close.addEventListener('click', shut);
    modal.addEventListener('cancel', function (event) { event.preventDefault(); shut(); });
    modal.addEventListener('click', function (event) { if (event.target === modal) shut(); });
    modal.addEventListener('close', function () {
      body.querySelectorAll('video').forEach(function (video) { video.pause(); });
      body.innerHTML = '';
      if (opener) opener.focus();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) body.querySelectorAll('video').forEach(function (video) { video.pause(); });
    });
  }

  /* ---------- Project video: initiated only by a visitor action ---------- */
  function initVideoModal() {
    var modal = document.getElementById('project-video-modal');
    var triggers = document.querySelectorAll('[data-video-open]');
    if (!modal || !triggers.length || typeof modal.showModal !== 'function') return;
    var video = modal.querySelector('.video-modal-player');
    var close = modal.querySelector('[data-video-close]');
    var status = modal.querySelector('.video-modal-status');
    var opener = null;
    if (!video || !close) return;
    function shut() { modal.close(); }
    triggers.forEach(function (trigger) {
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'project-video-modal');
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        opener = trigger;
        document.querySelectorAll('video[data-media-player]').forEach(function (other) { if (other !== video) other.pause(); });
        if (status) status.textContent = '';
        try { video.currentTime = 0; } catch (error) {}
        if (!modal.open) modal.showModal();
        close.focus();
        try {
          var play = video.play();
          if (play && play.catch) play.catch(function () { if (status && modal.open) status.textContent = 'Press Play in the video controls to start playback.'; });
        } catch (error) { if (status) status.textContent = 'Press Play in the video controls to start playback.'; }
      });
    });
    close.addEventListener('click', shut);
    modal.addEventListener('cancel', function (event) { event.preventDefault(); shut(); });
    modal.addEventListener('click', function (event) { if (event.target === modal) shut(); });
    modal.addEventListener('close', function () {
      video.pause();
      if (opener) opener.focus();
    });
  }

  /* ---------- Click-to-play native video, no autoplay ---------- */
  function initMediaPlayers() {
    var videos = document.querySelectorAll('video[data-media-player]');
    videos.forEach(function (video) {
      var status = document.getElementById(video.getAttribute('aria-describedby'));
      video.addEventListener('play', function () {
        videos.forEach(function (other) { if (other !== video) other.pause(); });
        if (status) status.textContent = '';
      });
      video.addEventListener('error', function () {
        if (status) status.textContent = 'This video could not load. Use the video link below to open the file directly.';
      });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) videos.forEach(function (video) { video.pause(); });
    });
  }

  /* ---------- Copy email with confirmation ---------- */
  function initCopyEmail() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      var text = btn.getAttribute('data-copy');
      var status = document.getElementById(btn.getAttribute('aria-describedby') || '') ||
                   (btn.parentElement && btn.parentElement.parentElement && btn.parentElement.parentElement.querySelector('.copy-status'));
      var label = btn.querySelector('.label-text');
      var timer = null;

      function done(ok) {
        btn.classList.toggle('is-copied', ok);
        if (label) label.textContent = ok ? 'Copied' : 'Copy';
        if (status) status.textContent = ok ? 'Email address copied to your clipboard.' : 'Couldn’t copy automatically — please select the address above.';
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-copied');
          if (label) label.textContent = 'Copy';
          if (status) status.textContent = '';
        }, 2600);
      }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        btn.focus();
        done(ok);
      }
      btn.addEventListener('click', function () {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
        } else {
          fallback();
        }
      });
    });
  }

  /* ---------- Testimonial slider (scroll-snap + buttons) ---------- */
  function initSliders() {
    document.querySelectorAll('[data-slider]').forEach(function (slider) {
      var track = slider.querySelector('.slider-track');
      var controls = slider.querySelector('.slider-controls');
      var prev = slider.querySelector('[data-slide="prev"]');
      var next = slider.querySelector('[data-slide="next"]');
      var position = slider.querySelector('[data-slide-position]');
      var slides = track ? track.querySelectorAll('.slide') : [];
      if (!track || slides.length < 2) return;
      if (controls) controls.hidden = false;

      function step() { return slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0); }
      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
        if (position) position.textContent = (Math.min(slides.length, Math.round(track.scrollLeft / step()) + 1)) + ' / ' + slides.length;
      }
      prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
      next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
      track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); track.scrollBy({ left: e.key === 'Home' ? -track.scrollLeft : track.scrollWidth, behavior: reduceMotion ? 'auto' : 'smooth' }); }
      });
      window.addEventListener('resize', update);
      update();
    });
  }

  /* ---------- Experience: expand / collapse all ---------- */
  function initExpandAll() {
    document.querySelectorAll('[data-expand-all]').forEach(function (bar) {
      var list = document.getElementById(bar.getAttribute('data-expand-all'));
      if (!list) return;
      var items = list.querySelectorAll('details');
      bar.hidden = false;
      bar.querySelector('[data-expand="open"]').addEventListener('click', function () { items.forEach(function (d) { d.open = true; }); });
      bar.querySelector('[data-expand="close"]').addEventListener('click', function () { items.forEach(function (d) { d.open = false; }); });
    });
  }

  /* ---------- Career roadmap: place "today" (months since Jan 2018, axis ends Dec 2026) ---------- */
  function initRoadmap() {
    var now = new Date();
    var months = Math.min(108, (now.getFullYear() - 2018) * 12 + now.getMonth() + 1);
    document.querySelectorAll('[data-roadmap]').forEach(function (map) { map.style.setProperty('--now', months); });
  }

  /* ---------- Toolbox: chips can be dragged around (mouse and pen only, so touch still scrolls) ---------- */
  function initToolbox() {
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('[data-toolbox] .tool').forEach(function (chip) {
      var x = 0, y = 0, startX = 0, startY = 0;
      chip.classList.add('is-draggable');
      chip.addEventListener('pointerdown', function (e) {
        chip.setPointerCapture(e.pointerId);
        startX = e.clientX - x; startY = e.clientY - y;
        chip.classList.add('is-dragging');
      });
      chip.addEventListener('pointermove', function (e) {
        if (!chip.classList.contains('is-dragging')) return;
        x = e.clientX - startX; y = e.clientY - startY;
        chip.style.setProperty('--dx', x + 'px');
        chip.style.setProperty('--dy', y + 'px');
      });
      var drop = function () { chip.classList.remove('is-dragging'); };
      chip.addEventListener('pointerup', drop);
      chip.addEventListener('pointercancel', drop);
    });
  }

  /* ---------- Site roadmap: tick off the main pages this visitor has seen (their browser only).
     "Next stop" stays in page order, as written in the markup. ---------- */
  function initSiteRoadmap() {
    var order = ['/', '/work/', '/about/', '/work-with-me/', '/contact/'];
    var here = location.pathname.indexOf('/work/') === 0 ? '/work/' : location.pathname;
    var seen = [];
    try { seen = JSON.parse(localStorage.getItem('sa-pages-seen') || '[]'); } catch (e) { seen = []; }
    if (order.indexOf(here) !== -1 && seen.indexOf(here) === -1) seen.push(here);
    try { localStorage.setItem('sa-pages-seen', JSON.stringify(seen)); } catch (e) { /* private mode: still works for this page */ }

    var map = document.querySelector('[data-site-roadmap]');
    if (!map) return;
    var links = map.querySelectorAll('.site-roadmap-steps a');
    links.forEach(function (a) {
      var li = a.parentNode;
      if (!li.classList.contains('is-current')) li.classList.toggle('is-done', seen.indexOf(a.getAttribute('href')) !== -1);
    });
    var count = order.filter(function (p) { return seen.indexOf(p) !== -1; }).length;
    var kicker = map.querySelector('[data-roadmap-kicker]');
    if (kicker) kicker.textContent = count === order.length ? 'You’ve seen every page. Thank you for looking around' : 'You’ve explored ' + count + ' of ' + order.length + ' pages';
  }

  /* ---------- By the numbers: count up once when the strip scrolls into view ---------- */
  function initCountUp() {
    var strip = document.querySelector('[data-count-up]');
    if (!strip || reduceMotion || !('IntersectionObserver' in window)) return;
    var nums = strip.querySelectorAll('[data-count]');
    nums.forEach(function (n) { n.textContent = '0'; });
    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      var start = null;
      var tick = function (t) {
        if (start === null) start = t;
        var p = Math.min(1, (t - start) / 1400);
        var eased = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (n) { n.textContent = String(Math.round(eased * Number(n.getAttribute('data-count')))); });
        if (p < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(strip);
  }

  /* ---------- Hero: the messy notes sort themselves into See · Plan · Do · Review.
     The markup ships sorted, so no-JS and reduced-motion visitors see the finished board. ---------- */
  function initMessBoard() {
    var board = document.querySelector('[data-mess-board]');
    if (!board) return;
    var button = board.querySelector('[data-mess-toggle]');
    var touched = false;
    var set = function (sorted) {
      board.classList.toggle('is-sorted', sorted);
      button.firstChild.textContent = sorted ? 'Mess it up again' : 'Sort it out';
      button.lastChild.textContent = sorted ? '↺' : '▸';
    };
    button.addEventListener('click', function () {
      touched = true;
      set(!board.classList.contains('is-sorted'));
    });
    if (reduceMotion) return;
    board.classList.add('is-instant');
    set(false);
    void board.offsetWidth;
    board.classList.remove('is-instant');
    // Sort once the board is on screen, so visitors further down the page still see it happen.
    var sortSoon = function () { window.setTimeout(function () { if (!touched) set(true); }, 1400); };
    if (!('IntersectionObserver' in window)) { sortSoon(); return; }
    var watcher = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      watcher.disconnect();
      sortSoon();
    }, { threshold: 0.6 });
    watcher.observe(board);
  }

  /* ---------- Play an entrance once when an element scrolls into view ([data-animate-once] → .is-in) ---------- */
  function initAnimateOnce() {
    var items = document.querySelectorAll('[data-animate-once]');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        watcher.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    items.forEach(function (el) { el.classList.add('is-waiting'); watcher.observe(el); });
  }

  /* ---------- Home: a project progress bar that follows the scroll, with a milestone per section ---------- */
  function initDeliveryBar() {
    var bar = document.querySelector('[data-delivery-bar]');
    if (!bar) return;
    var fill = bar.querySelector('.delivery-bar-fill');
    var marks = bar.querySelector('.delivery-bar-marks');
    var label = bar.querySelector('.delivery-bar-label');
    var sections = Array.prototype.filter.call(document.querySelectorAll('main > section[aria-labelledby]'), function (s) { return !s.classList.contains('hero'); });
    var points = [];
    var layout = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      marks.innerHTML = '';
      points = sections.map(function (s) {
        var at = Math.min(1, Math.max(0, (s.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6) / max));
        var mark = document.createElement('i');
        mark.style.left = (at * 100) + '%';
        marks.appendChild(mark);
        return { at: at, mark: mark };
      });
      update();
    };
    var update = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = 'scaleX(' + p + ')';
      label.textContent = Math.round(p * 100) + '% delivered';
      bar.classList.toggle('is-active', window.scrollY > 40);
      points.forEach(function (pt) { pt.mark.classList.toggle('is-done', p >= pt.at); });
    };
    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () { pending = false; update(); });
    }, { passive: true });
    window.addEventListener('resize', layout);
    window.addEventListener('load', layout);
    layout();
  }

  /* ---------- Hero "Project: Sandra" app: runs a small project from To do to Delivered.
     The markup ships finished, so no-JS and reduced-motion visitors see the delivered board. ---------- */
  function initPmApp() {
    var app = document.querySelector('[data-pm-app]');
    if (!app) return;
    var rerun = app.querySelector('[data-pm-rerun]');
    if (reduceMotion) { rerun.hidden = true; return; }
    var cards = Array.prototype.slice.call(app.querySelectorAll('[data-pm-card]'));
    var pct = app.querySelector('[data-pm-pct]');
    var status = app.querySelector('[data-pm-status]');
    var toasts = app.querySelector('[data-pm-toasts]');
    var messages = ["Stakeholders mapped ✓","Requirements signed off ✓","To-be process agreed ✓","UAT passed ✓","Go-live approved ✓","Adoption on track ✓"];
    var timers = [];
    var later = function (fn, ms) { timers.push(window.setTimeout(fn, ms)); };
    // Lay out a column: cards stack in the order they arrived.
    var place = function () {
      var rows = [0, 0, 0];
      cards.forEach(function (card) {
        var col = Number(card.style.getPropertyValue('--col'));
        card.style.setProperty('--row', rows[col]++);
      });
    };
    var set = function (card, col) { card.style.setProperty('--col', col); cards.push(cards.splice(cards.indexOf(card), 1)[0]); place(); };
    var progress = function (done, moving) {
      var value = Math.round((done + moving * 0.5) / 6 * 100);
      pct.textContent = value + '%';
      app.style.setProperty('--pct', value);
    };
    var toast = function (text) {
      var t = document.createElement('p');
      t.className = 'pm-toast';
      t.textContent = text;
      toasts.appendChild(t);
      later(function () { t.classList.add('is-leaving'); }, 1700);
      later(function () { t.remove(); }, 2200);
    };
    var run = function (delay) {
      delay = typeof delay === 'number' ? delay : 0;
      timers.forEach(window.clearTimeout); timers = [];
      toasts.innerHTML = '';
      app.classList.remove('is-done');
      app.classList.add('is-running');
      var order = Array.prototype.slice.call(app.querySelectorAll('[data-pm-card]'));
      cards = order.slice();
      cards.forEach(function (c) { c.style.setProperty('--col', 0); });
      place();
      progress(0, 0);
      status.textContent = 'Sprint in progress';
      var t = 700 + delay, done = 0;
      order.forEach(function (card, i) {
        later(function () { set(card, 1); progress(done, 1); }, t);
        t += 650;
        later(function () { set(card, 2); done++; progress(done, 0); toast(messages[i]); }, t);
        t += 520;
      });
      later(function () {
        status.textContent = 'All tasks delivered';
        app.classList.remove('is-running');
        app.classList.add('is-done');
      }, t + 200);
    };
    rerun.addEventListener('click', function () { run(0); });
    // Start once the hero is settled (after the opening intro, if it runs).
    // Reset to To do straight away; during the opening intro, wait for it to lift before moving cards.
    run(document.documentElement.classList.contains('splash') ? 4500 : 0);
  }

  /* ---------- Status bar clock (Lagos, WAT) ---------- */
  function initWatClock() {
    var clock = document.querySelector('[data-wat-clock]');
    if (!clock) return;
    var tick = function () {
      try {
        clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(new Date()) + ' WAT';
      } catch (e) { clock.textContent = 'WAT'; }
    };
    var schedule = function () { tick(); window.setTimeout(schedule, 30000); };
    schedule();
  }

  /* ---------- Command palette: Ctrl/⌘ + K, or the status bar button ---------- */
  function initCommandPalette() {
    var dialog = document.querySelector('[data-cmd]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var input = dialog.querySelector('[data-cmd-input]');
    var links = Array.prototype.slice.call(dialog.querySelectorAll('[data-cmd-list] a'));
    var visible = function () { return links.filter(function (a) { return !a.parentNode.hidden; }); };
    var active = 0;
    var mark = function (i) {
      var list = visible();
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (!list.length) return;
      active = (i + list.length) % list.length;
      list[active].classList.add('is-active');
      list[active].scrollIntoView({ block: 'nearest' });
    };
    var open = function () {
      if (dialog.open) return;
      input.value = '';
      links.forEach(function (a) { a.parentNode.hidden = false; });
      dialog.showModal();
      mark(0);
      input.focus();
    };
    document.querySelectorAll('[data-cmd-open]').forEach(function (b) { b.addEventListener('click', open); });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); open(); }
    });
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      links.forEach(function (a) { a.parentNode.hidden = q && a.textContent.toLowerCase().indexOf(q) === -1; });
      mark(0);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(active + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); mark(active - 1); }
      if (e.key === 'Enter') { var list = visible(); if (list[active]) { e.preventDefault(); list[active].click(); } }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* ---------- Raise a ticket: posts to FormSubmit (delivered to Sandra's inbox), then files the ticket ---------- */
  function initTicket() {
    var form = document.querySelector('[data-ticket]');
    if (!form || !window.fetch) return;
    var id = 'PRJ-' + String(100 + Math.floor(Math.random() * 900));
    var idEl = form.querySelector('[data-ticket-id]');
    var status = form.querySelector('[data-ticket-status]');
    var label = form.querySelector('[data-ticket-label]');
    var msg = form.querySelector('[data-ticket-msg]');
    var slot = document.querySelector('[data-ticket-slot]');
    idEl.textContent = id;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('is-sending') || form.classList.contains('is-sent')) return;
      if (!form.checkValidity()) {
        var missing = [];
        if (!form.elements.name.value.trim()) missing.push('your name');
        if (!form.elements.email.validity.valid) missing.push(form.elements.email.value ? 'a valid email' : 'your email');
        if (!form.elements.message.value.trim()) missing.push('a message');
        msg.textContent = 'Almost there: please add ' + missing.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.';
        var first = form.querySelector(':invalid');
        if (first) first.focus();
        return;
      }
      var data = new FormData(form);
      if (data.get('_honey')) {
        status.textContent = 'Not sent';
        msg.textContent = 'Your ticket was not sent because the spam check was filled. Please reload the page and enter your details manually, or email aibangbeesandra1@gmail.com.';
        return;
      }
      data.set('_subject', 'New ' + data.get('type') + ' ticket (' + data.get('priority') + ') from your portfolio · ' + id);
      data.set('_template', 'table');
      data.set('ticket', id);
      data.set('_autoresponse', 'Hi ' + (String(data.get('name')).split(' ')[0] || 'there') + ', thanks for raising ticket ' + id + ' on sandraaibangbee.com. It has been received and I will reply within 24 hours. Sandra Aibangbee');
      form.classList.add('is-sending');
      form.setAttribute('aria-busy', 'true');
      form.querySelector('[type=submit]').disabled = true;
      status.textContent = 'Submitting…';
      label.textContent = 'Submitting…';
      msg.textContent = 'Sending your ticket. Please wait for confirmation.';
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      var timeout = setTimeout(function () { if (controller) controller.abort(); }, 20000);
      fetch(form.action, { method: 'POST', body: data, signal: controller ? controller.signal : undefined, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || 'failed'); }); })
        .then(function () {
          clearTimeout(timeout);
          form.classList.remove('is-sending');
          form.setAttribute('aria-busy', 'false');
          form.classList.add('is-sent');
          status.textContent = 'Received';
          label.textContent = 'Ticket submitted';
          form.querySelectorAll('input, textarea, button').forEach(function (el) { el.disabled = true; });
          slot.innerHTML = '<b>' + id + '</b><span>' + String(data.get('type')) + ' · ' + String(data.get('priority')) + '</span><i>Assigned: Sandra ✓</i>';
          slot.classList.add('is-filled');
          msg.classList.add('is-success');
          msg.textContent = 'Ticket sent! Your reference is ' + id + '. Thank you, ' + (String(data.get('name')).split(' ')[0] || 'friend') + '. I will reply to ' + String(data.get('email')) + ' within 24 hours.';
          form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        })
        .catch(function () {
          clearTimeout(timeout);
          form.classList.remove('is-sending');
          form.setAttribute('aria-busy', 'false');
          form.querySelector('[type=submit]').disabled = false;
          status.textContent = 'Not sent';
          label.textContent = 'Submit ticket';
          msg.innerHTML = 'That didn’t go through. Please email me at <a href="mailto:aibangbeesandra1@gmail.com">aibangbeesandra1@gmail.com</a>.';
        });
    });
  }


})();

