document.addEventListener('DOMContentLoaded', function () {

    // --- Navigation ---
    var menuHandler = document.querySelector('.website-menu-handler');
    var closeHandler = document.querySelector('.close-menu-handler');
    var mainNav = document.getElementById('main-navigations');
    var overlay = document.querySelector('.main-navigations-overlay');

    function openNav() {
        if (mainNav) mainNav.classList.add('open');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        if (mainNav) mainNav.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (menuHandler) menuHandler.addEventListener('click', openNav);
    if (closeHandler) closeHandler.addEventListener('click', closeNav);
    if (overlay) overlay.addEventListener('click', closeNav);

    // --- Sub-menu toggle ---
    var hasChildren = document.querySelectorAll('.menu-item-has-children');
    hasChildren.forEach(function (item) {
        var sub = item.querySelector('.sub-menu');
        if (sub) {
            item.classList.add('open');
            sub.style.display = 'block';
        }
        item.addEventListener('click', function (e) {
            var s = this.querySelector('.sub-menu');
            if (s) {
                this.classList.toggle('open');
                s.style.display = s.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // --- Scroll-based animation (IntersectionObserver) ---
    function triggerAnimations() {
        var osAnimations = document.querySelectorAll('.os-animation');
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var animClass = el.getAttribute('data-os-animation') || 'fadeInUp';
                    var delay = el.getAttribute('data-os-animation-delay') || '0s';
                    el.style.animationDelay = delay;
                    el.classList.add('animated', animClass);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        osAnimations.forEach(function (el) {
            observer.observe(el);
        });
    }
    triggerAnimations();

    // --- Image overlay reveal on scroll ---
    function revealImageOverlays() {
        var overlays = document.querySelectorAll('.imageoverlay');
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setTimeout(function () {
                        entry.target.classList.add('imageoverlayHide');
                    }, 200);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        overlays.forEach(function (el) {
            observer.observe(el);
        });
    }
    revealImageOverlays();

    // --- Scroll to top ---
    var scrollTop = document.querySelector('.scrolltop');
    if (scrollTop) {
        scrollTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Animated number counter ---
    function animateNumbers(entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var numElements = document.querySelectorAll('.animated-number');
                numElements.forEach(function (el) {
                    var endValue = parseInt(el.getAttribute('data-value'));
                    var startValue = Math.max(0, endValue - 18);
                    var duration = 1500;
                    var frameRate = 60;
                    var totalFrames = Math.round((duration / 1000) * frameRate);
                    var increment = (endValue - startValue) / totalFrames;

                    function updateNumber() {
                        if (startValue < endValue) {
                            startValue += increment;
                            if (startValue >= endValue) {
                                startValue = endValue;
                                el.innerText = Math.round(startValue);
                            } else {
                                el.innerText = Math.round(startValue);
                                requestAnimationFrame(updateNumber);
                            }
                        }
                    }
                    updateNumber();
                });
                observer.unobserve(entry.target);
            }
        });
    }

    var footprintSection = document.querySelector('.footprint-impact-info');
    if (footprintSection) {
        var numObserver = new IntersectionObserver(animateNumbers, { threshold: 0.5 });
        numObserver.observe(footprintSection);
    }

    // --- Accordion (Our Solutions) ---
    var accordionItems = document.querySelectorAll('.ea-card');
    accordionItems.forEach(function (item) {
        var header = item.querySelector('.ea-header a');
        var body = item.querySelector('.ea-body');
        if (header && body) {
            header.addEventListener('click', function (e) {
                e.preventDefault();
                var isOpen = item.classList.contains('ea-expand');
                accordionItems.forEach(function (i) {
                    i.classList.remove('ea-expand');
                    var b = i.querySelector('.ea-body');
                    if (b) b.style.display = 'none';
                });
                if (!isOpen) {
                    item.classList.add('ea-expand');
                    body.style.display = 'block';
                }
            });
            // Set initial state
            if (item.classList.contains('ea-expand')) {
                body.style.display = 'block';
            } else {
                body.style.display = 'none';
            }
        }
    });

    // --- Project Categories Dropdown ---
    var dropdownHead = document.querySelector('.project-categories-dropdown-list h4');
    var dropdownList = document.querySelector('.project-categories-dropdown-list ul');
    if (dropdownHead && dropdownList) {
        dropdownHead.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', function () {
            if (dropdownHead) dropdownHead.classList.remove('active');
            if (dropdownList) dropdownList.style.display = 'none';
        });
        dropdownList.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    // --- Testimonial / Projects Slider ---
    function initSlider(container) {
        if (!container) return;
        var track = container.querySelector('.slider-track');
        var items = container.querySelectorAll('.slider-item');
        var prevBtn = container.querySelector('.slick-prev');
        var nextBtn = container.querySelector('.slick-next');
        if (!track || items.length === 0) return;

        var current = 0;
        var total = items.length;

        function goTo(index) {
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;
            current = index;
            track.style.transform = 'translateX(-' + (current * 100) + '%)';
            if (prevBtn) prevBtn.classList.toggle('slick-disabled', current === 0);
            if (nextBtn) nextBtn.classList.toggle('slick-disabled', current === total - 1);
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
        goTo(0);
    }

    // --- Team member popup ---
    var popupOpeners = document.querySelectorAll('.meet-the-team-popup-open');
    popupOpeners.forEach(function (opener) {
        opener.addEventListener('click', function () {
            var popup = this.closest('.team-member').querySelector('.team-member-popup');
            if (popup) popup.classList.add('movedLeft');
        });
    });

    var popupClosers = document.querySelectorAll('.team-member-popup-close');
    popupClosers.forEach(function (closer) {
        closer.addEventListener('click', function () {
            var popup = this.closest('.team-member-popup');
            if (popup) popup.classList.remove('movedLeft');
        });
    });

    // --- Copy to clipboard (contact nav) ---
    var copyItems = document.querySelectorAll('.copy-text a');
    copyItems.forEach(function (item) {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            var text = this.textContent.trim();
            navigator.clipboard.writeText(text).then(function () {
                var notice = document.createElement('div');
                notice.className = 'copied';
                notice.textContent = 'Copied!';
                document.body.appendChild(notice);
                setTimeout(function () { notice.remove(); }, 2000);
            });
        });
    });

    // --- Smooth scroll for homepage scroll button ---
    var homeScrollTop = document.querySelector('.homescrolltop');
    if (homeScrollTop) {
        homeScrollTop.addEventListener('click', function () {
            var target = document.querySelector('.moved');
            if (target) {
                window.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
            }
        });
    }

    // --- Testimonial slider (simple) ---
    var testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        var testimonialItems = testimonialSlider.querySelectorAll('.testimonial-item');
        var tCurrent = 0;

        function showTestimonial(index) {
            testimonialItems.forEach(function (item, i) {
                item.style.display = i === index ? 'block' : 'none';
            });
            var activeItem = testimonialItems[index];
            var prev = activeItem.querySelector('.slick-prev');
            var next = activeItem.querySelector('.slick-next');
            if (prev) prev.classList.toggle('slick-disabled', index === 0);
            if (next) next.classList.toggle('slick-disabled', index === testimonialItems.length - 1);
        }

        if (testimonialItems.length > 0) {
            showTestimonial(0);
            testimonialSlider.addEventListener('click', function (e) {
                var btn = e.target.closest('.slick-prev, .slick-next');
                if (!btn || btn.classList.contains('slick-disabled')) return;
                if (btn.classList.contains('slick-prev') && tCurrent > 0) {
                    showTestimonial(--tCurrent);
                } else if (btn.classList.contains('slick-next') && tCurrent < testimonialItems.length - 1) {
                    showTestimonial(++tCurrent);
                }
            });
        }
    }

    // --- Projects carousel (simple) ---
    var projectsSlider = document.querySelector('.homepage-projects .recent-projects');
    if (projectsSlider) {
        var pItems = projectsSlider.querySelectorAll('.project-item');
        // On mobile show one at a time, on desktop show 4
        if (window.innerWidth < 768 && pItems.length > 1) {
            var pCurrent = 0;
            pItems.forEach(function (item, i) {
                item.style.display = i === 0 ? 'block' : 'none';
            });
        }
    }

    // --- Project detail: Other Projects slider ---
    var otherProjectsSlider = document.querySelector('.other-projects .recent-projects');
    if (otherProjectsSlider) {
        var opItems = otherProjectsSlider.querySelectorAll('.project-item');
        var opTrack = otherProjectsSlider.querySelector('.slick-track');
        if (opTrack && opItems.length > 0) {
            // On mobile, let the CSS stack cards full-width; only force the 4-up row on desktop
            if (window.innerWidth >= 768) {
                opItems.forEach(function (item) {
                    item.style.flex = '0 0 25%';
                    item.style.boxSizing = 'border-box';
                });
            }
            opTrack.style.display = 'flex';
            opTrack.style.flexWrap = 'wrap';
        }
    }

    // --- Project detail: Gallery lightbox ---
    var galleryImages = document.querySelectorAll('.wp-block-gallery img');
    var lightbox = document.getElementById('custom-lightbox');
    if (lightbox && galleryImages.length > 0) {
        var lightboxImage = document.getElementById('lightbox-image');
        var lbCloseBtn = document.querySelector('.lightbox-close');
        var lbNextBtn = document.querySelector('.lightbox-next');
        var lbPrevBtn = document.querySelector('.lightbox-prev');
        var lbOverlay = document.querySelector('.lightbox-overlay');
        var lbCurrentIndex = 0;
        var lbImageArray = Array.from(galleryImages);

        lbImageArray.forEach(function (img, index) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                lbCurrentIndex = index;
                openLightbox(img.src);
            });
        });

        function openLightbox(src) {
            lightboxImage.src = src;
            lightbox.style.display = 'flex';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.style.display = 'none';
            lightboxImage.src = '';
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }

        function showNextLb() {
            lbCurrentIndex = (lbCurrentIndex + 1) % lbImageArray.length;
            lightboxImage.src = lbImageArray[lbCurrentIndex].src;
        }

        function showPrevLb() {
            lbCurrentIndex = (lbCurrentIndex - 1 + lbImageArray.length) % lbImageArray.length;
            lightboxImage.src = lbImageArray[lbCurrentIndex].src;
        }

        if (lbCloseBtn) lbCloseBtn.addEventListener('click', closeLightbox);
        if (lbOverlay) lbOverlay.addEventListener('click', closeLightbox);
        if (lbNextBtn) lbNextBtn.addEventListener('click', showNextLb);
        if (lbPrevBtn) lbPrevBtn.addEventListener('click', showPrevLb);

        document.addEventListener('keydown', function (e) {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') showNextLb();
                if (e.key === 'ArrowLeft') showPrevLb();
            }
        });
    }

});

