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
