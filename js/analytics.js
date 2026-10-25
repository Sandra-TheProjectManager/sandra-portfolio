/* Optional GA4 and Clarity. Neither analytics vendor loads before consent. */
(function () {
  'use strict';
  if (window.sandraAnalyticsInstalled) return;
  window.sandraAnalyticsInstalled = true;
  var id = 'G-LENWZ6VY9Z', key = 'sandra-analytics-consent-v2';
  var active = false, started = false, lastFocus = null;
  var clarityStarted = false, clarityActive = false;
  window['ga-disable-' + id] = true;
  var projects = ['tolaram-sfa', 'frutta-secondary-sales-dashboard', 'frutta-smart-seller', 'sap-projects-readwrite', 'mplify-sfa', 'helpapp-africa', 'girl-power-foundation', 'munch-it-brand-activation'];
  var paths = ['/', '/about/', '/contact/', '/privacy/', '/work/', '/work-with-me/'].concat(projects.map(function (p) { return '/work/' + p + '/'; }));
  var live = location.hostname === 'sandraaibangbee.com' || location.hostname === 'www.sandraaibangbee.com';
  function pagePath(value) { return paths.indexOf(value) >= 0 ? value : '/404.html'; }
  function project(value) { return projects.indexOf(value) >= 0 ? value : null; }
  function saved() {
    try {
      var c = JSON.parse(localStorage.getItem(key));
      if (c && c.expires > Date.now()) return c.choice;
      // Previous GA-only permission does not silently authorise session recording.
      var previous = JSON.parse(localStorage.getItem('sandra-analytics-consent-v1'));
      if (previous && previous.expires > Date.now() && previous.choice === 'denied') {
        localStorage.setItem(key, JSON.stringify(previous));
        return 'denied';
      }
      return null;
    } catch (e) { return null; }
  }
  function remember(choice) {
    try {
      var value = JSON.stringify({choice: choice, expires: Date.now() + 180 * 86400000});
      localStorage.setItem(key, value);
      // Notify already-open GA-only tabs too, so withdrawal is not lost on upgrade.
      localStorage.setItem('sandra-analytics-consent-v1', value);
    } catch (e) { /* No storage: ask again next page. */ }
  }
  function gtag() { window.dataLayer.push(arguments); }
  function event(name, params) {
    if (active) gtag('event', name, params || {});
    if (clarityActive) {
      if (params && project(params.project_id)) window.clarity('set', 'project_id', params.project_id);
      window.clarity('event', name);
    }
  }
  function projectView(slug, presentation) { if (project(slug)) event('project_view', {project_id: slug, presentation: presentation}); }
  function safeClarityUrl(value) {
    try {
      var url = new URL(value, location.origin);
      if (url.origin !== location.origin) return !url.search && !url.hash && /^https?:$/.test(url.protocol);
      var publicAsset = /^\/assets\/(?:images\/[a-z0-9\/-]+\.(?:jpg|png|svg)|video\/munchit-event\.mp4|Sandra-Aibangbee-Resume\.pdf)$/.test(url.pathname);
      if (paths.indexOf(url.pathname) < 0 && url.pathname !== '/404.html' && !publicAsset) return false;
      var safe = true;
      url.searchParams.forEach(function (value, name) {
        if (name === 'category' && ['all','crm-sfa','reporting','non-profit','operations','product','events'].indexOf(value) >= 0) return;
        if (name === 'intro' && value === '') return;
        safe = false;
      });
      if (url.hash && (!document.getElementById || !document.getElementById(decodeURIComponent(url.hash.slice(1))))) safe = false;
      return safe;
    } catch (e) { return false; }
  }
  function stopClarity() {
    if (!clarityStarted) return;
    clarityActive = false;
    window.clarity('stop');
  }
  function startClarity() {
    if (clarityStarted || !safeClarityUrl(location.href || location.pathname)) return;
    if (document.referrer && !safeClarityUrl(document.referrer)) return;
    if (document.referrer) {
      try {
        var referral = new URL(document.referrer);
        // The SDK records referrers itself: omit full external referral paths too.
        if (referral.origin !== location.origin && referral.pathname !== '/') return;
      } catch (e) { return; }
    }
    clarityStarted = true;
    clarityActive = true;
    // Explicit root masking also covers dynamically inserted project-reader content.
    document.documentElement.setAttribute('data-clarity-mask', 'true');
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    // The SDK is entirely absent until acceptance; do not restart it with a
    // redundant initial denial before passing the visitor's actual decision.
    window.clarity('consentv2', {analytics_Storage: 'granted', ad_Storage: 'denied'});
    // Expose only the SDK's effective consent states for verification, never its IDs.
    window.clarity('metadata', function (ignored, upgraded, consent) {
      if (!consent) return;
      ['analytics_storage','ad_storage'].forEach(function (type) {
        var state = String(consent[type] || consent[type.replace('_storage','_Storage')] || '').toLowerCase();
        if (state === 'granted' || state === 'denied') document.documentElement.setAttribute('data-clarity-' + type.replace('_','-'), state);
      });
    }, false, true, true);
    var slug = project(location.pathname.split('/')[2]);
    if (slug) window.clarity('set', 'project_id', slug);
    // Guard URL changes before the SDK sees them. Preserve method context/return values.
    ['pushState','replaceState'].forEach(function (method) {
      if (!window.history || typeof window.history[method] !== 'function') return;
      var original = window.history[method];
      window.history[method] = function () {
        if (arguments[2] != null && !safeClarityUrl(String(arguments[2]))) stopClarity();
        return original.apply(this, arguments);
      };
    });
    ['popstate','hashchange'].forEach(function (type) {
      window.addEventListener(type, function () { if (!safeClarityUrl(location.href)) stopClarity(); }, true);
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/z352inaqh8';
    script.referrerPolicy = 'origin';
    document.head.appendChild(script);
  }
  function start() {
    if (!live || navigator.globalPrivacyControl === true) return;
    active = true;
    window['ga-disable-' + id] = false;
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;
    gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    gtag('consent', 'update', {analytics_storage: 'granted'});
    gtag('js', new Date());
    var referrer = '';
    try { var ref = new URL(document.referrer); if (/^https?:$/.test(ref.protocol)) referrer = ref.origin + '/'; } catch (e) {}
    // One automatic page_view per document. Never send a second manual page_view.
    // Only allow known public paths; never send query strings, hashes or arbitrary titles.
    gtag('config', id, {
      page_location: 'https://sandraaibangbee.com' + pagePath(location.pathname),
      page_title: pagePath(location.pathname), page_referrer: referrer,
      allow_google_signals: false, allow_ad_personalization_signals: false,
      allow_enhanced_conversions: false, user_data: {},
      cookie_expires: 15552000, cookie_flags: 'SameSite=Lax;Secure'
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    script.referrerPolicy = 'strict-origin';
    document.head.appendChild(script);
    projectView(location.pathname.split('/')[2], 'page');
    var opened = document.querySelector('[data-project-reader][open]');
    if (opened) projectView(opened.getAttribute('data-project-reader'), 'details');
    startClarity();
  }
  function clearCookies() {
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (!/^(?:_ga(?:_|$)|_clck$|_clsk$)/.test(name)) return;
      ['', location.hostname, '.sandraaibangbee.com'].forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax; Secure' + (domain ? '; domain=' + domain : '');
      });
    });
  }
  function choose(choice) {
    remember(choice);
    if (choice === 'granted') start();
    else {
      var wasStarted = started;
      active = false;
      window['ga-disable-' + id] = true;
      if (clarityStarted) {
        window.clarity('consentv2', {analytics_Storage: 'denied', ad_Storage: 'denied'});
        stopClarity();
      }
      if (wasStarted) gtag('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
      // Denial alone permits cookieless Clarity collection: stop, then unload both SDKs.
      clearCookies();
      if (wasStarted) location.reload();
    }
    panel.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  var panel;
  function init() {
    panel = document.createElement('section');
    panel.className = 'analytics-consent';
    panel.setAttribute('aria-label', 'Analytics privacy choices');
    panel.innerHTML = '<p><strong>Optional analytics</strong><br>With your permission, Google Analytics measures visits and Microsoft Clarity records masked browsing sessions, clicks and scrolling to improve this portfolio. This includes approximate location, device and referral information. No advertising consent. Your choice lasts 180 days.</p><p><a href="/privacy/">Privacy details</a></p><div><button type="button" data-analytics-choice="granted">Accept analytics</button><button type="button" data-analytics-choice="denied">Decline analytics</button></div>';
    document.body.appendChild(panel);
    panel.querySelectorAll('[data-analytics-choice]').forEach(function (button) {
      button.addEventListener('click', function () { choose(button.getAttribute('data-analytics-choice')); });
    });
    var settings = document.createElement('button');
    settings.type = 'button'; settings.className = 'analytics-settings'; settings.textContent = 'Analytics privacy';
    settings.addEventListener('click', function () { lastFocus = settings; panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector('button').focus(); });
    var footer = document.querySelector('.site-footer .container') || document.querySelector('footer') || document.body;
    footer.appendChild(settings);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { panel.hidden = true; if (lastFocus) lastFocus.focus(); } });
    var choice = saved();
    if (navigator.globalPrivacyControl === true) { choice = 'denied'; clearCookies(); panel.querySelector('[data-analytics-choice="granted"]').disabled = true; panel.querySelector('p').textContent = 'Global Privacy Control is enabled. Optional analytics is disabled.'; }
    panel.hidden = choice === 'granted' || choice === 'denied';
    if (choice === 'granted') start();
  }
  // Capture only fixed labels and allowlisted slugs/paths, never text, email addresses,
  // form values, search terms, mailto URLs or the LinkedIn profile URL.
  document.addEventListener('click', function (e) {
    var target = e.target.closest && e.target.closest('a,button,summary');
    if (!target || !active) return;
    if (target.matches('[data-skip-intro]')) { event('intro_skip', {method: 'button'}); return; }
    if (target.matches('summary')) {
      var entry = target.closest('[data-project-reader]');
      if (entry) { projectView(entry.getAttribute('data-project-reader'), 'details'); return; }
    }
    if (target.matches('[data-video-open]')) { event('project_cta_click', {project_id: 'munch-it-brand-activation', action: 'watch_video'}); return; }
    if (target.matches('[data-copy]')) { event('contact_click', {method: 'copy_email'}); return; }
    var raw = target.getAttribute('href');
    if (!raw) return;
    if (/^(mailto:|tel:)/i.test(raw)) { event('contact_click', {method: /^mailto:/i.test(raw) ? 'email' : 'telephone'}); return; }
    var url;
    try { url = new URL(raw, location.origin); } catch (err) { return; }
    // GA4 Enhanced Measurement owns file_download and outbound click (LinkedIn,
    // project websites). Do not emit competing custom download/outbound events.
    if (url.origin !== location.origin || /\.pdf$/i.test(url.pathname)) return;
    var card = target.closest('[data-project]');
    var slug = card && project(card.getAttribute('data-project'));
    if (slug && target.matches('[data-gallery-item]')) { event('project_cta_click', {project_id: slug, action: 'view_image'}); return; }
    var destination = pagePath(url.pathname);
    if (destination === '/404.html') return;
    if (destination === '/contact/') event('contact_click', {method: 'contact_page'});
    else if (url.pathname !== location.pathname) event('portfolio_navigation', {destination: destination});
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.documentElement.classList.contains('splash')) event('intro_skip', {method: 'escape'}); }, true);
  // Clarity text masking does not redact click destinations. Do not record contact URLs
  // or arbitrary query-bearing destinations; GA keeps its fixed-label contact event.
  document.addEventListener('click', function (e) {
    if (!clarityActive) return;
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (/^(mailto:|tel:)/i.test(href) || !safeClarityUrl(href)) stopClarity();
  }, true);
  window.addEventListener('storage', function (e) {
    if (e.key !== key) return;
    active = false;
    window['ga-disable-' + id] = true;
    if (clarityStarted) {
      window.clarity('consentv2', {analytics_Storage: 'denied', ad_Storage: 'denied'});
      stopClarity();
    }
    location.reload();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
