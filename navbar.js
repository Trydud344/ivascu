(function () {
    const styleId = 'navbar-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            nav-bar {
                position: sticky;
                top: 24px;
                z-index: 100;
                display: flex;
                justify-content: center;
                padding: 0 24px 24px;
            }

            .nav-bar {
                position: relative;
                display: flex;
                align-items: center;
                padding: 6px;
                border-radius: 100px;
                will-change: transform;
            }

            .nav-bg {
                position: absolute;
                inset: 0;
                border-radius: 100px;
                background: #181818;
                box-shadow:
                    0 4px 20px rgba(0, 0, 0, 0.3),
                    0 1px 3px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
                transition: opacity 0.3s ease;
                pointer-events: none;
            }

            .nav-bg.minimal { opacity: 0 }

            .nav-highlight {
                position: absolute;
                top: 6px;
                height: calc(100% - 12px);
                width: 64px;
                background: #ffffff;
                border-radius: 100px;
                pointer-events: none;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
                z-index: 1;
                will-change: transform, left;
            }

            .nav-item {
                position: relative;
                z-index: 2;
                padding: 12px 24px;
                color: #ffffff;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                letter-spacing: -0.01em;
                mix-blend-mode: difference;
                will-change: padding;
            }

            .nav-item svg {
                width: 18px;
                height: 18px;
                display: block;
                color: inherit;
            }
        `;
        document.head.appendChild(style);
    }

    class NavBar extends HTMLElement {
        connectedCallback() {
            this.innerHTML = `
                <div class="nav-bar">
                    <div class="nav-bg" id="navBg"></div>
                    <div class="nav-highlight" id="highlight"></div>
                    <div class="nav-item active" data-index="0" data-href="/">home</div>
                    <div class="nav-item" data-index="1" data-href="/camera-roll">camera roll</div>
                    <div class="nav-item" data-index="2" data-href="/music">music</div>
                    <div class="nav-item" data-index="3" data-href="/inspiration-wall">inspiration wall</div>
                    <div class="nav-item" data-index="4" data-href="/guestbook">guestbook</div>
                    <div class="nav-item" data-index="5" data-href="/color-palette">color palette</div>
                </div>
            `;

            const root = this;
            const navBar = this.querySelector('.nav-bar');
            const highlight = this.querySelector('#highlight');
            const navItems = this.querySelectorAll('.nav-item');
            const navBg = this.querySelector('#navBg');
            const defaultWidth = 64;
            const pad = 6;

            gsap.set(highlight, { left: 12, width: defaultWidth });

            requestAnimationFrame(() => {
                const active = this.querySelector('.nav-item.active');
                if (!active) return;
                const w = active.offsetWidth;
                const r = active.getBoundingClientRect();
                const b = navBar.getBoundingClientRect();
                gsap.set(highlight, { left: r.left - b.left, width: w });
            });

            navBar.addEventListener('mousedown', () => {
                gsap.to(highlight, {
                    scale: 1.18,
                    duration: 0.12,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            navBar.addEventListener('mouseup', () => {
                gsap.to(highlight, {
                    scale: 1,
                    duration: 0.15,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            navBar.addEventListener('mouseleave', () => {
                gsap.to(highlight, {
                    scale: 1,
                    duration: 0.15,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            navBar.addEventListener('mousemove', (e) => {
                const bar = navBar.getBoundingClientRect();
                const cursorX = e.clientX - bar.left;

                let closest = null;
                let minDist = Infinity;
                navItems.forEach(item => {
                    const r = item.getBoundingClientRect();
                    const center = r.left - bar.left + r.width / 2;
                    const dist = Math.abs(cursorX - center);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = { center, width: item.offsetWidth };
                    }
                });

                if (!closest) return;

                const influence = closest.width;
                const norm = gsap.utils.clamp(0, 1)(minDist / influence);
                const pull = Math.sqrt(1 - norm);

                const targetWidth = defaultWidth + (closest.width - defaultWidth) * pull;
                const freeLeft = gsap.utils.clamp(pad, navBar.offsetWidth - targetWidth - pad)(cursorX - targetWidth / 2);
                const snapLeft = closest.center - targetWidth / 2;
                const blended = freeLeft + (snapLeft - freeLeft) * pull;
                const clamped = gsap.utils.clamp(pad, navBar.offsetWidth - targetWidth - pad)(blended);

                gsap.to(highlight, {
                    left: clamped,
                    width: targetWidth,
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            function setActiveByPath(path) {
              navItems.forEach((ni) => {
                const href = ni.getAttribute('data-href');
                ni.classList.toggle('active', href === path);
              });
            }

            setActiveByPath(window.location.pathname);

            navBar.addEventListener('click', (e) => {
              const item = e.target.closest('.nav-item');
              if (!item) return;
              const href = item.getAttribute('data-href');
              if (!href || href === window.location.pathname) return;
              history.pushState(null, '', href);
              setActiveByPath(href);
              window.dispatchEvent(new PopStateEvent('popstate'));
            });

            let isMinimal = false;
            let lastScrollY = 0;

            function setMinimal(should) {
                if (should && !isMinimal) {
                    isMinimal = true;
                    navBg.classList.add('minimal');
                    gsap.to(highlight, { opacity: 0, duration: 0.08, ease: "power2.in" });
                    gsap.to(navBar, { scale: 0.92, duration: 0.3, ease: "power2.out" });
                    navItems.forEach(item => gsap.to(item, { padding: "12px 14px", duration: 0.3, ease: "power2.out" }));
                } else if (!should && isMinimal) {
                    isMinimal = false;
                    navBg.classList.remove('minimal');
                    gsap.to(navBar, { scale: 1, duration: 0.3, ease: "power2.out" });
                    navItems.forEach(item => gsap.to(item, { padding: "12px 24px", duration: 0.3, ease: "power2.out" }));
                    gsap.to(highlight, { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.15 });
                }
            }

            window.addEventListener('scroll', () => {
                const dir = window.scrollY - lastScrollY;
                lastScrollY = window.scrollY;
                if (dir > 0 && window.scrollY > 100) setMinimal(true);
                else if (dir < 0) setMinimal(false);
            }, { passive: true });

            root.addEventListener('mouseenter', () => {
                if (isMinimal) {
                    navBg.classList.remove('minimal');
                    gsap.to(navBar, { scale: 1, duration: 0.3, ease: "power2.out" });
                    navItems.forEach(item => gsap.to(item, { padding: "12px 24px", duration: 0.3, ease: "power2.out" }));
                    gsap.to(highlight, { opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1 });
                }
            });

            root.addEventListener('mouseleave', () => {
                if (isMinimal) {
                    navBg.classList.add('minimal');
                    gsap.to(navBar, { scale: 0.92, duration: 0.3, ease: "power2.out" });
                    navItems.forEach(item => gsap.to(item, { padding: "12px 14px", duration: 0.3, ease: "power2.out" }));
                    gsap.to(highlight, { opacity: 0, duration: 0.08, ease: "power2.in" });
                }
            });
        }
    }

    customElements.define('nav-bar', NavBar);
})();
