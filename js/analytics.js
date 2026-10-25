/* Optional GA4. No Google request, cookie or event until analytics consent. */
(function () {
  'use strict';
  if (window.sandraAnalyticsInstalled) return;
  window.sandraAnalyticsInstalled = true;
  var id = 'G-LENWZ6VY9Z', key = 'sandra-analytics-consent-v1';
  var active = false, started = false, lastFocus = null;
  window['ga-disable-' + id] = true;
  var projects = ['tolaram-sfa', 'frutta-secondary-sales-dashboard', 'frutta-smart-seller', 'sap-projects-readwrite', 'mplify-sfa', 'helpapp-africa', 'girl-power-foundation', 'munch-it-brand-activation'];
  var paths = ['/', '/about/', '/contact/', '/privacy/', '/work/', '/work-with-me/'].concat(projects.map(function (p) { return '/work/' + p + '/'; }));
  var live = location.hostname === 'sandraaibangbee.com' || location.hostname === 'www.sandraaibangbee.com';
  function pagePath(value) { return paths.indexOf(value) >= 0 ? value : '/404.html'; }
  function project(value) { return projects.indexOf(value) >= 0 ? value : null; }
  function saved() {
    try { var c = JSON.parse(localStorage.getItem(key)); return c && c.expires > Date.now() ? c.choice : null; } catch (e) { return null; }
  }
  function remember(choice) {
    try { localStorage.setItem(key, JSON.stringify({choice: choice, expires: Date.now() + 180 * 86400000})); } catch (e) { /* No storage: ask again next page. */ }
  }
  function gtag() { window.dataLayer.push(arguments); }
  function event(name, params) { if (active) gtag('event', name, params || {}); }
  function projectView(slug, presentation) { if (project(slug)) event('project_view', {project_id: slug, presentation: presentation}); }
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
  }
  function clearCookies() {
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
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
      if (wasStarted) gtag('consent', 'update', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
      // Disable collection before clearing cookies; reload unloads all Google listeners.
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
    panel.innerHTML = '<p><strong>Optional analytics</strong><br>With your permission, Google Analytics measures visits and use of this portfolio, including approximate location, device and referral source. No advertising features. Your choice lasts 180 days.</p><p><a href="/privacy/">Privacy details</a></p><div><button type="button" data-analytics-choice="granted">Accept analytics</button><button type="button" data-analytics-choice="denied">Decline analytics</button></div>';
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
    if (navigator.globalPrivacyControl === true) { choice = 'denied'; panel.querySelector('[data-analytics-choice="granted"]').disabled = true; panel.querySelector('p').textContent = 'Global Privacy Control is enabled. Optional analytics is disabled.'; }
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
  window.addEventListener('storage', function (e) { if (e.key === key) location.reload(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
