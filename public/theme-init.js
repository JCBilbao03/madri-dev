// Resolve the theme before first paint. Mirrors readStoredTheme() in src/lib/theme.ts.
(function () {
  try {
    var themeKey = 'madribuild-theme';
    var legacyKey = 'madridev-theme';
    var stored = localStorage.getItem(themeKey) || localStorage.getItem(legacyKey);
    var theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  } catch (e) {
    /* localStorage unavailable — keep the default dark class */
  }
})();
