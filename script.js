document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Shared light and dark theme toggle
const themeToggle = document.querySelector('.theme-toggle');
const applyTheme = theme => {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    const dark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    const label = themeToggle.querySelector('span');
    if (label) label.textContent = `${dark ? 'Light' : 'Dark'} mode`;
  }
};
const savedTheme = localStorage.getItem('3point-theme');
applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('3point-theme', nextTheme);
    applyTheme(nextTheme);
  });
}

// Mobile menu
const burger = document.querySelector('.burger'), nav = document.getElementById('nav');
if (burger && nav) {
  const setMenuOpen = open => {
    burger.classList.toggle('active', open);
    nav.classList.toggle('active', open);
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('active'));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('active')) {
      setMenuOpen(false);
      burger.focus();
    }
  });
}

// Keep the navigation state in sync with the current page and visible section.
if (nav) {
  const navLinks = Array.from(nav.querySelectorAll('a[href]')).filter(link => !link.classList.contains('btn'));
  const normalizePath = pathname => {
    const path = pathname.replace(/\/+$/, '') || '/';
    return path === '/' ? '/index.html' : `${path.replace(/\.html$/i, '')}.html`;
  };
  const currentUrl = new URL(window.location.href);
  const currentPath = normalizePath(currentUrl.pathname);
  const links = navLinks.map(link => ({ link, url: new URL(link.href, currentUrl) }));
  const samePageLinks = links.filter(({ url }) =>
    url.origin === currentUrl.origin && normalizePath(url.pathname) === currentPath
  );
  const setActiveLink = activeLink => {
    navLinks.forEach(link => {
      const active = link === activeLink;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  const hashLink = samePageLinks.find(({ url }) => url.hash && url.hash === currentUrl.hash);
  const currentPageLink = samePageLinks.find(({ url }) => !url.hash)
    || samePageLinks.find(({ url }) => url.hash === '#top')
    || samePageLinks[0];
  setActiveLink((hashLink || currentPageLink || {}).link);

  if ('IntersectionObserver' in window) {
    const sections = new Map();
    samePageLinks.forEach(({ link, url }) => {
      if (!url.hash) return;
      const target = url.hash === '#top' ? document.querySelector('.hero') : document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target && !sections.has(target)) sections.set(target, link);
    });
    const visibleSections = new Set();
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const currentSection = Array.from(visibleSections).sort((a, b) =>
        Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.3)
        - Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.3)
      )[0];
      if (currentSection) setActiveLink(sections.get(currentSection));
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    sections.forEach((link, section) => sectionObserver.observe(section));
  }
}

// Scroll reveal + stat counters
const count = el => {
  const end = +el.dataset.count; if (reduce) return;
  let t0; const step = t => { t0 = t0 || t; const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * p); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
};
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
  const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); } }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => io2.observe(el));
} else {
  document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
}

// Portfolio filter
const btns = document.querySelectorAll('.filters button'), projs = document.querySelectorAll('.proj');
btns.forEach(b => b.addEventListener('click', () => {
  btns.forEach(x => x.classList.remove('on')); b.classList.add('on');
  projs.forEach(p => p.classList.toggle('hide', b.dataset.f !== 'all' && p.dataset.cat !== b.dataset.f));
}));

// Contact form validation
const form = document.getElementById('form'), ok = document.getElementById('ok');
const rules = {
  name: v => v.trim().length >= 2 || 'Enter your name.',
  phone: v => /^[+\d][\d\s-]{8,}$/.test(v.trim()) || 'Enter a valid phone number, e.g. +254 712 345 678.',
  projectType: v => v !== '' || 'Select the type of website you need.',
  budget: v => v !== '' || 'Select a budget or choose “I’m not sure”.',
  timeline: v => v !== '' || 'Select your preferred timeframe.',
  msg: v => v.trim().length >= 10 || 'Tell us a little about your project (at least 10 characters).'
};
if (form && ok) {
  form.addEventListener('submit', e => {
    let valid = true; ok.hidden = true;
    Object.keys(rules).forEach(id => {
      const f = document.getElementById(id), msg = form.querySelector(`[data-for="${id}"]`);
      if (!f || !msg) return;
      const r = rules[id](f.value);
      msg.textContent = r === true ? '' : r; f.classList.toggle('bad', r !== true); if (r !== true) valid = false;
    });
    if (!valid) {
      e.preventDefault();
      form.querySelector('.bad')?.focus();
    }
  });
}

// Social media quote message prefill
const socialQuote = document.getElementById('social-quote');
const socialMessage = document.getElementById('msg');
if (socialQuote && socialMessage) {
  socialQuote.addEventListener('click', () => {
    socialMessage.value = "I'm interested in social media management for my business.";
  });
}

// Coffee support form; this does not contact Safaricom.
const supportForm = document.getElementById('support-form');
if (supportForm) {
  const amountCards = Array.from(supportForm.querySelectorAll('.support-amount'));
  const customField = supportForm.querySelector('.support-custom');
  const customInput = document.getElementById('support-custom-amount');
  const errorMessage = document.getElementById('support-error');
  const statusMessage = document.getElementById('support-status');
  let selectedAmount = null;

  amountCards.forEach(card => card.addEventListener('click', () => {
    const isCustom = card.dataset.amount === 'custom';
    amountCards.forEach(item => item.setAttribute('aria-pressed', String(item === card)));
    customField.hidden = !isCustom;
    customInput.disabled = !isCustom;
    customInput.required = isCustom;
    selectedAmount = isCustom ? null : Number(card.dataset.amount);
    errorMessage.hidden = true;
    statusMessage.hidden = true;
    if (isCustom) customInput.focus();
  }));

  supportForm.addEventListener('submit', event => {
    event.preventDefault();
    errorMessage.hidden = true;
    statusMessage.hidden = true;

    if (selectedAmount === null) {
      errorMessage.textContent = 'Choose a coffee amount to continue.';
      errorMessage.hidden = false;
      return;
    }

    if (customInput.required && (!Number.isInteger(Number(customInput.value)) || Number(customInput.value) < 10)) {
      customInput.setCustomValidity('Enter a whole amount of at least KSh 10.');
      customInput.reportValidity();
      return;
    }
    customInput.setCustomValidity('');

    statusMessage.textContent = 'M-Pesa payments are not connected yet. No prompt was sent and no payment was made.';
    statusMessage.hidden = false;
  });

  customInput.addEventListener('input', () => customInput.setCustomValidity(''));
}

const backTop = document.querySelector('.back-top');
if (backTop) {
  backTop.addEventListener('click', event => {
    event.preventDefault();
    const root = document.documentElement;
    const scrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    root.style.scrollBehavior = scrollBehavior;
  });
}
