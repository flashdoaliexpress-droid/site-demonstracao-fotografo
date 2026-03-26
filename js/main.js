/* ============================================
   LUCAS MEIRA — PHOTOGRAPHER SITE
   main.js
   ============================================ */

'use strict';

// ── NAV SCROLL STATE ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── HAMBURGER MENU ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── REVEAL ON SCROLL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let idx = 0;
      siblings.forEach((el, j) => { if (el === entry.target) idx = j; });
      entry.target.style.transitionDelay = `${idx * 80}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── TESTIMONIALS SLIDER ──
const track = document.getElementById('testimonialsTrack');
const dots  = document.querySelectorAll('.tdot');
let currentSlide = 0;
let autoSlideTimer;

function goToSlide(idx) {
  currentSlide = idx;
  track.style.transform = `translateX(calc(-${idx * 100}% - ${idx * 24}px))`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearTimeout(autoSlideTimer);
    goToSlide(parseInt(dot.dataset.idx));
    scheduleAutoSlide();
  });
});

function scheduleAutoSlide() {
  autoSlideTimer = setTimeout(() => {
    goToSlide((currentSlide + 1) % dots.length);
    scheduleAutoSlide();
  }, 5000);
}
scheduleAutoSlide();

// ── CONTACT FORM (demo) ──
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type=submit]');
  const btnText = btn.querySelector('.btn-text');
  const btnArrow = btn.querySelector('.btn-arrow');

  btn.disabled = true;
  btnText.textContent = 'Enviando...';
  btnArrow.textContent = '';

  setTimeout(() => {
    btnText.textContent = 'Mensagem enviada!';
    btnArrow.textContent = '';
    btn.style.background = '#1a7a3a';
    form.reset();
    setTimeout(() => {
      btnText.textContent = 'Enviar mensagem';
      btnArrow.textContent = '→';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1400);
});

// ══════════════════════════════════════════════
// ── HERO SCROLL-SCRUBBING VIDEO ──
// Requer servidor com Range requests (execution/servir_site.py).
// ══════════════════════════════════════════════

(function initScrollScrub() {
  // Desktop only — mobile uses initMobileCameraPin below
  if (window.innerWidth <= 768) return;

  const heroPinWrap = document.getElementById('heroPinWrap');
  const video       = document.getElementById('cameraVideo');
  const loader      = document.getElementById('cameraLoader');
  const scrollHint  = document.getElementById('scrollHint');

  if (!heroPinWrap || !video) return;

  // Pixels de scroll por segundo de vídeo (aumente para mais lento)
  const PX_PER_SECOND = 350;

  // Barra de progresso
  const progressBar = document.createElement('div');
  progressBar.className = 'hero-progress-bar';
  document.getElementById('hero').appendChild(progressBar);

  let isReady = false;

  // ── Setup: chamado quando a duração está disponível ──
  function setup() {
    const dur = video.duration;
    if (!isFinite(dur) || dur <= 0 || isReady) return;

    isReady = true;
    const scrubPx = dur * PX_PER_SECOND;
    heroPinWrap.style.height = `${window.innerHeight + scrubPx}px`;

    // Desbloqueia seek em browsers que exigem play() primeiro
    video.play().then(() => {
      video.pause();
      video.currentTime = 0;
    }).catch(() => {
      // Autoplay bloqueado — seek ainda deve funcionar
      video.currentTime = 0;
    });

    loader.classList.add('hidden');
    scrollHint.classList.add('visible');
  }

  // Ouve todos os eventos que indicam que a duração está pronta
  ['loadedmetadata', 'loadeddata', 'canplay'].forEach(evt => {
    video.addEventListener(evt, setup, { once: true });
  });

  // Verifica se já carregou (cache)
  if (video.readyState >= 1) setup();

  // Último recurso: tenta novamente após 1s
  setTimeout(() => { if (!isReady) setup(); }, 1000);

  // Resize: recalcula altura do wrapper
  window.addEventListener('resize', () => {
    if (!isReady || !isFinite(video.duration)) return;
    heroPinWrap.style.height = `${window.innerHeight + video.duration * PX_PER_SECOND}px`;
  }, { passive: true });

  // ── Scroll handler ──
  window.addEventListener('scroll', () => {
    if (!isReady) return;

    // offsetTop: posição do wrapper no documento (sem depender de getBoundingClientRect)
    const pinTop     = heroPinWrap.offsetTop;
    const scrubPx    = heroPinWrap.offsetHeight - window.innerHeight;
    const scrolled   = Math.max(0, window.scrollY - pinTop);
    const progress   = Math.min(scrolled / scrubPx, 1);

    video.currentTime = progress * video.duration;
    progressBar.style.width = `${progress * 100}%`;
    scrollHint.classList.toggle('visible', scrolled < 8);
  }, { passive: true });
})();

// ── MOBILE CAMERA PIN ──
// When the camera section enters the viewport on mobile:
//   1. Lock scroll (body fixed)
//   2. Auto-play the video
//   3. Unlock scroll when video ends
(function initMobileCameraPin() {
  if (window.innerWidth > 768) return;

  const section = document.getElementById('cameraMobPin');
  const video   = document.getElementById('cameraVideoMob');
  const bar     = document.getElementById('cameraMobBar');

  if (!section || !video) return;

  let locked = false;
  let savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${savedScrollY}px`;
    document.body.style.width    = '100%';
    locked = true;
  }

  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, savedScrollY);
    locked = false;
  }

  // Progress bar while playing
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    bar.style.width = `${(video.currentTime / video.duration) * 100}%`;
  });

  // Unlock when video finishes
  video.addEventListener('ended', () => {
    unlockScroll();
    // Scroll past the section so it doesn't re-trigger
    window.scrollTo({ top: section.offsetTop + section.offsetHeight + 1, behavior: 'instant' });
  });

  // Observe section entering viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !locked) {
        lockScroll();
        video.currentTime = 0;
        bar.style.width = '0%';
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay blocked — show tap-to-play overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;';
            overlay.innerHTML = '<div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.15);border:2px solid rgba(255,255,255,0.5);display:flex;align-items:center;justify-content:center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>';
            section.appendChild(overlay);
            overlay.addEventListener('click', () => {
              video.play();
              overlay.remove();
            }, { once: true });
          });
        }
      }
    });
  }, { threshold: 0.6 });

  observer.observe(section);
})();
