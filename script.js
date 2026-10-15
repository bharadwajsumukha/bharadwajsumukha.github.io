document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 0. Toast Helper & Safe Clipboard / Storage Utilities
    // -------------------------------------------------------------------------
    const toastEl = document.getElementById('toast-banner');
    let toastTimer = null;

    function showToast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 2800);
    }

    function copyTextToClipboard(text, label) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast(label || 'Copied to clipboard');
                }).catch(() => fallbackCopy(text, label));
            } else {
                fallbackCopy(text, label);
            }
        } catch (err) {
            fallbackCopy(text, label);
        }
    }

    function fallbackCopy(text, label) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(label || 'Copied to clipboard');
        } catch (e) {
            showToast('Copy ready');
        }
        document.body.removeChild(ta);
    }

    // -------------------------------------------------------------------------
    // 1. Theme Toggling (Dark Mode Default)
    // -------------------------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const html = document.documentElement;

    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {
        savedTheme = 'dark';
    }

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        if (moonIcon && sunIcon) {
            moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
            sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
        }
    }
    applyTheme(savedTheme === 'light' ? 'light' : 'dark');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme);
            try {
                localStorage.setItem('theme', nextTheme);
            } catch (e) {}
        });
    }

    // -------------------------------------------------------------------------
    // 2. Navigation, Mobile Drawer & Active Section Tracking
    // -------------------------------------------------------------------------
    const header = document.getElementById('site-header');
    const navLinks = document.getElementById('nav-links');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navAnchors = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 16);
        }
    }, { passive: true });

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== mobileMenuToggle) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    navAnchors.forEach(a => {
        a.addEventListener('click', () => {
            if (navLinks) navLinks.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    const observedSections = document.querySelectorAll('section[id]');
    if ('IntersectionObserver' in window && observedSections.length > 0) {
        const secObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' });
        observedSections.forEach(s => secObs.observe(s));
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // -------------------------------------------------------------------------
    // 3. HERO BACKGROUND CANVAS — Cosmic Web Accretion & Quasar Sightline
    // -------------------------------------------------------------------------
    const heroCanvas = document.getElementById('hero-cosmos-canvas');
    const hudCoord = document.getElementById('hud-coord-val');
    const hudImpact = document.getElementById('hud-impact-val');
    const hudPhase = document.getElementById('hud-phase-val');
    const heroSimToggleBtn = document.getElementById('hero-sim-toggle');
    const heroPhaseToggleBtn = document.getElementById('hero-phase-toggle');

    let heroSimRunning = true;
    let heroVisualMode = 'multiphase'; // 'multiphase' | 'cold' | 'warm'
    let heroAnimId = null;

    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        let cw = 1200, ch = 700;
        let mouseNormX = 0.38, mouseNormY = 0.48;

        function resizeHeroCanvas() {
            const rect = heroCanvas.parentElement.getBoundingClientRect();
            cw = Math.max(320, rect.width);
            ch = Math.max(420, rect.height);
            heroCanvas.width = cw;
            heroCanvas.height = ch;
        }
        resizeHeroCanvas();
        window.addEventListener('resize', resizeHeroCanvas);

        // Cosmic web nodes & filament particles (cold accretion + bipolar winds)
        const particles = [];
        const NUM_PARTICLES = 140;
        for (let i = 0; i < NUM_PARTICLES; i++) {
            const isOutflow = i % 3 === 0;
            particles.push({
                angle: (i / NUM_PARTICLES) * Math.PI * 2,
                radius: 40 + Math.random() * 340,
                speed: isOutflow ? (0.45 + Math.random() * 0.65) : -(0.35 + Math.random() * 0.45),
                isOutflow: isOutflow,
                size: 1.2 + Math.random() * 2.0,
                alpha: 0.25 + Math.random() * 0.55,
                streamIdx: i % 4
            });
        }

        const filamentAngles = [-0.25, 0.12, 2.85, 3.22]; // Major-axis cold cosmic web filaments

        function renderHeroFrame(t) {
            ctx.clearRect(0, 0, cw, ch);
            const cx = cw * 0.36;
            const cy = ch * 0.50;

            // Virial halo rings (R_vir and 0.5 R_vir)
            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.13)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.beginPath();
            ctx.arc(cx, cy, 210, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(245, 158, 11, 0.10)';
            ctx.beginPath();
            ctx.arc(cx, cy, 115, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Bipolar warm-hot AGN/Stellar feedback lobes (minor axis)
            if (heroVisualMode !== 'cold') {
                const lobeGrad1 = ctx.createRadialGradient(cx, cy - 110, 10, cx, cy - 130, 165);
                lobeGrad1.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
                lobeGrad1.addColorStop(0.5, 'rgba(192, 132, 252, 0.08)');
                lobeGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = lobeGrad1;
                ctx.beginPath();
                ctx.arc(cx, cy - 120, 165, 0, Math.PI * 2);
                ctx.fill();

                const lobeGrad2 = ctx.createRadialGradient(cx, cy + 110, 10, cx, cy + 130, 165);
                lobeGrad2.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
                lobeGrad2.addColorStop(0.5, 'rgba(192, 132, 252, 0.08)');
                lobeGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = lobeGrad2;
                ctx.beginPath();
                ctx.arc(cx, cy + 120, 165, 0, Math.PI * 2);
                ctx.fill();
            }

            // Cold-mode filamentary streams feeding along the major axis
            if (heroVisualMode !== 'warm') {
                ctx.save();
                filamentAngles.forEach((fa, idx) => {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    const ex = cx + Math.cos(fa) * 460;
                    const ey = cy + Math.sin(fa) * 280;
                    const cpx = cx + Math.cos(fa + 0.18 * (idx % 2 ? 1 : -1)) * 220;
                    const cpy = cy + Math.sin(fa + 0.18 * (idx % 2 ? 1 : -1)) * 160;
                    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
                    ctx.lineWidth = 14;
                    ctx.stroke();

                    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                });
                ctx.restore();
            }

            // Galaxy Pair G1 and G2 inside the shared dark matter halo
            const g1x = cx - 22, g1y = cy - 8;
            const g2x = cx + 38, g2y = cy + 16;
            [{x: g1x, y: g1y, r: 26, label: 'G1 (z=0.8764)'}, {x: g2x, y: g2y, r: 19, label: 'G2'}].forEach(g => {
                const gGrad = ctx.createRadialGradient(g.x, g.y, 1, g.x, g.y, g.r);
                gGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                gGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.55)');
                gGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                ctx.fillStyle = gGrad;
                ctx.beginPath();
                ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // Update & draw hydrodynamical tracer particles
            particles.forEach(p => {
                if (heroVisualMode === 'cold' && p.isOutflow) return;
                if (heroVisualMode === 'warm' && !p.isOutflow) return;

                if (heroSimRunning) {
                    p.radius += p.speed;
                    if (!p.isOutflow && p.radius < 18) p.radius = 340;
                    if (p.isOutflow && p.radius > 320) p.radius = 18;
                }

                let px, py;
                if (p.isOutflow) {
                    const sign = (p.streamIdx % 2 === 0) ? -1 : 1;
                    const spread = (p.angle - Math.PI) * 0.28;
                    px = cx + Math.sin(spread) * p.radius * 0.75;
                    py = cy + sign * Math.cos(spread) * p.radius * 0.85;
                    ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
                } else {
                    const baseA = filamentAngles[p.streamIdx];
                    const swirl = (340 - p.radius) * 0.0025;
                    px = cx + Math.cos(baseA + swirl) * p.radius * 1.15;
                    py = cy + Math.sin(baseA + swirl) * p.radius * 0.65;
                    ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
                }
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Quasar Sightline Beam (piercing the halo at impact parameter rho/R_vir ~ 0.9)
            const sx = cw * mouseNormX;
            const sy = ch * mouseNormY;
            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.moveTo(0, sy);
            ctx.lineTo(cw, sy);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(sx, sy, 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
            ctx.setLineDash([]);
            ctx.stroke();
            ctx.restore();

            if (heroSimRunning) {
                heroAnimId = requestAnimationFrame(renderHeroFrame);
            }
        }

        heroAnimId = requestAnimationFrame(renderHeroFrame);

        const heroSection = document.getElementById('home');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const r = heroSection.getBoundingClientRect();
                mouseNormX = Math.max(0.05, Math.min(0.95, (e.clientX - r.left) / r.width));
                mouseNormY = Math.max(0.08, Math.min(0.92, (e.clientY - r.top) / r.height));

                const dx = (mouseNormX - 0.36) * 2.4;
                const dy = (mouseNormY - 0.50) * 2.4;
                const rhoRvir = Math.min(2.5, Math.hypot(dx, dy)).toFixed(2);

                if (hudCoord) {
                    const raSec = (14.2 + mouseNormX * 8.4).toFixed(1);
                    const decArc = (35.0 + mouseNormY * 12.0).toFixed(1);
                    hudCoord.textContent = `01h07m${raSec}s -02°${decArc}'`;
                }
                if (hudImpact) {
                    hudImpact.textContent = `${rhoRvir} R_vir`;
                }
                if (hudPhase) {
                    if (rhoRvir < 0.65) {
                        hudPhase.textContent = 'Multi-phase Halo (Ne VIII + O VI + Mg II)';
                    } else if (Math.abs(dy) < 0.35 && rhoRvir < 1.25) {
                        hudPhase.textContent = 'Cold-Mode Inflow Stream (pLLS • H I + Mg II)';
                    } else {
                        hudPhase.textContent = 'Diffuse IGM / Warm-Hot Envelope (Lyα + O VI)';
                    }
                }
                if (!heroSimRunning) renderHeroFrame(0);
            });
        }

        if (heroSimToggleBtn) {
            heroSimToggleBtn.addEventListener('click', () => {
                heroSimRunning = !heroSimRunning;
                heroSimToggleBtn.textContent = heroSimRunning ? 'Pause Field' : 'Resume Field';
                heroSimToggleBtn.classList.toggle('active', !heroSimRunning);
                if (heroSimRunning) {
                    if (heroAnimId) cancelAnimationFrame(heroAnimId);
                    heroAnimId = requestAnimationFrame(renderHeroFrame);
                }
            });
        }

        if (heroPhaseToggleBtn) {
            heroPhaseToggleBtn.addEventListener('click', () => {
                const modes = ['multiphase', 'cold', 'warm'];
                const labels = {
                    multiphase: 'Layer: Multiphase (All)',
                    cold: 'Layer: Cold Inflows (10⁴ K)',
                    warm: 'Layer: Warm-Hot Feedback (10⁶ K)'
                };
                const nextIdx = (modes.indexOf(heroVisualMode) + 1) % modes.length;
                heroVisualMode = modes[nextIdx];
                heroPhaseToggleBtn.textContent = labels[heroVisualMode];
                if (!heroSimRunning) renderHeroFrame(0);
            });
        }
    }

    // -------------------------------------------------------------------------
    // 4. SIMULATION THEATRE TABS & TNG100 VIDEO CONTROLS + 8-PANEL INSPECTOR
    // -------------------------------------------------------------------------
    const simTabBtns = document.querySelectorAll('.sim-tab-btn');
    const simPanels = document.querySelectorAll('.sim-viewport-panel');

    simTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-sim-tab');
            simTabBtns.forEach(b => b.classList.toggle('active', b === btn));
            simPanels.forEach(p => p.classList.toggle('active', p.id === target));
            if (target === 'viewport-sightline') {
                drawSightlineLab();
            }
        });
    });

    const tngVideo = document.getElementById('tng-main-video');
    const tngPlayBtn = document.getElementById('tng-play-btn');
    const tngRateBtn = document.getElementById('tng-rate-btn');
    const tngRestartBtn = document.getElementById('tng-restart-btn');
    const tngStatusText = document.getElementById('tng-status-text');

    if (tngVideo) {
        if (tngPlayBtn) {
            tngPlayBtn.addEventListener('click', () => {
                if (tngVideo.paused) {
                    tngVideo.play().then(() => {
                        tngPlayBtn.textContent = 'Pause Movie';
                    }).catch(() => {
                        if (tngStatusText) tngStatusText.textContent = 'Stream ready via TNG Server';
                    });
                } else {
                    tngVideo.pause();
                    tngPlayBtn.textContent = 'Play Movie';
                }
            });
        }
        if (tngRateBtn) {
            const rates = [1.0, 0.5, 1.5];
            let rIdx = 0;
            tngRateBtn.addEventListener('click', () => {
                rIdx = (rIdx + 1) % rates.length;
                tngVideo.playbackRate = rates[rIdx];
                tngRateBtn.textContent = `Speed: ${rates[rIdx].toFixed(1)}x`;
            });
        }
        if (tngRestartBtn) {
            tngRestartBtn.addEventListener('click', () => {
                tngVideo.currentTime = 0;
                tngVideo.play().catch(() => {});
                if (tngPlayBtn) tngPlayBtn.textContent = 'Pause Movie';
            });
        }
    }

    // 8-Panel Diagnostic Inspector Data (Zinger et al. 2020, TNG100 Halo #194946)
    const panelDescriptions = {
        stars: {
            title: 'Panel 01 // Stellar Surface Density (Σ*)',
            desc: 'Tracks the morphological transformation and hierarchical assembly of the central galaxy in TNG100 Halo #194946 up to M* = 2 × 10¹¹ M☉ at z = 0, alongside incoming satellite galaxies and tidal stellar streams.'
        },
        temp: {
            title: 'Panel 02 // Gas Temperature (T)',
            desc: 'Reveals the coexistence of cool (T ~ 10⁴–10⁴.⁵ K) filamentary inflows and virialized warm-hot (T ~ 10⁵.⁵–10⁷ K) halo plasma heated by accretion shocks and supermassive black hole (SMBH) kinetic feedback.'
        },
        pressure: {
            title: 'Panel 03 // Thermal Gas Pressure (P)',
            desc: 'Illustrates outward-propagating shock fronts and pressure cavities inflated by episodic AGN feedback bursts, which regulate the hydrostatic balance of the inner circumgalactic medium.'
        },
        metallicity: {
            title: 'Panel 04 // Gas-Phase Metallicity (Z / Z☉)',
            desc: 'Contrasts chemically pristine/sub-solar intergalactic accretion streams (such as the log(Z/Z☉) = -1.05 partial Lyman limit absorber toward LBQS 0107-0235) against metal-enriched bipolar outflows.'
        },
        density: {
            title: 'Panel 05 // Hydrogen Number Density (n_H)',
            desc: 'Maps dense circumgalactic clumps and filaments (n_H ~ 10⁻³ cm⁻³) embedded within a tenuous halo medium (n_H < 10⁻⁴.⁵ cm⁻³). Crucial for Cloudy photoionization modeling of Lyman limit and metal-line absorbers.'
        },
        entropy: {
            title: 'Panel 06 // Specific Gas Entropy (K ∝ T · n_H⁻²/³)',
            desc: 'As highlighted in Zinger et al. (2020), SMBH kinetic winds lift central CGM entropy, increasing cooling times and acting as "preventive feedback" that quenches late-time star formation.'
        },
        tcool: {
            title: 'Panel 07 // Radiative Cooling Time (t_cool)',
            desc: 'Compares local radiative cooling timescales against the halo free-fall time. Low-t_cool filaments condense into multiphase Mg II and H I absorbers, while high-entropy cavities remain hot over Gyr timescales.'
        },
        vrad: {
            title: 'Panel 08 // Radial Velocity Field (v_rad)',
            desc: 'Separates infalling cold-mode accretion streams (v_rad < 0, blue/inward) aligned with the major axis from high-velocity feedback-driven outflows (v_rad > 0, red/outward) escaping into the IGM.'
        }
    };

    const panelChipBtns = document.querySelectorAll('.panel-chip-btn');
    const panelDetailTitle = document.getElementById('panel-detail-title');
    const panelDetailDesc = document.getElementById('panel-detail-desc');

    panelChipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-panel-key');
            panelChipBtns.forEach(b => b.classList.toggle('active', b === btn));
            if (panelDescriptions[key] && panelDetailTitle && panelDetailDesc) {
                panelDetailTitle.textContent = panelDescriptions[key].title;
                panelDetailDesc.textContent = panelDescriptions[key].desc;
            }
        });
    });

    // -------------------------------------------------------------------------
    // 5. VIEWPORT 2 — Interactive Quasar Sightline & HST/COS Voigt Spectrometer
    // -------------------------------------------------------------------------
    const haloCanvas = document.getElementById('halo-sightline-canvas');
    const spectraCanvas = document.getElementById('cos-spectra-canvas');
    const presetBtns = document.querySelectorAll('.preset-btn');

    const paramRhoEl = document.getElementById('param-rho');
    const paramZEl = document.getElementById('param-z');
    const paramNhEl = document.getElementById('param-nh');
    const paramTempEl = document.getElementById('param-temp');
    const sightlineCaptionEl = document.getElementById('sightline-caption');

    // Sightline state in normalized halo coordinates [-1.5, +1.5] R_vir
    let sightlineState = {
        x: 0.78,
        y: -0.44,
        label: 'LBQS 0107-0235 (z = 0.87641 pLLS • Bharadwaj et al. 2026, ApJ 1008, 155)',
        logZ: -1.05,
        logNh: -3.1,
        logT: 4.25,
        rhoRvir: 0.90,
        vShift: 18,
        preset: 'lbqs0107'
    };

    const presets = {
        lbqs0107: {
            x: 0.78,
            y: -0.44,
            label: 'LBQS 0107-0235 (z = 0.87641 pLLS • Bharadwaj et al. 2026, ApJ 1008, 155): Cold-mode inflow stream aligned with rotating disk pair G1 & G2.',
            logZ: -1.05,
            logNh: -3.1,
            logT: 4.25,
            rhoRvir: 0.90,
            vShift: 18
        },
        pks0405: {
            x: -0.32,
            y: 0.52,
            label: 'PKS 0405-123 / HE 0226-4110 (Bharadwaj et al., ApJ Submitted): Warm-hot galaxy pair halo gas traced by Ne VIII λλ770,780 and O VI λλ1031,1037.',
            logZ: -0.45,
            logNh: -4.3,
            logT: 5.75,
            rhoRvir: 0.61,
            vShift: -42
        },
        outflow: {
            x: 0.08,
            y: -0.58,
            label: 'Minor-Axis Bipolar Feedback Cone (TNG50 / EAGLE Outflow): Multi-component metal-enriched galactic wind driven by stellar & AGN feedback.',
            logZ: -0.15,
            logNh: -3.8,
            logT: 5.85,
            rhoRvir: 0.59,
            vShift: -135
        },
        igm: {
            x: -1.12,
            y: -0.78,
            label: 'Outer IGM Cosmic Web Filament (ρ / R_vir = 1.36): Diffuse, metal-poor Lyman-alpha forest absorber outside the virial shock.',
            logZ: -2.10,
            logNh: -4.6,
            logT: 4.40,
            rhoRvir: 1.36,
            vShift: 55
        }
    };

    function updateSightlineFromCoords(nx, ny) {
        const rho = Math.min(1.65, Math.hypot(nx, ny));
        const angle = Math.atan2(ny, nx);
        // Major axis is roughly along angle -0.5 rad & +2.64 rad
        const distFromMajorAxis = Math.abs(Math.sin(angle + 0.5));
        const isMinorCone = distFromMajorAxis > 0.72 && rho < 0.95;
        const isMajorFilament = distFromMajorAxis < 0.38 && rho < 1.25;

        let logZ, logNh, logT, vShift, desc;
        if (isMinorCone) {
            logZ = -0.20 - 0.3 * rho;
            logNh = -3.5 - 0.7 * rho;
            logT = 5.85 - 0.15 * rho;
            vShift = Math.round((ny < 0 ? -1 : 1) * (95 + 60 * (1 - rho)));
            desc = `Custom Sightline (ρ/R_vir = ${rho.toFixed(2)}): Piercing minor-axis warm-hot bipolar outflow cone (strong O VI & Ne VIII).`;
        } else if (isMajorFilament) {
            logZ = -1.05 - 0.15 * (rho - 0.9);
            logNh = -2.9 - 0.4 * rho;
            logT = 4.20 + 0.15 * rho;
            vShift = Math.round(18 + 40 * (nx - 0.5));
            desc = `Custom Sightline (ρ/R_vir = ${rho.toFixed(2)}): Piercing major-axis cold-mode accretion stream (pLLS H I + narrow Mg II).`;
        } else if (rho <= 1.0) {
            logZ = -0.65 - 0.3 * rho;
            logNh = -3.9 - 0.4 * rho;
            logT = 5.55;
            vShift = Math.round(nx * 65);
            desc = `Custom Sightline (ρ/R_vir = ${rho.toFixed(2)}): Piercing intermediate virialized galaxy pair halo.`;
        } else {
            logZ = -1.95;
            logNh = -4.55;
            logT = 4.35;
            vShift = Math.round(nx * 40);
            desc = `Custom Sightline (ρ/R_vir = ${rho.toFixed(2)}): Piercing outer intergalactic medium (IGM) filament.`;
        }

        sightlineState = {
            x: nx,
            y: ny,
            label: desc,
            logZ: logZ,
            logNh: logNh,
            logT: logT,
            rhoRvir: rho,
            vShift: vShift,
            preset: 'custom'
        };
    }

    function drawSightlineLab() {
        if (!haloCanvas || !spectraCanvas) return;

        // Update parameter badges
        if (paramRhoEl) paramRhoEl.textContent = `${sightlineState.rhoRvir.toFixed(2)} R_vir`;
        if (paramZEl) paramZEl.textContent = `${sightlineState.logZ.toFixed(2)} dex`;
        if (paramNhEl) paramNhEl.textContent = `${sightlineState.logNh.toFixed(2)} cm⁻³`;
        if (paramTempEl) paramTempEl.textContent = `10^${sightlineState.logT.toFixed(2)} K`;
        if (sightlineCaptionEl) sightlineCaptionEl.textContent = sightlineState.label;

        // 1. Draw Halo Map Canvas
        const hctx = haloCanvas.getContext('2d');
        const hw = haloCanvas.width = 400;
        const hh = haloCanvas.height = 400;
        const cx = hw / 2, cy = hh / 2;
        const rVirPx = 128;

        hctx.clearRect(0, 0, hw, hh);

        // Background grid
        hctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        hctx.lineWidth = 1;
        for (let g = 40; g < hw; g += 40) {
            hctx.beginPath(); hctx.moveTo(g, 0); hctx.lineTo(g, hh); hctx.stroke();
            hctx.beginPath(); hctx.moveTo(0, g); hctx.lineTo(hw, g); hctx.stroke();
        }

        // Minor-axis warm-hot bipolar feedback cones (Ne VIII / O VI)
        hctx.save();
        hctx.translate(cx, cy);
        hctx.rotate(-0.5);
        const coneGrad = hctx.createRadialGradient(0, 0, 10, 0, 0, 150);
        coneGrad.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
        coneGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.16)');
        coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        hctx.fillStyle = coneGrad;
        hctx.beginPath();
        hctx.moveTo(0, 0);
        hctx.arc(0, 0, 150, -Math.PI * 0.72, -Math.PI * 0.28);
        hctx.closePath();
        hctx.fill();

        hctx.beginPath();
        hctx.moveTo(0, 0);
        hctx.arc(0, 0, 150, Math.PI * 0.28, Math.PI * 0.72);
        hctx.closePath();
        hctx.fill();

        // Major-axis cold-mode accretion stream (H I pLLS / Mg II)
        const streamGrad = hctx.createLinearGradient(-180, 0, 180, 0);
        streamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        streamGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.32)');
        streamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
        hctx.fillStyle = streamGrad;
        hctx.fillRect(-185, -22, 370, 44);
        hctx.restore();

        // Virial Radius circle (R_vir)
        hctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        hctx.setLineDash([5, 5]);
        hctx.beginPath();
        hctx.arc(cx, cy, rVirPx, 0, Math.PI * 2);
        hctx.stroke();
        hctx.setLineDash([]);

        hctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        hctx.font = '10px "JetBrains Mono", monospace';
        hctx.fillText('R_vir', cx + rVirPx - 32, cy - 6);

        // Galaxy Pair G1 and G2 (VLT/MUSE rotating disks)
        const galaxies = [
            { x: cx - 18, y: cy + 8, r: 12, name: 'G1 (Δv=18 km/s)' },
            { x: cx + 26, y: cy - 14, r: 15, name: 'G2 (Δv=99 km/s)' }
        ];
        galaxies.forEach(g => {
            const gg = hctx.createRadialGradient(g.x, g.y, 1, g.x, g.y, g.r);
            gg.addColorStop(0, '#ffffff');
            gg.addColorStop(0.5, '#38bdf8');
            gg.addColorStop(1, 'rgba(56, 189, 248, 0)');
            hctx.fillStyle = gg;
            hctx.beginPath();
            hctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
            hctx.fill();

            hctx.fillStyle = '#e2e8f0';
            hctx.font = '10px "JetBrains Mono", monospace';
            hctx.fillText(g.name, g.x - 28, g.y + g.r + 10);
        });

        // Quasar Sightline Reticle
        const qx = cx + sightlineState.x * rVirPx;
        const qy = cy + sightlineState.y * rVirPx;

        hctx.strokeStyle = '#38bdf8';
        hctx.lineWidth = 1.5;
        hctx.beginPath();
        hctx.arc(qx, qy, 9, 0, Math.PI * 2);
        hctx.stroke();

        hctx.beginPath();
        hctx.moveTo(qx - 14, qy); hctx.lineTo(qx + 14, qy);
        hctx.moveTo(qx, qy - 14); hctx.lineTo(qx, qy + 14);
        hctx.stroke();

        hctx.fillStyle = '#38bdf8';
        hctx.font = 'bold 10px "JetBrains Mono", monospace';
        hctx.fillText('QSO SIGHTLINE', Math.min(hw - 95, Math.max(8, qx + 12)), Math.max(16, qy - 10));

        // 2. Draw Simulated HST/COS Absorption Profiles (4 stacked panels)
        const sctx = spectraCanvas.getContext('2d');
        const sw = spectraCanvas.width = 520;
        const sh = spectraCanvas.height = 320;
        sctx.clearRect(0, 0, sw, sh);

        const isColdDominated = sightlineState.logT < 4.8;
        const isWarmHot = sightlineState.logT >= 5.2;
        const isOutflow = sightlineState.preset === 'outflow' || (isWarmHot && sightlineState.logZ > -0.35);

        const lines = [
            {
                name: 'H I Lyα λ1215.67',
                color: '#38bdf8',
                tau0: isColdDominated ? 5.5 : (isWarmHot ? 1.8 : 2.2),
                b: isColdDominated ? 24 : 42,
                logN: isColdDominated ? (sightlineState.rhoRvir < 1.05 ? '16.85 (pLLS)' : '14.20') : '14.65'
            },
            {
                name: 'Mg II λλ2796, 2803',
                color: '#2dd4bf',
                tau0: isColdDominated && sightlineState.rhoRvir < 1.15 ? 2.4 : (isOutflow ? 1.1 : 0.08),
                b: 14,
                logN: isColdDominated && sightlineState.rhoRvir < 1.15 ? '13.42' : (isOutflow ? '12.95' : '< 11.8')
            },
            {
                name: 'O VI λλ1031, 1037',
                color: '#f59e0b',
                tau0: isWarmHot ? 2.1 : (isColdDominated && sightlineState.rhoRvir < 1.0 ? 0.65 : 0.15),
                b: 36,
                logN: isWarmHot ? '14.58' : '13.60'
            },
            {
                name: 'Ne VIII λλ770, 780',
                color: '#c084fc',
                tau0: isWarmHot ? 1.15 : 0.04,
                b: 48,
                logN: isWarmHot ? '14.22' : '< 13.3'
            }
        ];

        const panelH = sh / lines.length;
        const padL = 48, padR = 16;
        const plotW = sw - padL - padR;

        lines.forEach((ln, idx) => {
            const topY = idx * panelH;
            const contY = topY + 18;
            const zeroY = topY + panelH - 14;
            const fluxH = zeroY - contY;

            // Panel divider & continuum line (F = 1.0)
            sctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            sctx.beginPath();
            sctx.moveTo(padL, zeroY);
            sctx.lineTo(sw - padR, zeroY);
            sctx.stroke();

            sctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            sctx.setLineDash([3, 3]);
            sctx.beginPath();
            sctx.moveTo(padL, contY);
            sctx.lineTo(sw - padR, contY);
            sctx.stroke();
            sctx.setLineDash([]);

            // Systemic velocity line (Δv = 0 km/s)
            const v0X = padL + plotW * 0.5;
            sctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
            sctx.beginPath();
            sctx.moveTo(v0X, topY + 4);
            sctx.lineTo(v0X, zeroY);
            sctx.stroke();

            // Plot normalized flux profile F(v) = exp(-tau(v))
            sctx.strokeStyle = ln.color;
            sctx.lineWidth = 1.6;
            sctx.beginPath();
            for (let px = 0; px <= plotW; px += 2) {
                const v = ((px / plotW) - 0.5) * 600; // -300 to +300 km/s
                const dv1 = v - sightlineState.vShift;
                let tau = ln.tau0 * Math.exp(-(dv1 * dv1) / (ln.b * ln.b));

                // Secondary kinematic wing if outflow
                if (isOutflow && ln.tau0 > 0.4) {
                    const dv2 = v - (sightlineState.vShift - 85);
                    tau += (ln.tau0 * 0.65) * Math.exp(-(dv2 * dv2) / ((ln.b * 1.3) ** 2));
                }

                // Deterministic subtle COS instrumental ripple
                const noise = Math.sin(px * 0.7 + idx * 2.1) * 0.022;
                const flux = Math.max(0, Math.min(1.06, Math.exp(-tau) + noise));
                const py = zeroY - flux * fluxH;

                if (px === 0) sctx.moveTo(padL + px, py);
                else sctx.lineTo(padL + px, py);
            }
            sctx.stroke();

            // Labels
            sctx.fillStyle = '#94a3b8';
            sctx.font = '10px "JetBrains Mono", monospace';
            sctx.fillText('1.0', 18, contY + 3);
            sctx.fillText('0.0', 18, zeroY);

            sctx.fillStyle = ln.color;
            sctx.font = 'bold 11px "JetBrains Mono", monospace';
            sctx.fillText(ln.name, padL + 8, topY + 14);

            sctx.fillStyle = '#cbd5e1';
            sctx.font = '10px "JetBrains Mono", monospace';
            sctx.fillText(`log N = ${ln.logN}`, sw - padR - 125, topY + 14);
        });

        // Velocity axis ticks at bottom
        sctx.fillStyle = '#64748b';
        sctx.font = '10px "JetBrains Mono", monospace';
        sctx.fillText('-300 km/s', padL, sh - 2);
        sctx.fillText('0 km/s (z_abs)', padL + plotW * 0.5 - 36, sh - 2);
        sctx.fillText('+300 km/s', sw - padR - 58, sh - 2);
    }

    if (haloCanvas) {
        let draggingSightline = false;
        function handleHaloPointer(e) {
            const rect = haloCanvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const px = ((clientX - rect.left) / rect.width) * 400;
            const py = ((clientY - rect.top) / rect.height) * 400;
            const nx = (px - 200) / 128;
            const ny = (py - 200) / 128;
            presetBtns.forEach(b => b.classList.remove('active'));
            updateSightlineFromCoords(nx, ny);
            drawSightlineLab();
        }

        haloCanvas.addEventListener('mousedown', (e) => {
            draggingSightline = true;
            handleHaloPointer(e);
        });
        window.addEventListener('mousemove', (e) => {
            if (draggingSightline) handleHaloPointer(e);
        });
        window.addEventListener('mouseup', () => {
            draggingSightline = false;
        });
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-preset');
            if (presets[key]) {
                presetBtns.forEach(b => b.classList.toggle('active', b === btn));
                sightlineState = Object.assign({ preset: key }, presets[key]);
                drawSightlineLab();
            }
        });
    });

    drawSightlineLab();

    // -------------------------------------------------------------------------
    // 6. PUBLICATIONS — Expandable Abstract Drawer & One-Click BibTeX Copy
    // -------------------------------------------------------------------------
    const abstractToggleBtn = document.getElementById('toggle-apj-abstract');
    const abstractDrawer = document.getElementById('apj-abstract-drawer');
    if (abstractToggleBtn && abstractDrawer) {
        abstractToggleBtn.addEventListener('click', () => {
            const isOpen = abstractDrawer.classList.toggle('open');
            abstractToggleBtn.textContent = isOpen ? 'Hide Abstract' : 'Read Abstract';
        });
    }

    const copyBibtexBtn = document.getElementById('copy-apj-bibtex');
    if (copyBibtexBtn) {
        const bibtexStr = `@article{Bharadwaj2026,
  author = {Bharadwaj, Sumukha R. and Narayanan, Anand and Muzahid, Sowgat and Charlton, Jane C. and Cantalupo, Sebastiano},
  title = {A Partial Lyman Limit Absorber Tracing Cold-Mode Accretion},
  journal = {The Astrophysical Journal},
  volume = {1008},
  pages = {155},
  year = {2026},
  doi = {10.3847/1538-4357/ae853b},
  eprint = {2608.09418},
  archivePrefix = {arXiv}
}`;
        copyBibtexBtn.addEventListener('click', () => {
            copyTextToClipboard(bibtexStr, 'BibTeX citation copied to clipboard');
        });
    }

    // -------------------------------------------------------------------------
    // 7. LIVE LAMBDA-CDM COSMOLOGY CALCULATOR WORKBENCH (#software)
    // -------------------------------------------------------------------------
    const zInput = document.getElementById('cosmo-z');
    const h0Input = document.getElementById('cosmo-h0');
    const omInput = document.getElementById('cosmo-om');
    const olInput = document.getElementById('cosmo-ol');
    const cosmoPresetBtns = document.querySelectorAll('.cosmo-z-preset');

    function computeCosmology() {
        if (!zInput || !h0Input || !omInput || !olInput) return;
        const z = Math.max(0, Math.min(25, parseFloat(zInput.value) || 0.87641));
        const H0 = Math.max(20, Math.min(120, parseFloat(h0Input.value) || 67.74));
        const Om = Math.max(0.01, Math.min(1.5, parseFloat(omInput.value) || 0.3089));
        const OL = Math.max(0.0, Math.min(1.5, parseFloat(olInput.value) || 0.6911));
        const Ok = 1.0 - Om - OL;

        const c_kms = 299792.458;
        const dh_Mpc = c_kms / H0; // Hubble distance in Mpc
        const th_Gyr = 977.792 / H0; // Hubble time in Gyr

        function E(zp) {
            return Math.sqrt(Math.max(1e-8, Om * Math.pow(1 + zp, 3) + Ok * Math.pow(1 + zp, 2) + OL));
        }

        // Numerical integration via Simpson's rule
        const N = 400;
        const dz = z / N;
        let dcInt = 0;
        let tlbInt = 0;
        for (let i = 0; i <= N; i++) {
            const zp = i * dz;
            const w = (i === 0 || i === N) ? 1 : (i % 2 === 1 ? 4 : 2);
            const ez = E(zp);
            dcInt += w * (1.0 / ez);
            tlbInt += w * (1.0 / ((1.0 + zp) * ez));
        }
        dcInt *= (dz / 3.0);
        tlbInt *= (dz / 3.0);

        // Integrate from z to z_max=1000 for age at z
        const zMax = 1200;
        const dzAge = (zMax - z) / N;
        let ageZInt = 0;
        for (let i = 0; i <= N; i++) {
            const zp = z + i * dzAge;
            const w = (i === 0 || i === N) ? 1 : (i % 2 === 1 ? 4 : 2);
            ageZInt += w * (1.0 / ((1.0 + zp) * E(zp)));
        }
        ageZInt *= (dzAge / 3.0);

        const Dc = dh_Mpc * dcInt;
        const Da = Dc / (1.0 + z);
        const Dl = Dc * (1.0 + z);
        const tLb = th_Gyr * tlbInt;
        const tAgeZ = th_Gyr * ageZInt;
        const tUniv = tLb + tAgeZ;
        const tCmb = 2.72548 * (1.0 + z);
        const kpcPerArcsec = (Da * 1000.0) / 206264.806;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setVal('res-tuniv', `${tUniv.toFixed(2)} Gyr`);
        setVal('res-tlb', `${tLb.toFixed(2)} Gyr`);
        setVal('res-dc', `${Dc.toFixed(1)} Mpc`);
        setVal('res-da', `${Da.toFixed(1)} Mpc`);
        setVal('res-dl', `${Dl.toFixed(1)} Mpc`);
        setVal('res-scale', `${kpcPerArcsec.toFixed(2)} kpc/″ · ${tCmb.toFixed(2)} K`);
    }

    [zInput, h0Input, omInput, olInput].forEach(inp => {
        if (inp) inp.addEventListener('input', computeCosmology);
    });

    cosmoPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const zv = btn.getAttribute('data-z');
            if (zInput && zv) {
                zInput.value = zv;
                computeCosmology();
            }
        });
    });

    computeCosmology();

    // -------------------------------------------------------------------------
    // 8. EMAIL COPY BUTTONS IN CONTACT SECTION
    // -------------------------------------------------------------------------
    document.querySelectorAll('.copy-email-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            if (email) copyTextToClipboard(email, `Copied ${email}`);
        });
    });

    // -------------------------------------------------------------------------
    // 9. TELESCOPE GALLERY INFINITE TRACK & LIGHTBOX
    // -------------------------------------------------------------------------
    const galleryTrack = document.getElementById('gallery-track');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    let activeIndex = 0;
    const galleryThumbnails = galleryTrack ? Array.from(galleryTrack.querySelectorAll('.gallery-img')) : [];

    function openLightbox(idx) {
        if (!lightbox || !lightboxImg || galleryThumbnails.length === 0) return;
        activeIndex = (idx + galleryThumbnails.length) % galleryThumbnails.length;
        lightboxImg.src = galleryThumbnails[activeIndex].src;
        lightbox.classList.add('active');
        window.isLightboxOpen = true;
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        window.isLightboxOpen = false;
    }

    galleryThumbnails.forEach((img, idx) => {
        img.addEventListener('click', () => openLightbox(idx));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    const lbPrev = document.getElementById('lightbox-prev');
    const lbNext = document.getElementById('lightbox-next');
    if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(activeIndex - 1); });
    if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(activeIndex + 1); });

    document.addEventListener('keydown', (e) => {
        if (!window.isLightboxOpen) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') openLightbox(activeIndex + 1);
        if (e.key === 'ArrowLeft') openLightbox(activeIndex - 1);
    });

    if (galleryTrack && galleryThumbnails.length > 0) {
        let posX = 0;
        let isHovering = false;
        let vel = 0;
        const container = document.querySelector('.gallery-container');
        if (container) {
            container.addEventListener('mouseenter', () => isHovering = true);
            container.addEventListener('mouseleave', () => isHovering = false);
        }
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        if (prevBtn) prevBtn.addEventListener('click', () => vel -= 16);
        if (nextBtn) nextBtn.addEventListener('click', () => vel += 16);

        function stepGallery() {
            if (!window.isLightboxOpen) {
                const base = isHovering ? 0 : 0.35;
                posX -= (base + vel);
                vel *= 0.9;
                if (Math.abs(vel) < 0.01) vel = 0;
                const halfWidth = galleryTrack.scrollWidth / 2;
                if (halfWidth > 0) {
                    if (posX <= -halfWidth) posX += halfWidth;
                    if (posX > 0) posX -= halfWidth;
                }
                galleryTrack.style.transform = `translate3d(${posX}px, 0, 0)`;
            }
            requestAnimationFrame(stepGallery);
        }
        requestAnimationFrame(stepGallery);
    }
});
