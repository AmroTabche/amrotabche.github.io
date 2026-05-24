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
      // Larger offset when jumping to a case study, since the project-nav pill bar
      // is also sticky beneath the top nav (~58px + ~50px = ~108px reserved).
      const offset = target.classList.contains('case') ? 130 : 80;
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

// ---------- PROJECT NAVIGATOR ACTIVE PILL ----------
(function projNav() {
  const pills = document.querySelectorAll('.proj-nav__pill');
  if (!pills.length) return;
  const cases = Array.from(pills)
    .map(p => document.querySelector(p.getAttribute('href')))
    .filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY + 160;
    let activeIdx = -1;
    cases.forEach((c, i) => { if (c.offsetTop <= y) activeIdx = i; });
    pills.forEach((p, i) => p.classList.toggle('is-active', i === activeIdx));

    // Auto-scroll the pill into view inside the pills container
    if (activeIdx >= 0) {
      const activePill = pills[activeIdx];
      const wrap = activePill.parentElement;
      if (wrap && wrap.scrollWidth > wrap.clientWidth) {
        const target = activePill.offsetLeft - wrap.clientWidth / 2 + activePill.clientWidth / 2;
        wrap.scrollTo({ left: target, behavior: 'smooth' });
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---------- LIGHTBOX (click-to-enlarge images) ----------
(function lightbox() {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const counterEl = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  // All clickable images on the page
  const selector = '.case__hero img, .case__fig img, .hero__image, .other-card__img img';
  const allImages = Array.from(document.querySelectorAll(selector));
  let currentIdx = 0;

  const showAt = (idx) => {
    currentIdx = (idx + allImages.length) % allImages.length;
    const img = allImages[currentIdx];
    imgEl.src = img.src;
    imgEl.alt = img.alt || '';
    // Find a caption: case__hero-cap text or case__fig figcaption
    let caption = '';
    const fig = img.closest('figure');
    if (fig) {
      const fc = fig.querySelector('figcaption');
      if (fc) caption = fc.textContent.trim();
    } else {
      const heroCap = img.closest('.hero__image-wrap')?.querySelector('.hero__image-caption');
      const caseCap = img.closest('.case__hero')?.querySelector('.case__hero-cap');
      if (heroCap) caption = heroCap.textContent.trim();
      else if (caseCap) caption = caseCap.textContent.trim();
    }
    captionEl.textContent = caption;
    counterEl.textContent = `${currentIdx + 1} / ${allImages.length}`;
  };

  const open = (idx) => {
    showAt(idx);
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    box.classList.remove('is-open');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Wire up image clicks
  allImages.forEach((img, idx) => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      open(idx);
    });
  });

  // Controls
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => showAt(currentIdx - 1));
  nextBtn.addEventListener('click', () => showAt(currentIdx + 1));

  // Click backdrop closes
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('lightbox__stage')) close();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') showAt(currentIdx - 1);
    else if (e.key === 'ArrowRight') showAt(currentIdx + 1);
  });
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
