// ---------- filmstrip carousels (multi-instance, ported from the main site's project pages) ----------
(function(){
  document.querySelectorAll('.im-carousel').forEach(function(carousel){
    const track = carousel.querySelector('.im-carousel__track');
    const slides = track.querySelectorAll('.im-carousel__slide');
    const prevBtn = carousel.querySelector('.im-carousel__btn--prev');
    const nextBtn = carousel.querySelector('.im-carousel__btn--next');
    const currentEl = carousel.querySelector('.im-current');
    const totalEl = carousel.querySelector('.im-total');
    const progressBar = carousel.querySelector('.im-carousel__progress');
    const total = slides.length;
    let currentIndex = 0;
    let scrollPos = 0;
    let maxScroll = 0;
    let isHover = false;

    if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

    function calcMaxScroll(){ maxScroll = track.scrollWidth - carousel.clientWidth; }

    function getSlideOffsets(){
      const offsets = [];
      slides.forEach(function(s){ offsets.push(s.offsetLeft); });
      return offsets;
    }

    function updateCounter(){
      const offsets = getSlideOffsets();
      let closest = 0, minDist = Infinity;
      offsets.forEach(function(off, i){
        const dist = Math.abs(off - scrollPos);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      currentIndex = closest;
      if (currentEl) currentEl.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    function updateProgress(){
      calcMaxScroll();
      const pct = maxScroll > 0 ? (scrollPos / maxScroll) * 100 : 0;
      if (progressBar) progressBar.style.width = Math.min(pct, 100) + '%';
    }

    function scrollTo(pos, animate){
      calcMaxScroll();
      scrollPos = Math.max(0, Math.min(pos, maxScroll));
      if (animate !== false) {
        track.classList.remove('is-dragging');
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      }
      track.style.transform = 'translateX(' + (-scrollPos) + 'px)';
      updateCounter();
      updateProgress();
    }

    function goToSlide(index){
      if (index < 0) index = 0;
      if (index >= total) index = total - 1;
      const offsets = getSlideOffsets();
      scrollTo(offsets[index], true);
    }

    if (prevBtn) prevBtn.addEventListener('click', function(){ goToSlide(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ goToSlide(currentIndex + 1); });

    carousel.addEventListener('mouseenter', function(){ isHover = true; });
    carousel.addEventListener('mouseleave', function(){ isHover = false; });
    document.addEventListener('keydown', function(e){
      if (!isHover) return;
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    // mouse drag
    let isDragging = false, dragStartX = 0, dragStartScroll = 0;
    carousel.addEventListener('mousedown', function(e){
      isDragging = true; dragStartX = e.clientX; dragStartScroll = scrollPos;
      track.classList.add('is-dragging'); track.style.transition = 'none';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e){
      if (!isDragging) return;
      scrollTo(dragStartScroll + (dragStartX - e.clientX), false);
    });
    document.addEventListener('mouseup', function(){
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      goToSlide(currentIndex);
    });

    // touch drag
    let touchStartX = 0, touchStartScroll = 0;
    carousel.addEventListener('touchstart', function(e){
      touchStartX = e.touches[0].clientX; touchStartScroll = scrollPos;
      track.classList.add('is-dragging'); track.style.transition = 'none';
    }, { passive: true });
    carousel.addEventListener('touchmove', function(e){
      scrollTo(touchStartScroll + (touchStartX - e.touches[0].clientX), false);
    }, { passive: true });
    carousel.addEventListener('touchend', function(){
      track.classList.remove('is-dragging');
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
      goToSlide(currentIndex);
    });

    // wheel
    carousel.addEventListener('wheel', function(e){
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault(); scrollTo(scrollPos + e.deltaX, true);
      } else if (Math.abs(e.deltaY) > 0) {
        e.preventDefault(); scrollTo(scrollPos + e.deltaY, true);
      }
    }, { passive: false });

    window.addEventListener('resize', function(){ calcMaxScroll(); updateProgress(); });

    calcMaxScroll();
    updateProgress();
  });
})();

// stretch the hero "hello" watermark to fill the full hero width
(function(){
  const wm = document.getElementById('heroWatermark');
  const hero = document.querySelector('.hero');
  if(!wm || !hero) return;
  function fitWatermark(){
    wm.style.transform = 'scale(1)';
    const natural = wm.scrollWidth;
    const target = hero.clientWidth;
    if(natural > 0 && target > 0){
      wm.style.transform = 'scale(' + (target / natural) + ')';
    }
  }
  fitWatermark();
  window.addEventListener('resize', fitWatermark);
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(fitWatermark); }
})();

// progress bar
const progress = document.getElementById('progress');
function onScroll(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progress.style.width = scrolled + '%';
}
document.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); }
  });
}, {threshold:.15, rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// dot nav active state
const dotLinks = Array.from(document.querySelectorAll('#dotNav a'));
const chapters = dotLinks.map(a=>document.querySelector(a.getAttribute('href')));
const chapterIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const idx = chapters.indexOf(entry.target);
    if(entry.isIntersecting && idx>-1){
      dotLinks.forEach(a=>a.classList.remove('active'));
      dotLinks[idx].classList.add('active');
    }
  });
}, {threshold:.4});
chapters.forEach(c=>c && chapterIO.observe(c));

// animated counters
const counters = document.querySelectorAll('.stat-num');
const countIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseInt(el.dataset.count,10);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1,(now-start)/dur);
        const eased = 1 - Math.pow(1-p,3);
        el.textContent = Math.round(eased*target) + suffix;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    }
  });
}, {threshold:.6});
counters.forEach(c=>countIO.observe(c));

// build client logo wall
const logoWall = document.getElementById('logoGrid');
if(logoWall){
  const logos = [];
  for(let i=2;i<=52;i++){
    const n = String(i).padStart(2,'0');
    const ext = (i===51) ? 'gif' : 'png';
    logos.push('assets/clients/logo-partner-'+n+'.'+ext);
  }
  logos.unshift('assets/clients/logo-starbucks.png');
  logos.forEach(src=>{
    const div = document.createElement('div');
    div.className = 'plogo';
    const img = document.createElement('img');
    img.src = src; img.alt = 'Partner logo'; img.loading = 'lazy';
    div.appendChild(img);
    logoWall.appendChild(div);
  });
}

// ---------- fullscreen image lightbox ----------
(function(){
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if(!lightbox || !lightboxImg) return;

  let lastFocused = null;

  function openLightbox(src, alt){
    if(!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.addEventListener('click', (e)=>{
    // case-study gallery thumbnails: <a class="g1..g6" href="full-image.jpg">
    const galleryLink = e.target.closest('.case-gallery a');
    if(galleryLink){
      e.preventDefault();
      const img = galleryLink.querySelector('img');
      openLightbox(galleryLink.getAttribute('href'), img ? img.alt : '');
      return;
    }
    // any image explicitly marked as clickable-to-enlarge
    const img = e.target.closest('img.js-lightbox');
    if(img){
      openLightbox(img.currentSrc || img.src, img.alt);
    }
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e)=>{
    if(e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();
