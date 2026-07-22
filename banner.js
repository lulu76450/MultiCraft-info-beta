/* ── MultiCraft Info — Alert Banner Loader ── */
(function () {
  'use strict';

  /**
   * Parse banner.md content.
   * Expected format:
   *   ---
   *   isDisplayed: oui|non
   *   ---
   *
   *   **fr:** Message en français
   *   **en:** English message
   */
  function parseBanner(raw) {
    var result = { isDisplayed: false, fr: '', en: '' };

    // Extract frontmatter between first two ---
    var fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fmMatch) {
      var fm = fmMatch[1];
      var displayedMatch = fm.match(/isDisplayed\s*:\s*(\S+)/i);
      if (displayedMatch) {
        result.isDisplayed = displayedMatch[1].trim().toLowerCase() === 'oui';
      }
    }

    // Extract **fr:** and **en:** lines
    var frMatch = raw.match(/\*\*fr:\*\*\s*(.+)/i);
    var enMatch = raw.match(/\*\*en:\*\*\s*(.+)/i);
    if (frMatch) result.fr = frMatch[1].trim();
    if (enMatch) result.en = enMatch[1].trim();

    return result;
  }

  function updateBanner(data) {
    var banner = document.getElementById('alert-banner');
    if (!banner) return;

    if (!data.isDisplayed) {
      banner.classList.remove('visible');
      return;
    }

    var lang = (window.i18n && window.i18n.lang) || 'fr';
    var msg = lang === 'en' ? data.en : data.fr;

    banner.textContent = msg;
    banner.classList.add('visible');
  }

  function loadBanner() {
    fetch('banner.md?_=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('banner.md not found');
        return res.text();
      })
      .then(function (raw) {
        var data = parseBanner(raw);
        updateBanner(data);

        // Re-apply the correct language when the user switches
        document.addEventListener('langchange', function () {
          updateBanner(data);
        });
      })
      .catch(function (err) {
        // Silently fail — banner simply stays hidden
        console.warn('[banner.js]', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBanner);
  } else {
    loadBanner();
  }
})();
