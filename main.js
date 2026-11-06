/* ============================================
   main.js — Portfolio interactions & animations
   ============================================ */

/* -- Page Loader -------------------------------- */
(function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 600);
  });

  // Fallback in case load event already fired
  if (document.readyState === 'complete') {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
    }, 400);
  }
})();

/* -- Particle Canvas (Hero) --------------------- */
(function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const CONFIG = {
    count:        55,
    speed:        0.28,
    connectDist:  140,
    dotRadius:    1.5,
    colorDot:     'rgba(124, 111, 205, 0.55)',
    colorLine:    'rgba(124, 111, 205, ',
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = CONFIG.speed * (0.4 + Math.random() * 0.8);
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, randomParticle);
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    // Move
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      p.x = Math.max(0, Math.min(W, p.x));
      p.y = Math.max(0, Math.min(H, p.y));
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONFIG.connectDist) {
          const alpha = (1 - d / CONFIG.connectDist) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = CONFIG.colorLine + alpha + ')';
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.colorDot;
      ctx.fill();
    }

    animId = requestAnimationFrame(step);
  }

  // Pause when tab hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else animId = requestAnimationFrame(step);
  });

  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas);

  init();
  animId = requestAnimationFrame(step);
})();

/* -- Sticky Nav --------------------------------- */
(function initNav() {
  const nav      = document.getElementById('main-nav');
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!nav) return;

  // Scroll → add .scrolled
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link[href^="#"]');

  const ioNav = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(s => ioNav.observe(s));
})();

/* -- Scroll Reveal ------------------------------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* -- Contact Form (mailto fallback) -------------- */
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name    = form.querySelector('[name="name"]')?.value.trim()    || '';
    const email   = form.querySelector('[name="email"]')?.value.trim()   || '';
    const subject = form.querySelector('[name="subject"]')?.value.trim() || 'Portfolio Contact';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';

    const body    = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const mailto  = `mailto:ksnider@uoregon.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  });
})();

/* -- Smooth scroll for anchor buttons ----------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
