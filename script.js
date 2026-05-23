/* ============================================================
   AMRO TABCHE — Portfolio
   Editorial interactions: nav, progress, reveals, smooth scroll
   ============================================================ */

// ---------- NAV STATE + SCROLL PROGRESS ----------
(function navAndProgress() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('progress');

  const update = () => {
    const y = window.scrollY;
    if (y > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (y / docH) * 100 : 0;
    progress.style.width = pct + '%';
  };

  let rafId = null;
  window.addEventListener('scroll', () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      update();
      rafId = null;
    });
  }, { passive: true });
  update();
})();

// ---------- MOBILE MENU ----------
(function mobileMenu() {
  const btn = document.getElementById('nav-menu');
  const links = document.querySelector('.nav__links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    links.classList.toggle('is-open');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
    });
  });
})();

// ---------- SMOOTH SCROLL FOR ANCHORS ----------
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ---------- AUTO-ADD REVEAL CLASSES + OBSERVE ----------
(function reveals() {
  // Add reveal-up class to common elements
  const selectors = [
    '.about__body p',
    '.about__facts',
    '.case__head',
    '.case__hero',
    '.case__body',
    '.case__gallery',
    '.case__tags',
    '.other-card',
    '.timeline__item',
    '.cap',
    '.edu',
    '.contact__big',
    '.contact__lead',
    '.contact__primary',
    '.contact__channels',
    '.section-head'
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('reveal-up');
      // Stagger within groups
      if (el.parentElement && (el.parentElement.classList.contains('other-work__grid') ||
          el.parentElement.classList.contains('capabilities__grid') ||
          el.parentElement.classList.contains('case__gallery'))) {
        el.style.transitionDelay = `${(i % 6) * 80}ms`;
      }
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));
})();

// ---------- HERO IMAGE PARALLAX (subtle) ----------
(function heroParallax() {
  const visual = document.querySelector('.hero__visual');
  const img = document.querySelector('.hero__image');
  if (!visual || !img) return;

  // Only on fine pointer
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let raf = null;
  let tx = 0, ty = 0, cx = 0, cy = 0;

  visual.addEventListener('mousemove', (e) => {
    const rect = visual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tx = px * 16;
    ty = py * 16;
    if (!raf) raf = requestAnimationFrame(tick);
  });
  visual.addEventListener('mouseleave', () => {
    tx = 0; ty = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  const tick = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    img.style.transform = `translate(${cx}px, ${cy}px) scale(1.04)`;
    if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };
})();

// ---------- IMAGE LAZY LOAD + GRACEFUL ERRORS ----------
(function imageErrors() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      const fig = img.closest('.case__fig, .case__hero, .hero__image-wrap, .other-card');
      if (!fig) return;
      img.style.display = 'none';
      // Replace with a placeholder block
      const ph = document.createElement('div');
      ph.style.cssText = `
        width: 100%; aspect-ratio: 16/9;
        background: var(--bg-2);
        border: 1px dashed var(--border-strong);
        border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        color: var(--text-3);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        letter-spacing: 0.06em;
      `;
      ph.textContent = 'IMAGE PLACEHOLDER';
      img.parentNode.insertBefore(ph, img);
    });
  });
})();

// ---------- ACTIVE NAV LINK BASED ON SECTION ----------
(function activeNav() {
  const links = document.querySelectorAll('.nav__links a');
  const sections = Array.from(links)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const onScroll = () => {
    const y = window.scrollY + 120;
    let activeIdx = 0;
    sections.forEach((s, i) => {
      if (s.offsetTop <= y) activeIdx = i;
    });
    links.forEach((l, i) => {
      l.classList.toggle('is-current', i === activeIdx);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Add active style for the current section
(function injectActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav__links a.is-current { color: var(--text); }
    .nav__links a.is-current::after { transform: scaleX(1); }
  `;
  document.head.appendChild(style);
})();
