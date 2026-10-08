document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Theme Toggling (Dark Mode by Default)
    // -------------------------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const html = document.documentElement;

    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        html.setAttribute('data-theme', 'light');
        updateThemeIcons('light');
    } else {
        html.setAttribute('data-theme', 'dark');
        updateThemeIcons('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons(newTheme);
        });
    }

    function updateThemeIcons(theme) {
        if (!moonIcon || !sunIcon) return;
        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    }

    // -------------------------------------------------------------------------
    // 2. Navigation: Header Scroll Elevation & Active Link Highlighting
    // -------------------------------------------------------------------------
    const header = document.getElementById('site-header') || document.querySelector('header');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navAnchors = document.querySelectorAll('.nav-links a');

    // Header elevation shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile Menu Toggle
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close mobile menu on clicking anywhere outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== mobileMenuToggle) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Close mobile menu on clicking a nav link
    navAnchors.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && navLinks) {
                navLinks.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Active Link Highlighting via IntersectionObserver
    const observedSections = document.querySelectorAll('section[id]');
    if (observedSections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute('id');
                    navAnchors.forEach(anchor => {
                        const href = anchor.getAttribute('href');
                        if (href === `#${currentId}`) {
                            anchor.classList.add('active');
                        } else {
                            anchor.classList.remove('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.25,
            rootMargin: "-80px 0px -50% 0px"
        });

        observedSections.forEach(sec => sectionObserver.observe(sec));
    }

    // Dynamic current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Smooth Scrolling for anchor links with header offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // -------------------------------------------------------------------------
    // 3. Telescope Gallery Track & Infinite Scroll
    // -------------------------------------------------------------------------
    const galleryTrack = document.getElementById('gallery-track');
    if (galleryTrack) {
        const galleryImages = [
            "IMG-20250130-WA0025.jpg", "IMG-20250225-WA0011.jpg", "IMG-20250225-WA0014.jpg",
            "IMG-20250225-WA0015.jpg", "IMG-20250225-WA0017.jpg", "IMG-20250225-WA0018.jpg",
            "IMG-20250225-WA0019.jpg", "IMG-20250225-WA0020.jpg", "IMG-20250225-WA0025.jpg",
            "IMG-20250225-WA0027.jpg", "IMG-20250225-WA0030.jpg", "IMG-20250225-WA0031.jpg",
            "IMG-20250225-WA0040.jpg", "IMG-20250225-WA0053.jpg", "IMG-20250912-WA0029.jpg",
            "IMG-20250912-WA0033.jpg", "IMG_20241120_124737301.jpg", "IMG_20241217_113530581.jpg",
            "IMG_20241217_113543074.jpg", "IMG_20241217_113822444.jpg", "IMG_20241217_114110680.jpg",
            "IMG_20241217_114131408.jpg", "IMG_20241217_114142584.jpg", "IMG_20241217_114945174.jpg",
            "IMG_20250125_213354332.jpg", "IMG_20250127_184537284.jpg", "IMG_20250127_184541440.jpg",
            "IMG_20250127_184551960.jpg", "IMG_20250127_202432427.jpg", "IMG_20250208_184507237.jpg",
            "IMG_20250209_192124657.jpg", "IMG_20250222_223424915.jpg", "IMG_20250222_223430472.jpg"
        ];

        // Duplicate the array to allow for a seamless infinite scroll loop
        const scrollingImages = [...galleryImages, ...galleryImages];

        scrollingImages.forEach(filename => {
            const img = document.createElement('img');
            img.src = `assets/images/${filename}`;
            img.alt = "Telescope Outreach and Night Sky Session";
            img.className = 'gallery-img';
            img.loading = 'lazy';

            // Add click listener to open lightbox
            img.addEventListener('click', () => {
                openLightbox(img);
            });

            galleryTrack.appendChild(img);
        });

        // Gallery Auto-Scroll & Navigation Logic
        let galleryPosX = 0;
        let isHoveringGallery = false;
        let autoScrollSpeed = 0.35;
        let currentVelocity = 0;
        let loopPoint = 0;

        const galleryContainer = document.querySelector('.gallery-container');
        if (galleryContainer) {
            galleryContainer.addEventListener('mouseenter', () => isHoveringGallery = true);
            galleryContainer.addEventListener('mouseleave', () => isHoveringGallery = false);

            galleryContainer.addEventListener('wheel', (e) => {
                if (!window.isLightboxOpen) {
                    e.preventDefault();
                    currentVelocity += (e.deltaY + e.deltaX) * 0.05;
                }
            }, { passive: false });
        }

        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        if (prevBtn) prevBtn.addEventListener('click', () => currentVelocity -= 18);
        if (nextBtn) nextBtn.addEventListener('click', () => currentVelocity += 18);

        function animateGallery() {
            if (!window.isLightboxOpen && galleryTrack.children.length > 0) {
                let baseSpeed = isHoveringGallery ? 0 : autoScrollSpeed;
                let totalSpeed = baseSpeed + currentVelocity;

                currentVelocity *= 0.9;
                if (Math.abs(currentVelocity) < 0.01) currentVelocity = 0;

                galleryPosX -= totalSpeed;

                if (galleryTrack.children.length >= galleryImages.length * 2) {
                    loopPoint = galleryTrack.children[galleryImages.length].offsetLeft;
                }

                if (loopPoint > 0) {
                    if (galleryPosX <= -loopPoint) {
                        galleryPosX += loopPoint;
                    } else if (galleryPosX > 0) {
                        galleryPosX -= loopPoint;
                    }
                }

                galleryTrack.style.transform = `translate3d(${galleryPosX}px, 0, 0)`;
            }
            requestAnimationFrame(animateGallery);
        }
        requestAnimationFrame(animateGallery);
    }

    // -------------------------------------------------------------------------
    // 4. Lightbox Functionality (Zoom, Pan, Keyboard Navigation)
    // -------------------------------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    let currentZoom = 1;
    let panX = 0;
    let panY = 0;
    window.isLightboxOpen = false;
    let activeThumbnail = null;
    let activeIndex = -1;
    let isTransitioning = false;

    const galleryThumbnails = galleryTrack ? Array.from(galleryTrack.children) : [];

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;

    function openLightbox(thumbnailImg) {
        if (!lightbox || !lightboxImg) return;
        activeThumbnail = thumbnailImg;
        activeIndex = galleryThumbnails.indexOf(thumbnailImg);

        const thumbRect = thumbnailImg.getBoundingClientRect();
        lightboxImg.src = thumbnailImg.src;

        lightbox.style.visibility = 'visible';
        lightbox.style.display = 'flex';
        lightbox.classList.remove('active');

        lightboxImg.style.transition = 'none';
        lightboxImg.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
        lightboxImg.style.transformOrigin = 'center center';

        const targetRect = lightboxImg.getBoundingClientRect();
        const scale = thumbRect.height / (targetRect.height || 1);
        const translateX = thumbRect.left + thumbRect.width / 2 - (targetRect.left + targetRect.width / 2);
        const translateY = thumbRect.top + thumbRect.height / 2 - (targetRect.top + targetRect.height / 2);

        lightboxImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        void lightboxImg.offsetWidth; // Force reflow

        lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        lightbox.classList.add('active');

        window.isLightboxOpen = true;
        currentZoom = 1;
        panX = 0;
        panY = 0;

        lightboxImg.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox || !window.isLightboxOpen) return;

        if (activeThumbnail && lightboxImg) {
            const thumbRect = activeThumbnail.getBoundingClientRect();
            const prevTf = lightboxImg.style.transform;

            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
            lightboxImg.style.transformOrigin = 'center center';
            const baseRect = lightboxImg.getBoundingClientRect();

            lightboxImg.style.transform = prevTf;
            void lightboxImg.offsetWidth;
            lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

            const scale = thumbRect.height / (baseRect.height || 1);
            const translateX = thumbRect.left + thumbRect.width / 2 - (baseRect.left + baseRect.width / 2);
            const translateY = thumbRect.top + thumbRect.height / 2 - (baseRect.top + baseRect.height / 2);

            lightboxImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        }

        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        window.isLightboxOpen = false;

        setTimeout(() => {
            if (!window.isLightboxOpen && lightbox && lightboxImg) {
                lightbox.style.visibility = 'hidden';
                lightboxImg.style.transition = 'none';
                lightboxImg.style.transform = 'none';
            }
        }, 400);
    }

    function navigateLightbox(direction) {
        if (!window.isLightboxOpen || isTransitioning || galleryThumbnails.length === 0 || !lightboxImg) return;
        isTransitioning = true;

        if (direction === 'next') {
            activeIndex = (activeIndex + 1) % galleryThumbnails.length;
        } else if (direction === 'prev') {
            activeIndex = (activeIndex - 1 + galleryThumbnails.length) % galleryThumbnails.length;
        }

        activeThumbnail = galleryThumbnails[activeIndex];
        const newSrc = activeThumbnail.src;

        currentZoom = 1;
        panX = 0;
        panY = 0;
        lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        lightboxImg.style.opacity = '0';

        setTimeout(() => {
            lightboxImg.src = newSrc;
            lightboxImg.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
            lightboxImg.style.transformOrigin = 'center center';

            setTimeout(() => {
                lightboxImg.style.opacity = '1';
                setTimeout(() => {
                    isTransitioning = false;
                    lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                }, 200);
            }, 50);
        }, 200);
    }

    if (lightbox) {
        const lbPrevBtn = document.getElementById('lightbox-prev');
        const lbNextBtn = document.getElementById('lightbox-next');

        if (lbPrevBtn) lbPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox('prev'); });
        if (lbNextBtn) lbNextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox('next'); });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowRight') {
                navigateLightbox('next');
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox('prev');
            }
        });

        // Panning logic
        if (lightboxImg) {
            lightboxImg.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startPanX = panX;
                startPanY = panY;

                lightboxImg.style.transition = 'none';
                lightboxImg.style.cursor = 'grabbing';
                e.preventDefault();
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                panX = startPanX + dx;
                panY = startPanY + dy;
                lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    lightboxImg.style.cursor = '';

                    if (currentZoom === 1) {
                        panX = 0;
                        panY = 0;
                        lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                        lightboxImg.style.transform = `translate3d(0px, 0px, 0px) scale(${currentZoom})`;
                    } else {
                        lightboxImg.style.transition = 'transform 0.1s ease-out';
                        lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
                    }
                }
            });

            lightboxImg.addEventListener('dragstart', (e) => e.preventDefault());
        }

        // Zoom functionality on scroll
        lightbox.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (!lightboxImg) return;

            if (currentZoom === 1 && e.deltaY < 0) {
                const rect = lightboxImg.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                const clampX = Math.max(0, Math.min(100, x));
                const clampY = Math.max(0, Math.min(100, y));

                lightboxImg.style.transformOrigin = `${clampX}% ${clampY}%`;
            }

            if (e.deltaY < 0) {
                currentZoom += 0.25;
                if (currentZoom > 4) currentZoom = 4;
            } else {
                currentZoom -= 0.25;
                if (currentZoom <= 1) {
                    currentZoom = 1;
                    panX = 0;
                    panY = 0;
                    lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                    lightboxImg.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;

                    setTimeout(() => {
                        if (currentZoom === 1 && !isDragging) {
                            lightboxImg.style.transformOrigin = 'center center';
                        }
                    }, 400);
                }
            }

            if (currentZoom > 1) {
                lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
            }
        }, { passive: false });
    }

    // -------------------------------------------------------------------------
    // 5. Scroll Fade-in Intersection Observer
    // -------------------------------------------------------------------------
    const fadeSections = document.querySelectorAll('.section:not(#home)');
    fadeSections.forEach(section => {
        section.classList.add('section-fade');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
    });

    fadeSections.forEach(section => {
        observer.observe(section);
    });
});
