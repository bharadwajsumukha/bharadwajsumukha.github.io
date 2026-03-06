document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggling
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const html = document.documentElement;
    
    // Check local storage for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        html.setAttribute('data-theme', 'dark');
        updateThemeIcons('dark');
    } else {
        html.setAttribute('data-theme', 'light');
        updateThemeIcons('light');
    }

    // Toggle click event
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });

    // Helper to update SVG icons
    function updateThemeIcons(theme) {
        if (theme === 'dark') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        });
    });

    // Set dynamic current year in the footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for fixed header height
                const headerHeight = document.querySelector('header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerHeight;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Gallery Array injection for Telescope & Outreach Sessions
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
            img.alt = "Telescope Outreach Session";
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
        let autoScrollSpeed = 0.375; // Slower speed (0.5 * 0.75)
        let currentVelocity = 0;
        let loopPoint = 0;

        const galleryContainer = document.querySelector('.gallery-container');
        galleryContainer.addEventListener('mouseenter', () => isHoveringGallery = true);
        galleryContainer.addEventListener('mouseleave', () => isHoveringGallery = false);
        
        galleryContainer.addEventListener('wheel', (e) => {
            if (!window.isLightboxOpen) {
                e.preventDefault();
                currentVelocity += (e.deltaY + e.deltaX) * 0.05;
            }
        }, { passive: false });

        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        if (prevBtn) prevBtn.addEventListener('click', () => currentVelocity -= 15);
        if (nextBtn) nextBtn.addEventListener('click', () => currentVelocity += 15);

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

    // Lightbox Functionality
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

    // Build array of gallery thumbnails for navigation
    const galleryThumbnails = Array.from(galleryTrack.children);

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;

    function openLightbox(thumbnailImg) {
        if (!lightbox) return;
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
        const translateX = thumbRect.left + thumbRect.width/2 - (targetRect.left + targetRect.width/2);
        const translateY = thumbRect.top + thumbRect.height/2 - (targetRect.top + targetRect.height/2);
        
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
        
        if (activeThumbnail) {
            const thumbRect = activeThumbnail.getBoundingClientRect();
            
            const prevTx = lightboxImg.style.transition;
            const prevTf = lightboxImg.style.transform;
            
            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
            lightboxImg.style.transformOrigin = 'center center';
            const baseRect = lightboxImg.getBoundingClientRect();
            
            lightboxImg.style.transform = prevTf;
            void lightboxImg.offsetWidth;
            lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            
            const scale = thumbRect.height / (baseRect.height || 1);
            const translateX = thumbRect.left + thumbRect.width/2 - (baseRect.left + baseRect.width/2);
            const translateY = thumbRect.top + thumbRect.height/2 - (baseRect.top + baseRect.height/2);
            
            lightboxImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
        }
        
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        window.isLightboxOpen = false;
        
        setTimeout(() => {
            if (!window.isLightboxOpen) {
                lightbox.style.visibility = 'hidden';
                lightboxImg.style.transition = 'none';
                lightboxImg.style.transform = 'none';
            }
        }, 400);
    }

    function navigateLightbox(direction) {
        if (!window.isLightboxOpen || isTransitioning || galleryThumbnails.length === 0) return;
        isTransitioning = true;

        if (direction === 'next') {
            activeIndex = (activeIndex + 1) % galleryThumbnails.length;
        } else if (direction === 'prev') {
            activeIndex = (activeIndex - 1 + galleryThumbnails.length) % galleryThumbnails.length;
        }

        activeThumbnail = galleryThumbnails[activeIndex];
        const newSrc = activeThumbnail.src;

        // Reset zoom and panning immediately
        currentZoom = 1;
        panX = 0;
        panY = 0;
        lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        lightboxImg.style.opacity = '0'; // Start fade out

        setTimeout(() => {
            lightboxImg.src = newSrc;
            lightboxImg.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
            lightboxImg.style.transformOrigin = 'center center';
            
            // Short delay to ensure image swaps before fading back in
            setTimeout(() => {
                lightboxImg.style.opacity = '1';
                setTimeout(() => {
                    isTransitioning = false;
                    lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                }, 200); // Wait for fade in
            }, 50);
        }, 200); // Wait for fade out
    }

    if (lightbox) {
        const lbPrevBtn = document.getElementById('lightbox-prev');
        const lbNextBtn = document.getElementById('lightbox-next');
        
        if (lbPrevBtn) lbPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox('prev'); });
        if (lbNextBtn) lbNextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox('next'); });

        lightboxClose.addEventListener('click', closeLightbox);
        
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
                
                // Only snap back to center if not zoomed in
                if (currentZoom === 1) {
                    panX = 0;
                    panY = 0;
                    lightboxImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                    lightboxImg.style.transform = `translate3d(0px, 0px, 0px) scale(${currentZoom})`;
                } else {
                    // Keep the current pan position
                    lightboxImg.style.transition = 'transform 0.1s ease-out';
                    lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
                }
            }
        });

        lightboxImg.addEventListener('dragstart', (e) => e.preventDefault());

        // Zoom functionality on scroll
        lightbox.addEventListener('wheel', (e) => {
            e.preventDefault();

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
                    
                    // Smoothly recenter when we zoom out back to 1x
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

            // Only apply transform immediately if zoom is > 1x since recenter triggers its own transition
            if (currentZoom > 1) {
                lightboxImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentZoom})`;
            }
        }, { passive: false });
    }
});
