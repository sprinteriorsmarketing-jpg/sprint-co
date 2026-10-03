// ---------- align the wordmark's horizontal centre to the photo frame's centre ----------
(function () {
  const hero = document.querySelector('.arch-hero');
  const frame = document.querySelector('.arch-hero__frame');
  const marks = document.querySelectorAll('.arch-hero__wordmark');
  if (!hero || !frame || !marks.length) return;

  function align() {
    const heroRect = hero.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    if (!heroRect.width || !frameRect.width) return;
    const heroCenterX = heroRect.left + heroRect.width / 2;
    const frameCenterX = frameRect.left + frameRect.width / 2;
    const heroCenterY = heroRect.top + heroRect.height / 2;
    const frameCenterY = frameRect.top + frameRect.height / 2;
    const shiftX = frameCenterX - heroCenterX;
    const shiftY = frameCenterY - heroCenterY;
    marks.forEach(function (m) { m.style.transform = 'translate(' + shiftX + 'px, ' + shiftY + 'px)'; });
  }

  window.addEventListener('resize', align);
  window.addEventListener('load', align);
  document.addEventListener('sprintco:hero-settled', function () { setTimeout(align, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
  align();
})();

// ---------- preloader + intro sequence ----------
(function () {
  const preloader = document.getElementById('preloader');
  const pctEl = document.getElementById('preloaderPct');
  const blinds = document.getElementById('preloaderBlinds');
  const introWord = document.getElementById('introWord');
  const introLetters = document.getElementById('introWordLetters');
  const body = document.body;
  if (!preloader || !introWord) return;

  // build blinds bars
  const BAR_COUNT = 14;
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('span');
    bar.style.transitionDelay = (i * 22) + 'ms';
    blinds.appendChild(bar);
  }

  // build solo wordmark letters: SPRINT (ink) + CO (accent)
  const WORD = 'SPRINTCO';
  const ACCENT_FROM = 6; // "CO" accented, matches the hero wordmark treatment
  WORD.split('').forEach(function (ch, i) {
    const span = document.createElement('span');
    span.className = 'il' + (i >= ACCENT_FROM ? ' accent' : '');
    span.textContent = ch;
    introLetters.appendChild(span);
  });
  const letterEls = introLetters.querySelectorAll('.il');

  const PCT_DURATION = 1100;
  const HOLD_AFTER_100 = 550;
  const WIPE_DURATION = 600;
  const LETTER_STAGGER = 55;
  const WORD_HOLD = 850;

  function countUp() {
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / PCT_DURATION);
      const eased = 1 - Math.pow(1 - p, 2);
      pctEl.textContent = Math.round(eased * 100);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        pctEl.textContent = '100';
        preloader.classList.add('is-ready');
        setTimeout(wipeOut, HOLD_AFTER_100);
      }
    }
    requestAnimationFrame(tick);
  }

  function wipeOut() {
    preloader.classList.add('is-wiping');
    setTimeout(function () {
      preloader.classList.add('is-hiding');
      body.classList.remove('is-preloading');
      body.classList.add('intro-active');
      revealWord();
    }, WIPE_DURATION);
  }

  function revealWord() {
    letterEls.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, i * LETTER_STAGGER);
    });
    const totalDraw = letterEls.length * LETTER_STAGGER + 500;
    setTimeout(settleHero, totalDraw + WORD_HOLD);
  }

  function settleHero() {
    body.classList.remove('intro-active');
    body.classList.add('hero-settled');
    document.dispatchEvent(new CustomEvent('sprintco:hero-settled'));
    setTimeout(function () {
      if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 700);
  }

  // safety net: never trap a visitor behind the preloader
  setTimeout(function () {
    if (body.classList.contains('is-preloading') || body.classList.contains('intro-active')) {
      pctEl.textContent = '100';
      wipeOut();
    }
  }, 6000);

  countUp();
})();

// ---------- hero: auto-cycling featured photo with FIG counter + progress bar ----------
(function () {
  const photo = document.getElementById('heroPhoto');
  const figCurrent = document.getElementById('heroFigCurrent');
  const figTotal = document.getElementById('heroFigTotal');
  const progressBar = document.getElementById('heroProgressBar');
  const pauseBtn = document.getElementById('heroFigPause');
  if (!photo || !progressBar) return;

  const slides = [
    { src: 'assets/nest/nest-1.png', alt: 'Nest Hotel — arched stone facade at twilight' },
    { src: 'assets/villa-chennai/villa-chennai-1.png', alt: 'Villa Chennai — exterior at dusk' },
    { src: 'assets/mg/mg-3.jpg', alt: 'MG — Emgee Greens clubhouse, exterior view' },
    { src: 'assets/r-bungalow/r-bungalow-pavilion-2.png', alt: 'R Bungalow — Porous Pavilion concept, night view' },
    { src: 'assets/mukesh-rathi/rathi-1.jpg', alt: 'Rathi Residence — living room with carved jali screen wall' },
    { src: 'assets/casa-palma/casa-palma-1.png', alt: 'Casa Palma — Mediterranean villa exterior' },
    { src: 'assets/bhatia-villa/bhatia-villa-1.png', alt: 'Bhatia Villa — cubist white-stucco facade with navy entry canopy' },
    { src: 'assets/reddy-villa/reddy-villa-1.png', alt: 'Reddy Villa — front elevation with carport, among palms' }
  ];

  const DURATION = 4800;
  let index = 0;
  let paused = false;
  let start = performance.now();
  let raf = null;

  if (figTotal) figTotal.textContent = String(slides.length).padStart(2, '0');

  function setSlide(i) {
    index = (i + slides.length) % slides.length;
    photo.style.opacity = '0';
    setTimeout(function () {
      photo.src = slides[index].src;
      photo.alt = slides[index].alt;
      photo.style.opacity = '1';
    }, 180);
    if (figCurrent) figCurrent.textContent = String(index + 1).padStart(2, '0');
  }

  function tick(now) {
    if (paused) { raf = requestAnimationFrame(tick); return; }
    const elapsed = now - start;
    const pct = Math.min(elapsed / DURATION, 1);
    progressBar.style.width = (pct * 100) + '%';
    if (pct >= 1) {
      setSlide(index + 1);
      start = now;
    }
    raf = requestAnimationFrame(tick);
  }

  function begin() {
    setSlide(0);
    start = performance.now();
    raf = requestAnimationFrame(tick);
  }
  if (document.body.classList.contains('hero-settled')) {
    begin();
  } else {
    document.addEventListener('sprintco:hero-settled', begin, { once: true });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      pauseBtn.style.opacity = paused ? '.5' : '1';
      if (!paused) start = performance.now() - (parseFloat(progressBar.style.width || '0') / 100) * DURATION;
    });
  }
})();
