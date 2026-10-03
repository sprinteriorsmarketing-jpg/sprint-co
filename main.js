/**
 * FlatPackCo — Main JavaScript
 * Features: sticky header, mobile nav, scroll animations,
 *           testimonials slider, FAQ accordion, counter animation
 */

(function () {
    'use strict';

    /* ─────────────────────────────────────────
       STICKY HEADER — adds .scrolled class
    ───────────────────────────────────────── */
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        const onScroll = () => {
            siteHeader.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ─────────────────────────────────────────
       MOBILE NAVIGATION TOGGLE
    ───────────────────────────────────────── */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const primaryNav   = document.querySelector('.primary-nav');

    if (mobileToggle && primaryNav) {
        // Inject close button into nav on first open
        let closeBtn = null;

        mobileToggle.addEventListener('click', () => {
            const isOpen = primaryNav.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';

            if (isOpen && !closeBtn) {
                closeBtn = document.createElement('span');
                closeBtn.className = 'mobile-close-btn';
                closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                closeBtn.addEventListener('click', closeNav);
                primaryNav.prepend(closeBtn);
            }
        });

        function closeNav() {
            primaryNav.classList.remove('mobile-open');
            mobileToggle.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (primaryNav.classList.contains('mobile-open') &&
                !primaryNav.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                closeNav();
            }
        });

        // Mobile dropdown toggles
        const navItems = primaryNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.nav-dropdown');
            if (link && dropdown) {
                link.addEventListener('click', (e) => {
                    if (primaryNav.classList.contains('mobile-open')) {
                        e.preventDefault();
                        item.classList.toggle('open');
                    }
                });
            }
        });

        // Close nav when a final link is clicked
        primaryNav.querySelectorAll('a:not(.nav-link)').forEach(a => {
            a.addEventListener('click', closeNav);
        });
    }

    /* ─────────────────────────────────────────
       SCROLL ANIMATIONS — IntersectionObserver
    ───────────────────────────────────────── */
    const animEls = document.querySelectorAll('.fade-up, .fade-in');
    if (animEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        animEls.forEach(el => observer.observe(el));
    }

    /* ─────────────────────────────────────────
       COUNTER ANIMATION — stat numbers
    ───────────────────────────────────────── */
    function animateCounter(el, target, duration, suffix) {
        const start     = performance.now();
        const startVal  = 0;

        const step = (now) => {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current  = Math.round(startVal + ease * (target - startVal));
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (statNumbers.length) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el     = entry.target;
                    const target = parseInt(el.getAttribute('data-count'), 10);
                    const suffix = el.getAttribute('data-suffix') || '';
                    animateCounter(el, target, 1600, suffix);
                    statsObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => statsObserver.observe(el));
    }

    /* ─────────────────────────────────────────
       TESTIMONIALS SLIDER
    ───────────────────────────────────────── */
    const sliderTrack = document.querySelector('.testimonials-track');
    if (sliderTrack) {
        const cards   = sliderTrack.querySelectorAll('.testimonial-card');
        const prevBtn = document.querySelector('.slider-btn.prev');
        const nextBtn = document.querySelector('.slider-btn.next');
        const dots    = document.querySelectorAll('.slider-dot');
        let current   = 0;
        let autoTimer = null;

        function getVisibleCount() {
            if (window.innerWidth <= 576) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        }

        function maxIndex() {
            return Math.max(0, cards.length - getVisibleCount());
        }

        function goTo(index) {
            current = Math.max(0, Math.min(index, maxIndex()));
            const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
            sliderTrack.style.transform = `translateX(-${current * cardWidth}px)`;

            // Update dots
            dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        }

        function nextSlide() { goTo(current < maxIndex() ? current + 1 : 0); }
        function prevSlide() { goTo(current > 0 ? current - 1 : maxIndex()); }

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAuto(); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => { goTo(i); resetAuto(); });
        });

        function startAuto() {
            autoTimer = setInterval(nextSlide, 5000);
        }
        function resetAuto() {
            clearInterval(autoTimer);
            startAuto();
        }

        startAuto();
        window.addEventListener('resize', () => goTo(0));

        // Touch/swipe support
        let touchStartX = 0;
        sliderTrack.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        sliderTrack.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); resetAuto(); }
        });
    }

    /* ─────────────────────────────────────────
       FAQ ACCORDION
    ───────────────────────────────────────── */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                // Close all others
                faqItems.forEach(i => i.classList.remove('open'));
                // Toggle current
                if (!isOpen) item.classList.add('open');
            });
        }
    });

    /* ─────────────────────────────────────────
       SCOPE OF WORK ACCORDION
    ───────────────────────────────────────── */
    document.querySelectorAll('.scope-acc-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('open');
        });
    });

    /* ─────────────────────────────────────────
       PORTFOLIO FILTER
    ───────────────────────────────────────── */
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item[data-category]');

    if (filterBtns.length && portfolioItems.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                portfolioItems.forEach(item => {
                    const cat = item.getAttribute('data-category');
                    const show = filter === 'all' || cat === filter;
                    item.style.display = show ? '' : 'none';
                });
            });
        });
    }

    /* ─────────────────────────────────────────
       PRODUCT GALLERY — thumbnail swap & lightbox
    ───────────────────────────────────────── */
    const gallery = document.querySelector('.product-gallery');
    if (gallery) {
        const mainImg   = gallery.querySelector('.product-main-img img');
        const thumbs    = gallery.querySelectorAll('.product-thumb');
        const allSrcs   = [];

        if (mainImg) allSrcs.push(mainImg.src);
        thumbs.forEach(function (thumb) {
            var img = thumb.querySelector('img');
            if (img) allSrcs.push(img.src);
        });

        var currentLightboxIdx = 0;

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                var img = thumb.querySelector('img');
                if (img && mainImg) {
                    mainImg.src = img.src;
                    mainImg.alt = img.alt || mainImg.alt;
                }
                thumbs.forEach(function (t) { t.classList.remove('active'); });
                thumb.classList.add('active');
            });
        });

        // Lightbox
        var lightbox = document.createElement('div');
        lightbox.className = 'product-lightbox';
        lightbox.innerHTML =
            '<button class="lightbox-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>' +
            '<button class="lightbox-nav lightbox-prev" aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>' +
            '<img src="" alt="Product image enlarged">' +
            '<button class="lightbox-nav lightbox-next" aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>';
        document.body.appendChild(lightbox);

        var lbImg   = lightbox.querySelector('img');
        var lbClose = lightbox.querySelector('.lightbox-close');
        var lbPrev  = lightbox.querySelector('.lightbox-prev');
        var lbNext  = lightbox.querySelector('.lightbox-next');

        function openLightbox(src) {
            currentLightboxIdx = allSrcs.indexOf(src);
            if (currentLightboxIdx === -1) currentLightboxIdx = 0;
            lbImg.src = allSrcs[currentLightboxIdx];
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        function navLightbox(dir) {
            currentLightboxIdx = (currentLightboxIdx + dir + allSrcs.length) % allSrcs.length;
            lbImg.src = allSrcs[currentLightboxIdx];
        }

        if (mainImg) {
            mainImg.parentElement.addEventListener('click', function () { openLightbox(mainImg.src); });
        }
        thumbs.forEach(function (thumb) {
            thumb.addEventListener('dblclick', function () {
                var img = thumb.querySelector('img');
                if (img) openLightbox(img.src);
            });
        });

        lbClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
        lbPrev.addEventListener('click', function (e) { e.stopPropagation(); navLightbox(-1); });
        lbNext.addEventListener('click', function (e) { e.stopPropagation(); navLightbox(1); });
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navLightbox(-1);
            if (e.key === 'ArrowRight') navLightbox(1);
        });
    }

    /* ─────────────────────────────────────────
       SMOOTH SCROLL for anchor links
    ───────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href.length <= 1) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 90; // header height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ─────────────────────────────────────────
       NEWSLETTER FORM — basic submission handler
    ───────────────────────────────────────── */
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('.newsletter-input');
            if (input && input.value.includes('@')) {
                input.value = '';
                showToast('Thank you! You\'ve been subscribed.');
            } else {
                showToast('Please enter a valid email address.', 'error');
            }
        });
    });

    window.showToast = function (message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: ${type === 'success' ? '#C8963E' : '#E53E3E'};
            color: #fff; padding: 12px 24px; border-radius: 50px;
            font-size: 0.875rem; font-weight: 600; z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease;
            font-family: 'Poppins', sans-serif;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    /* ─────────────────────────────────────────
       PARALLAX BACKGROUND LAYERS
    ───────────────────────────────────────── */
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (parallaxEls.length) {
        const updateParallax = () => {
            parallaxEls.forEach(el => {
                const speed = parseFloat(el.dataset.parallaxSpeed) || 0.15;
                const rect  = el.parentElement.getBoundingClientRect();
                const offset = rect.top * speed;
                el.style.transform = `translate3d(0, ${offset}px, 0)`;
            });
        };
        window.addEventListener('scroll', updateParallax, { passive: true });
        window.addEventListener('resize', updateParallax);
        updateParallax();
    }

})();

/* ─────────────────────────────────────────
   PROJECT POPUP — iframe modal
───────────────────────────────────────── */
(function () {
    'use strict';

    var popup    = document.getElementById('projectPopup');
    if (!popup) return;

    var backdrop = popup.querySelector('.project-popup-backdrop');
    var closeBtn = popup.querySelector('.project-popup-close');
    var frame    = popup.querySelector('.project-popup-frame');

    function openPopup(url) {
        frame.src = url;
        popup.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        popup.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () { frame.src = ''; }, 420);
    }

    document.querySelectorAll('[data-popup]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            openPopup(el.getAttribute('data-popup'));
        });
    });

    if (closeBtn)  closeBtn.addEventListener('click', closePopup);
    if (backdrop)  backdrop.addEventListener('click', closePopup);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && popup.classList.contains('open')) closePopup();
    });
}());

