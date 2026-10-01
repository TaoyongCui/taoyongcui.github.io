(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var header = document.querySelector('[data-site-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var themeToggle = document.querySelector('[data-theme-toggle]');
  var navigation = document.getElementById('site-navigation');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  function closeMenu() {
    body.classList.remove('nav-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#0e1715' : '#f6f7f3');
    }
    try {
      localStorage.setItem('taoyong-theme', theme);
    } catch (error) {
      // The chosen theme still applies when storage is unavailable.
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      var isOpen = body.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (navigation) {
    navigation.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 820) closeMenu();
  });

  if (themeToggle) {
    setTheme(root.dataset.theme || 'light');
    themeToggle.addEventListener('click', function () {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  var newsScroll = document.querySelector('[data-news-scroll]');
  if (newsScroll) {
    var newsTimeline = newsScroll.querySelector('.timeline');
    var visibleNews = Array.prototype.slice.call(newsTimeline.children, 0, 6);

    function sizeNewsScroll() {
      if (!visibleNews.length) return;
      var height = visibleNews[visibleNews.length - 1].getBoundingClientRect().bottom -
        newsTimeline.getBoundingClientRect().top;
      newsScroll.style.setProperty('--news-visible-height', Math.ceil(height + 2) + 'px');
    }

    sizeNewsScroll();
    window.addEventListener('resize', sizeNewsScroll);
    if (document.fonts) document.fonts.ready.then(sizeNewsScroll);
  }

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav a[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

        if (!visible.length) return;
        var activeId = '#' + visible[0].target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === activeId);
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.01, 0.25, 0.5] }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }
})();
