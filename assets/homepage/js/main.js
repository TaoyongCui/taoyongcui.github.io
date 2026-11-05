(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-navigation');
  const links = [...nav.querySelectorAll('a')];
  const closeMenu = () => {
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const wasOpen = header.classList.contains('menu-open');
      closeMenu();
      if (wasOpen) toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });
  if ('IntersectionObserver' in window) {
    const visibleSections = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibleSections.set(entry.target.id, entry));
      const active = [...visibleSections.values()]
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!active) return;
      links.forEach(link => {
        const selected = link.hash === '#' + active.target.id;
        link.classList.toggle('active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin: '-105px 0px -55% 0px', threshold: 0});
    links.forEach(link => {
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }
})();

(() => {
  'use strict';
  const cacheLifetime = 60 * 60 * 1000;
  document.querySelectorAll('[data-github-repo]').forEach(async badge => {
    const repo = badge.dataset.githubRepo;
    const counter = badge.querySelector('.github-stars-count');
    if (!counter || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return;
    const cacheKey = 'homepage-github-stars:' + repo;
    const display = count => {
      if (!Number.isSafeInteger(count) || count < 0) return;
      const formatted = new Intl.NumberFormat('en-US').format(count);
      counter.textContent = formatted;
      badge.setAttribute('aria-label', repo + ' on GitHub: ' + formatted + ' stars');
    };
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Number.isSafeInteger(cached.count) &&
          cached.count >= 0 && Date.now() - cached.timestamp < cacheLifetime) {
        display(cached.count);
        return;
      }
    } catch {}
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch('https://api.github.com/repos/' + repo, {
        headers: {Accept: 'application/vnd.github+json'},
        signal: controller.signal
      });
      if (!response.ok) return;
      const data = await response.json();
      if (!Number.isSafeInteger(data.stargazers_count) || data.stargazers_count < 0) return;
      display(data.stargazers_count);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          count: data.stargazers_count, timestamp: Date.now()
        }));
      } catch {}
    } catch {
      // The count already rendered in the page remains available offline.
    } finally {
      clearTimeout(timeout);
    }
  });
})();
