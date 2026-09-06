/* ═══════════════════════════════════════════════════════════
   THE KITE PRESCHOOL — Script v5 — Multi-page & Carousel
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initRevealAnimations();
    initNavigation();
    initKiteString();
    initCountUp();
    initParallaxDecor();
    initValuesCarousel();
    initInteractiveCards();
    initMouseParallax();
});

/* ──────────────────────────────────────────
   REVEAL ON SCROLL (Bouncy)
   ────────────────────────────────────────── */
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-bounce, .reveal-text');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.style.animationDelay || '0s';
                const delayMs = parseFloat(delay) * 1000;
                setTimeout(() => entry.target.classList.add('visible'), delayMs);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────
   NAVIGATION
   ────────────────────────────────────────── */
function initNavigation() {
    const nav = document.getElementById('main-nav');
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.pageYOffset > 20);
    }, { passive: true });

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
        });
    }
}

/* ──────────────────────────────────────────
   KITE STRING & SCROLLING ELEMENT
   ────────────────────────────────────────── */
function initKiteString() {
    const svg = document.getElementById('kite-string');
    const path = document.getElementById('kite-string-path');
    const scroller = document.querySelector('.scrolling-element');
    if (!svg || !path || !scroller) return;

    let pathLength = 0;

    function buildPath() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        const footer = document.getElementById('footer');
        
        // Stop animation 150px above the footer, or near bottom of document
        const endY = footer ? footer.offsetTop - 150 : docH - 150;

        svg.setAttribute('viewBox', `0 0 ${vw} ${docH}`);
        svg.style.width = vw + 'px';
        svg.style.height = docH + 'px';

        // Check if scroller has a specific start position data attribute
        const startX = parseFloat(scroller.dataset.startX || '0.75');
        const startY = parseFloat(scroller.dataset.startY || '0.65');
        
        const startPointY = vh * startY;
        const distance = endY - startPointY;
        
        // Generate points dynamically based on distance to footer
        const pts = [];
        pts.push({ x: vw * startX, y: startPointY });
        
        // Create 4 intermediate points for a wavy path down to the footer
        pts.push({ x: vw * 0.5, y: startPointY + (distance * 0.2) });
        pts.push({ x: vw * 0.2, y: startPointY + (distance * 0.45) });
        pts.push({ x: vw * 0.8, y: startPointY + (distance * 0.7) });
        pts.push({ x: vw * 0.4, y: endY });

        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 1; i < pts.length; i++) {
            const p = pts[i - 1], c = pts[i];
            const cx1 = p.x + (c.x - p.x) * 0.5, cy1 = p.y;
            const cx2 = c.x - (c.x - p.x) * 0.5, cy2 = c.y;
            d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${c.x} ${c.y}`;
        }

        path.setAttribute('d', d);
        if (path.getTotalLength) {
            pathLength = path.getTotalLength();
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = pathLength;
        }
    }

    function updateScroll() {
        if (pathLength === 0 || window.innerWidth <= 768) return; 
        
        const scrollY = window.pageYOffset;
        const viewH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        
        const rawProgress = scrollY / (docH - viewH);
        const progress = Math.max(0, Math.min(rawProgress * 1.1, 1));
        
        path.style.strokeDashoffset = pathLength * (1 - Math.min(progress, 1));
        
        if (progress <= 1) {
            const point = path.getPointAtLength(progress * pathLength);
            const nextPoint = path.getPointAtLength(Math.min((progress + 0.01) * pathLength, pathLength));
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
            const sway = Math.sin(scrollY * 0.05) * 5;
            
            const noRotate = scroller.dataset.noRotate === 'true';
            const finalAngle = noRotate ? sway : (angle - 90 + sway);
            
            scroller.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${finalAngle}deg)`;
            scroller.style.opacity = '1';
        } else {
            scroller.style.opacity = '0';
        }
    }

    window.addEventListener('scroll', () => requestAnimationFrame(updateScroll), { passive: true });
    window.addEventListener('resize', () => {
        buildPath();
        updateScroll();
    });
    
    buildPath();
    setTimeout(updateScroll, 100);
}

/* ──────────────────────────────────────────
   COUNT UP
   ────────────────────────────────────────── */
function initCountUp() {
    const counters = document.querySelectorAll('.philosophy__stat-number[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                animateCount(el, 0, target, 2000);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCount(el, start, end, duration) {
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const safeEased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (end - start) * safeEased) + (el.dataset.plus ? '+' : '');
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ──────────────────────────────────────────
   PARALLAX FOR DECORATIVE ELEMENTS
   ────────────────────────────────────────── */
function initParallaxDecor() {
    const elements = document.querySelectorAll('.decor > *');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const s = window.pageYOffset;
                elements.forEach((el, i) => {
                    const speed = 0.02 + ((i % 5) * 0.015);
                    el.style.transform = `translateY(${-s * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ──────────────────────────────────────────
   VALUES CAROUSEL
   ────────────────────────────────────────── */
function initValuesCarousel() {
    const items = document.querySelectorAll('.value-item');
    const images = document.querySelectorAll('.values__image');
    if (!items.length || !images.length) return;

    let currentIndex = 1;
    const totalItems = items.length;
    let autoRotateInterval;

    function activateIndex(index) {
        items.forEach(item => item.classList.remove('active'));
        images.forEach(img => img.classList.remove('active'));

        const targetItem = document.querySelector(`.value-item[data-index="${index}"]`);
        const targetImage = document.querySelector(`.values__image[data-index="${index}"]`);

        if (targetItem) targetItem.classList.add('active');
        if (targetImage) targetImage.classList.add('active');
        currentIndex = index;
    }

    function nextItem() {
        let nextIndex = currentIndex + 1;
        if (nextIndex > totalItems) nextIndex = 1;
        activateIndex(nextIndex);
    }

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateInterval = setInterval(nextItem, 3500);
    }

    function stopAutoRotate() {
        if (autoRotateInterval) clearInterval(autoRotateInterval);
    }

    // Manual click handling
    items.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index, 10);
            activateIndex(index);
            // Reset timer so it doesn't jump immediately after click
            startAutoRotate();
        });
    });

    // Start rotation if section is visible
    const carouselSection = document.getElementById('values');
    if (carouselSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startAutoRotate();
            } else {
                stopAutoRotate();
            }
        }, { threshold: 0.2 });
        observer.observe(carouselSection);
    }
}

/* ──────────────────────────────────────────
   INTERACTIVE CARDS (3D TILT)
   ────────────────────────────────────────── */
function initInteractiveCards() {
    const cards = document.querySelectorAll('.class-card, .gallery-section__item');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.zIndex = '1';
        });
    });
}

/* ──────────────────────────────────────────
   MOUSE PARALLAX DECOR
   ────────────────────────────────────────── */
function initMouseParallax() {
    const decorElements = document.querySelectorAll('.decor > *');
    
    window.addEventListener('mousemove', e => {
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        decorElements.forEach((el, index) => {
            const speed = (index % 3 + 1) * 20;
            const x = mouseX * speed;
            const y = mouseY * speed;
            
            // Apply mouse parallax on top of existing transform
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
    }, { passive: true });
}
