/* Sandra Aibangbee — Portfolio
   Progressive enhancement only: every page is complete and usable without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js', 'ready');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
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

  /* ---------- Career roadmap: place "today" (months since Jan 2020, axis ends Dec 2026) ---------- */
  function initRoadmap() {
    var now = new Date();
    var months = Math.min(84, (now.getFullYear() - 2020) * 12 + now.getMonth() + 1);
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

  /* ---------- Site roadmap: remember which main pages this visitor has seen (their browser only)
     and point "Next stop" at the next unseen page; once all are seen, point to Contact. ---------- */
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
    var next = map.querySelector('.site-roadmap-next');
    var start = order.indexOf(here);
    var target = null;
    for (var i = 1; i < order.length; i++) {
      var p = order[(start + i) % order.length];
      if (seen.indexOf(p) === -1) { target = p; break; }
    }
    if (kicker) kicker.textContent = target ? 'You’ve explored ' + count + ' of ' + order.length + ' pages' : 'You’ve seen every page. Thank you for looking around';
    if (!next) return;
    if (!target) target = here === '/contact/' ? '/' : '/contact/';
    var link = map.querySelector('.site-roadmap-steps a[href="' + target + '"]');
    next.setAttribute('href', target);
    next.querySelector('strong').textContent = link.textContent;
    next.querySelector('small').textContent = count === order.length && target === '/contact/' ? 'You’ve seen it all. Let’s talk' : link.getAttribute('data-teaser');
  }


})();
