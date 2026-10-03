document.addEventListener('DOMContentLoaded', function () {

    // ===== Image Carousel =====
    var carousel = document.querySelector('.project-carousel');
    if (carousel) {
        var track = carousel.querySelector('.carousel-track');
        var slides = carousel.querySelectorAll('.carousel-slide');
        var prevBtn = carousel.querySelector('.carousel-prev');
        var nextBtn = carousel.querySelector('.carousel-next');
        var counterCurrent = carousel.querySelector('.current-slide');
        var counterTotal = carousel.querySelector('.total-slides');
        var currentIndex = 0;
        var totalSlides = slides.length;

        if (counterTotal) counterTotal.textContent = totalSlides;

        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            currentIndex = index;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            if (counterCurrent) counterCurrent.textContent = currentIndex + 1;
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentIndex - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentIndex + 1); });

        goToSlide(0);

        // Auto-advance every 5 seconds
        var autoPlay = setInterval(function () { goToSlide(currentIndex + 1); }, 5000);

        carousel.addEventListener('mouseenter', function () { clearInterval(autoPlay); });
        carousel.addEventListener('mouseleave', function () {
            autoPlay = setInterval(function () { goToSlide(currentIndex + 1); }, 5000);
        });

        // Swipe support
        var touchStartX = 0;
        carousel.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(autoPlay);
        }, { passive: true });

        carousel.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToSlide(currentIndex + 1);
                else goToSlide(currentIndex - 1);
            }
            autoPlay = setInterval(function () { goToSlide(currentIndex + 1); }, 5000);
        }, { passive: true });
    }

    // ===== Gallery Grid Lightbox =====
    var galleryItems = document.querySelectorAll('.project-gallery-grid .gallery-item img');
    var lightbox = document.getElementById('custom-lightbox');

    if (lightbox && galleryItems.length > 0) {
        var lightboxImage = document.getElementById('lightbox-image');
        var lbCloseBtn = document.querySelector('.lightbox-close');
        var lbNextBtn = document.querySelector('.lightbox-next');
        var lbPrevBtn = document.querySelector('.lightbox-prev');
        var lbOverlay = document.querySelector('.lightbox-overlay');
        var lbCurrentIndex = 0;
        var lbImageArray = Array.from(galleryItems);

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

    // ===== Strategy Cards Stagger Animation =====
    var strategyCards = document.querySelectorAll('.strategy-card');
    if (strategyCards.length > 0) {
        var cardObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var cards = entry.target.querySelectorAll('.strategy-card');
                    cards.forEach(function (card, i) {
                        setTimeout(function () {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, i * 150);
                    });
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        var cardsContainer = document.querySelector('.strategy-cards');
        if (cardsContainer) {
            strategyCards.forEach(function (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
            cardObserver.observe(cardsContainer);
        }
    }

    // ===== Parallax Hero on scroll =====
    var heroImage = document.querySelector('.project-hero-image img');
    if (heroImage && window.innerWidth >= 768) {
        window.addEventListener('scroll', function () {
            var scrolled = window.pageYOffset;
            var heroHeight = heroImage.parentElement.parentElement.offsetHeight;
            if (scrolled < heroHeight) {
                heroImage.style.transform = 'translateY(' + (scrolled * 0.3) + 'px) scale(1.05)';
            }
        }, { passive: true });
        heroImage.style.transition = 'none';
        heroImage.style.transform = 'scale(1.05)';
        heroImage.parentElement.style.overflow = 'hidden';
    }

});