// WhatsApp floating chat button (site-wide)
document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.whatsapp-float')) return;
    var waLink = document.createElement('a');
    waLink.href = 'https://wa.me/917977137975';
    waLink.target = '_blank';
    waLink.rel = 'noopener';
    waLink.className = 'whatsapp-float';
    waLink.setAttribute('aria-label', 'Chat on WhatsApp');
    waLink.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16.004 0C7.165 0 .004 7.161.004 16c0 2.822.736 5.584 2.137 8.012L.008 32l8.188-2.088A15.93 15.93 0 0016.004 32C24.843 32 32 24.839 32 16S24.843 0 16.004 0zm0 29.09a13.06 13.06 0 01-6.66-1.82l-.478-.283-4.958 1.265 1.328-4.847-.31-.495A13.02 13.02 0 012.914 16c0-7.216 5.874-13.09 13.09-13.09S29.09 8.784 29.09 16s-5.87 13.09-13.086 13.09zm7.175-9.803c-.393-.197-2.326-1.148-2.687-1.279-.36-.131-.623-.197-.885.197-.262.394-1.017 1.279-1.246 1.541-.23.263-.459.296-.852.099-.394-.197-1.662-.613-3.166-1.953-1.17-1.044-1.961-2.333-2.19-2.727-.23-.394-.025-.607.173-.803.177-.177.394-.46.59-.69.198-.23.264-.394.396-.656.131-.263.066-.493-.033-.69-.099-.197-.886-2.134-1.214-2.922-.32-.768-.645-.664-.886-.676l-.755-.013c-.262 0-.689.099-1.05.493-.36.394-1.377 1.345-1.377 3.282s1.41 3.806 1.607 4.069c.197.262 2.775 4.236 6.724 5.94.94.405 1.673.647 2.244.828.943.3 1.801.258 2.48.156.756-.113 2.326-.951 2.655-1.869.328-.918.328-1.705.23-1.869-.1-.164-.362-.263-.756-.46z"/></svg>';
    document.body.appendChild(waLink);
});


