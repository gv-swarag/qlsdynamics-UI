/* ============================================
   QLSDynamics.ai — Client-Side JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initNavbar();
    initSmoothScroll();
    initScrollReveal();
    initMobileMenu();
    initCounters();
    initContactForm();
    initProductTabs();
    initLightbox();
    initScrollSpy();
    initCustomSelect();
});

/* ---- Custom Multi-Select Logic ---- */
function initCustomSelect() {
    const customSelect = document.getElementById('interest-select');
    if (!customSelect) return;

    const trigger = customSelect.querySelector('.select-trigger');
    const optionsContainer = customSelect.querySelector('.select-options');
    const checkboxes = customSelect.querySelectorAll('input[type="checkbox"]');
    const placeholder = customSelect.querySelector('.placeholder');
    const selectedText = customSelect.querySelector('.selected-text');
    const hiddenInput = document.getElementById('interest-hidden');

    if (!trigger || !hiddenInput) return;

    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customSelect.classList.toggle('active');
    });

    // Handle checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectedDisplay();
        });
    });

    function updateSelectedDisplay() {
        const selectedItems = Array.from(checkboxes)
            .filter(i => i.checked);

        const selectedLabels = selectedItems.map(i => i.nextElementSibling.textContent.trim());
        const selectedValues = selectedItems.map(i => i.value);

        hiddenInput.value = selectedValues.join(',');

        if (selectedLabels.length > 0) {
            placeholder.style.display = 'none';
            selectedText.style.display = 'block';
            selectedText.textContent = selectedLabels.length === 1
                ? selectedLabels[0]
                : `${selectedLabels.length} solutions selected`;
        } else {
            placeholder.style.display = 'block';
            selectedText.style.display = 'none';
        }
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('active');
        }
    });

    // Reset support
    const form = customSelect.closest('form');
    if (form) {
        form.addEventListener('reset', () => {
            setTimeout(updateSelectedDisplay, 0);
        });
    }
}

/* ---- Lightbox Logic ---- */
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const zoomableImages = document.querySelectorAll('.feature-image-wrapper img, .product-img-container img');

    if (!lightbox || !lightboxImg || !zoomableImages.length) return;

    zoomableImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.src = img.src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!lightbox.classList.contains('show')) {
                lightboxImg.src = '';
            }
        }, 400);
    };

    // Close when clicking anywhere on the lightbox
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', closeLightbox);

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('show')) {
            closeLightbox();
        }
    });
}

/* ---- Particle / Grid Canvas Animation ---- */
function initParticleCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles, mouse;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resize();
    mouse = { x: width / 2, y: height / 2 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x -= dx * 0.01;
                this.y -= dy * 0.01;
            }

            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 8000), 150);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawConnections();
        requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener('resize', () => {
        resize();
        const count = Math.min(Math.floor((width * height) / 8000), 150);
        while (particles.length < count) particles.push(new Particle());
        while (particles.length > count) particles.pop();
    });
}

/* ---- Navbar Scroll Behavior ---- */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ---- Smooth Scrolling ---- */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });

                document.querySelector('.nav-links')?.classList.remove('open');
                document.querySelector('.hamburger')?.classList.remove('active');
            }
        });
    });
}

/* ---- Scroll Reveal ---- */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ---- Mobile Menu ---- */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });
}

/* ---- Animated Counters ---- */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                entry.target.dataset.counted = 'true';
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = prefix + current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = prefix + target + suffix;
        }
    }

    requestAnimationFrame(update);
}

/* ---- Contact Form ---- */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.querySelector('.form-success');
    if (!form || !successMsg) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.btn-submit');
        if (!btn) return;

        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        // Simulate a network delay
        setTimeout(() => {
            // Force visibility of success message and hide form
            form.style.display = 'none';
            successMsg.style.display = 'block'; // Explicitly set display
            successMsg.classList.add('show');

            // Reset form for future use
            form.reset();
            btn.textContent = originalText;
            btn.disabled = false;

            // Reset custom multi-select
            initCustomSelectDisplayReset();
        }, 1200);
    });

    const resetBtn = document.getElementById('btn-reset-form');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            successMsg.classList.remove('show');
            successMsg.style.display = 'none';
            form.style.display = 'grid';

            // Re-trigger scroll reveal if needed (it should already be visible)
            form.classList.add('visible');
        });
    }
}

function initCustomSelectDisplayReset() {
    const placeholder = document.querySelector('#interest-select .placeholder');
    const selectedText = document.querySelector('#interest-select .selected-text');
    const hiddenInput = document.getElementById('interest-hidden');
    const checkboxes = document.querySelectorAll('#interest-select input[type="checkbox"]');

    if (placeholder) placeholder.style.display = 'block';
    if (selectedText) {
        selectedText.style.display = 'none';
        selectedText.textContent = '';
    }
    if (hiddenInput) hiddenInput.value = '';
    checkboxes.forEach(cb => cb.checked = false);
}

/* ---- Product Tabs ---- */
function initProductTabs() {
    const tabs = document.querySelectorAll('.product-tab');
    const categories = document.querySelectorAll('.product-category');

    if (!tabs.length || !categories.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            categories.forEach(cat => {
                if (cat.id === `tab-${target}`) {
                    cat.classList.add('active');
                } else {
                    cat.classList.remove('active');
                }
            });
        });
    });
}

/* ---- Scroll Spy & Active Glow (Using IntersectionObserver) ---- */
function initScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    const options = {
        threshold: 0.3,
        rootMargin: "-10% 0px -40% 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            if (!id) return;

            if (entry.isIntersecting) {
                if (!entry.target.classList.contains('active-section')) {
                    sections.forEach(s => s.classList.remove('active-section'));
                    navLinks.forEach(link => link.classList.remove('active'));

                    entry.target.classList.add('active-section');
                    const activeNavLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                    if (activeNavLink) activeNavLink.classList.add('active');
                }
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));
}