// --- Featured Projects mobile slider (added) ---
(function () {
    function initProjectsSlider() {
        var projectsSlider = document.querySelector('.homepage-projects .recent-projects');
        var projectsNav = document.querySelector('.homepage-projects .projects-slick-nav');
        if (!projectsSlider) return;

        var pItems = projectsSlider.querySelectorAll('.project-item');
        var pCurrent = 0;

        function showProject(index) {
            pItems.forEach(function (item, i) {
                item.style.display = i === index ? 'block' : 'none';
            });
            if (projectsNav) {
                var pPrev = projectsNav.querySelector('.slick-prev');
                var pNext = projectsNav.querySelector('.slick-next');
                if (pPrev) pPrev.classList.toggle('slick-disabled', index === 0);
                if (pNext) pNext.classList.toggle('slick-disabled', index === pItems.length - 1);
            }
        }

        if (projectsNav && pItems.length > 1) {
            projectsNav.addEventListener('click', function (e) {
                if (window.innerWidth >= 768) return;
                var btn = e.target.closest('.slick-prev, .slick-next');
                if (!btn || btn.classList.contains('slick-disabled')) return;
                if (btn.classList.contains('slick-prev') && pCurrent > 0) {
                    showProject(--pCurrent);
                } else if (btn.classList.contains('slick-next') && pCurrent < pItems.length - 1) {
                    showProject(++pCurrent);
                }
            });
        }

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768) {
                pItems.forEach(function (item) { item.style.display = ''; });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectsSlider);
    } else {
        initProjectsSlider();
    }
})();

