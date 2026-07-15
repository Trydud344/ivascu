(function () {
    const STYLE_ID = 'navbar-styles';

    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
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
                background: rgba(255, 255, 255, 0.12);
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
                will-change: padding;
            }

            .nav-item.active { font-weight: 700 }

            .nav-item svg {
                width: 18px;
                height: 18px;
                display: block;
                color: inherit;
            }
        `;
        document.head.appendChild(style);
    }

    // ── Animation Constants ──────────────────────────────────────────────
    const HIGHLIGHT_DEFAULT_WIDTH = 64;
    const HIGHLIGHT_INSET = 6;
    const MINIMAL_SCALE = 0.92;
    const EXPANDED_PADDING = '12px 24px';
    const COLLAPSED_PADDING = '12px 14px';
    const SCROLL_THRESHOLD = 100;
    const CONTRAST_CHECK_INTERVAL_MS = 120;
    const LUMINANCE_BRIGHT_THRESHOLD = 0.6;
    const IMAGE_SAMPLE_SIZE = 64;
    const COLOR_WHITE = '#ffffff';
    const COLOR_BLACK = '#000000';
    const EASE_OUT = 'power2.out';
    const EASE_IN = 'power2.in';

    const NAV_ITEMS_CONFIG = [
        { label: 'home', href: '/' },
        { label: 'camera roll', href: '/camera-roll' },
        { label: 'music', href: '/music' },
        { label: 'inspiration wall', href: '/inspiration-wall' },
        { label: 'guestbook', href: '/guestbook' },
        { label: 'color palette', href: '/color-palette' },
        { label: 'test', href: '/test' },
    ];

    // ── Image Luminance Sampling ─────────────────────────────────────────
    const imageCanvasCache = new WeakMap();

    function getOrCreateCanvasForImage(image) {
        if (imageCanvasCache.has(image)) return imageCanvasCache.get(image);

        const canvas = document.createElement('canvas');
        canvas.width = IMAGE_SAMPLE_SIZE;
        canvas.height = IMAGE_SAMPLE_SIZE;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, IMAGE_SAMPLE_SIZE, IMAGE_SAMPLE_SIZE);

        const cached = { context, size: IMAGE_SAMPLE_SIZE };
        imageCanvasCache.set(image, cached);
        return cached;
    }

    /**
     * Converts pixel RGB to relative luminance (0 = black, 1 = white)
     * using the ITU-R BT.601 luma formula.
     */
    function calculateRelativeLuminance(red, green, blue) {
        return (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    }

    /**
     * Maps a viewport coordinate onto an image's natural pixel space,
     * accounting for CSS `object-fit: cover` cropping.
     */
    function mapViewportToNormalizedImageCoords(image, viewportX, viewportY) {
        const imageRect = image.getBoundingClientRect();
        const objectFit = getComputedStyle(image).objectFit || 'fill';

        if (objectFit !== 'cover') {
            return {
                normalizedX: (viewportX - imageRect.left) / imageRect.width,
                normalizedY: (viewportY - imageRect.top) / imageRect.height,
            };
        }

        const elementAspect = imageRect.width / imageRect.height;
        const imageAspect = image.naturalWidth / image.naturalHeight;

        let renderedWidth, renderedHeight, offsetX, offsetY;
        if (imageAspect > elementAspect) {
            renderedHeight = imageRect.height;
            renderedWidth = imageRect.height * imageAspect;
            offsetX = (imageRect.width - renderedWidth) / 2;
            offsetY = 0;
        } else {
            renderedWidth = imageRect.width;
            renderedHeight = imageRect.width / imageAspect;
            offsetX = 0;
            offsetY = (imageRect.height - renderedHeight) / 2;
        }

        return {
            normalizedX: (viewportX - imageRect.left - offsetX) / renderedWidth,
            normalizedY: (viewportY - imageRect.top - offsetY) / renderedHeight,
        };
    }

    function sampleImageLuminance(image, viewportX, viewportY) {
        if (!image.complete || !image.naturalWidth) return null;

        let { normalizedX, normalizedY } = mapViewportToNormalizedImageCoords(image, viewportX, viewportY);
        normalizedX = Math.max(0, Math.min(1, normalizedX));
        normalizedY = Math.max(0, Math.min(1, normalizedY));

        try {
            const { context, size } = getOrCreateCanvasForImage(image);
            const pixelData = context.getImageData(
                Math.round(normalizedX * (size - 1)),
                Math.round(normalizedY * (size - 1)),
                1, 1
            ).data;
            return calculateRelativeLuminance(pixelData[0], pixelData[1], pixelData[2]);
        } catch {
            return null;
        }
    }

    // ── Background Color Parsing ─────────────────────────────────────────
    const RGBA_PATTERN = /rgba?\((\d+)\s*,?\s*(\d+)\s*,?\s*(\d+)(?:\s*,?\s*([\d.]+))?\)/;
    const MIN_OPACITY_FOR_SAMPLE = 0.1;

    function parseRGBA(colorString) {
        const match = colorString.match(RGBA_PATTERN);
        if (!match) return null;
        return {
            red: +match[1],
            green: +match[2],
            blue: +match[3],
            alpha: match[4] ? +match[4] : 1,
        };
    }

    /**
     * Walks the DOM element stack at a viewport point, returning the
     * luminance of the first opaque-enough surface it finds (image or
     * background color).
     */
    function sampleLuminanceAtPoint(viewportX, viewportY) {
        const elementsAtPoint = document.elementsFromPoint(viewportX, viewportY);

        for (const element of elementsAtPoint) {
            if (element.tagName === 'BODY' || element.tagName === 'HTML') continue;

            if (element.tagName === 'IMG') {
                const luminance = sampleImageLuminance(element, viewportX, viewportY);
                if (luminance !== null) return luminance;
                continue;
            }

            const backgroundColor = getComputedStyle(element).backgroundColor;
            const rgba = parseRGBA(backgroundColor);
            if (rgba && rgba.alpha > MIN_OPACITY_FOR_SAMPLE) {
                return calculateRelativeLuminance(rgba.red, rgba.green, rgba.blue);
            }
        }

        return null;
    }

    // ── NavBar Web Component ─────────────────────────────────────────────
    class NavBar extends HTMLElement {
        connectedCallback() {
            this.renderTemplate();
            this.cacheElements();
            this.initializeHighlightPosition();
            this.bindMouseInteractions();
            this.bindNavigation();
            this.initializeScrollBehavior();
            this.initializeContrastDetection();
        }

        renderTemplate() {
            const itemsHTML = NAV_ITEMS_CONFIG.map((item, index) => {
                const activeClass = index === 0 ? ' active' : '';
                return `<div class="nav-item${activeClass}" data-index="${index}" data-href="${item.href}">${item.label}</div>`;
            }).join('\n                    ');

            this.innerHTML = `
                <div class="nav-bar">
                    <div class="nav-bg" id="navBg"></div>
                    <div class="nav-highlight" id="highlight"></div>
                    ${itemsHTML}
                </div>
            `;
        }

        cacheElements() {
            this.navBarElement = this.querySelector('.nav-bar');
            this.highlight = this.querySelector('#highlight');
            this.navItems = this.querySelectorAll('.nav-item');
            this.navBackground = this.querySelector('#navBg');
            this.isMinimal = false;
            this.lastScrollY = 0;
            this.currentTextColor = COLOR_WHITE;
            this.lastContrastCheckTime = 0;
        }

        // ── Highlight Positioning ────────────────────────────────────────

        initializeHighlightPosition() {
            gsap.set(this.highlight, { left: 12, width: HIGHLIGHT_DEFAULT_WIDTH });

            requestAnimationFrame(() => {
                const activeItem = this.querySelector('.nav-item.active');
                if (!activeItem) return;
                this.snapHighlightToItem(activeItem);
            });
        }

        snapHighlightToItem(item) {
            const itemRect = item.getBoundingClientRect();
            const barRect = this.navBarElement.getBoundingClientRect();
            gsap.set(this.highlight, {
                left: itemRect.left - barRect.left,
                width: item.offsetWidth,
            });
        }

        // ── Mouse Interactions ───────────────────────────────────────────

        bindMouseInteractions() {
            this.navBarElement.addEventListener('mousedown', () => this.animateHighlightScale(1.18, 0.12));
            this.navBarElement.addEventListener('mouseup', () => this.animateHighlightScale(1, 0.15));
            this.navBarElement.addEventListener('mouseleave', () => this.animateHighlightScale(1, 0.15));
            this.navBarElement.addEventListener('mousemove', (event) => this.handleHighlightTracking(event));
        }

        animateHighlightScale(targetScale, duration) {
            gsap.to(this.highlight, {
                scale: targetScale,
                duration,
                ease: EASE_OUT,
                overwrite: 'auto',
            });
        }

        handleHighlightTracking(event) {
            const barRect = this.navBarElement.getBoundingClientRect();
            const cursorX = event.clientX - barRect.left;
            const closestItem = this.findClosestNavItem(barRect, cursorX);
            if (!closestItem) return;

            const influenceZone = closestItem.width;
            const normalizedDistance = gsap.utils.clamp(0, 1)(closestItem.distanceToCursor / influenceZone);
            const pullStrength = Math.sqrt(1 - normalizedDistance);

            const targetWidth = HIGHLIGHT_DEFAULT_WIDTH + (closestItem.width - HIGHLIGHT_DEFAULT_WIDTH) * pullStrength;
            const barWidth = this.navBarElement.offsetWidth;
            const clampPosition = gsap.utils.clamp(HIGHLIGHT_INSET, barWidth - targetWidth - HIGHLIGHT_INSET);

            const freeFollowLeft = clampPosition(cursorX - targetWidth / 2);
            const snapToItemLeft = closestItem.centerX - targetWidth / 2;
            const blendedLeft = freeFollowLeft + (snapToItemLeft - freeFollowLeft) * pullStrength;

            gsap.to(this.highlight, {
                left: clampPosition(blendedLeft),
                width: targetWidth,
                duration: 0.35,
                ease: EASE_OUT,
                overwrite: 'auto',
            });
        }

        findClosestNavItem(barRect, cursorX) {
            let closest = null;
            let minimumDistance = Infinity;

            this.navItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                const centerX = itemRect.left - barRect.left + itemRect.width / 2;
                const distance = Math.abs(cursorX - centerX);

                if (distance < minimumDistance) {
                    minimumDistance = distance;
                    closest = { centerX, width: item.offsetWidth, distanceToCursor: distance };
                }
            });

            return closest;
        }

        // ── Client-Side Navigation ───────────────────────────────────────

        bindNavigation() {
            this.setActiveItemByPath(window.location.pathname);

            this.navBarElement.addEventListener('click', (event) => {
                const clickedItem = event.target.closest('.nav-item');
                if (!clickedItem) return;

                const href = clickedItem.getAttribute('data-href');
                if (!href || href === window.location.pathname) return;

                history.pushState(null, '', href);
                this.setActiveItemByPath(href);
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }

        setActiveItemByPath(path) {
            this.navItems.forEach(item => {
                const href = item.getAttribute('data-href');
                item.classList.toggle('active', href === path);
            });
        }

        // ── Scroll-Driven Minimal Mode ───────────────────────────────────

        initializeScrollBehavior() {
            window.addEventListener('scroll', () => {
                const scrollDirection = window.scrollY - this.lastScrollY;
                this.lastScrollY = window.scrollY;

                const shouldMinimize = scrollDirection > 0 && window.scrollY > SCROLL_THRESHOLD;
                const shouldExpand = scrollDirection < 0;

                if (shouldMinimize) this.transitionToMinimal();
                else if (shouldExpand) this.transitionToExpanded();

                this.updateNavContrast();
            }, { passive: true });

            this.addEventListener('mouseenter', () => {
                if (this.isMinimal) this.temporarilyExpand();
            });

            this.addEventListener('mouseleave', () => {
                if (this.isMinimal) this.temporarilyCollapse();
            });
        }

        transitionToMinimal() {
            if (this.isMinimal) return;
            this.isMinimal = true;
            this.navBackground.classList.add('minimal');
            gsap.to(this.highlight, { opacity: 0, duration: 0.08, ease: EASE_IN });
            this.animateBarLayout(MINIMAL_SCALE, COLLAPSED_PADDING);
            this.updateNavContrast();
        }

        transitionToExpanded() {
            if (!this.isMinimal) return;
            this.isMinimal = false;
            this.navBackground.classList.remove('minimal');
            this.animateBarLayout(1, EXPANDED_PADDING);
            gsap.to(this.highlight, { opacity: 1, duration: 0.6, ease: EASE_OUT, delay: 0.15 });
            this.updateNavContrast();
        }

        /** Hover-expand while logically still in minimal state. */
        temporarilyExpand() {
            this.navBackground.classList.remove('minimal');
            this.animateBarLayout(1, EXPANDED_PADDING);
            gsap.to(this.highlight, { opacity: 1, duration: 0.5, ease: EASE_OUT, delay: 0.1 });
            this.setTextColor(COLOR_WHITE);
        }

        /** Restore collapsed visuals after hover-expand. */
        temporarilyCollapse() {
            this.navBackground.classList.add('minimal');
            this.animateBarLayout(MINIMAL_SCALE, COLLAPSED_PADDING);
            gsap.to(this.highlight, { opacity: 0, duration: 0.08, ease: EASE_IN });
            this.lastContrastCheckTime = 0;
            this.updateNavContrast();
        }

        animateBarLayout(scale, padding) {
            gsap.to(this.navBarElement, { scale, duration: 0.3, ease: EASE_OUT });
            this.navItems.forEach(item =>
                gsap.to(item, { padding, duration: 0.3, ease: EASE_OUT })
            );
        }

        // ── Dynamic Contrast Detection ───────────────────────────────────

        initializeContrastDetection() {
            document.addEventListener('load', (event) => {
                if (event.target.tagName === 'IMG') imageCanvasCache.delete(event.target);
            }, true);

            requestAnimationFrame(() => this.updateNavContrast());
        }

        updateNavContrast() {
            if (this.navBackground.classList.contains('minimal')) {
                const now = performance.now();
                if (now - this.lastContrastCheckTime < CONTRAST_CHECK_INTERVAL_MS) return;
                this.lastContrastCheckTime = now;

                const backgroundIsBright = this.isBackgroundBright();
                this.setTextColor(backgroundIsBright ? COLOR_BLACK : COLOR_WHITE);
            } else {
                this.setTextColor(COLOR_WHITE);
            }
        }

        /** Samples luminance at multiple points across the navbar. */
        isBackgroundBright() {
            const navRect = this.navBarElement.getBoundingClientRect();
            const sampleY = navRect.top + navRect.height / 2;
            const samplePositions = [0.15, 0.3, 0.5, 0.7, 0.85];

            this.navBarElement.style.visibility = 'hidden';

            let totalLuminance = 0;
            let sampleCount = 0;

            for (const horizontalRatio of samplePositions) {
                const sampleX = navRect.left + navRect.width * horizontalRatio;
                const luminance = sampleLuminanceAtPoint(sampleX, sampleY);
                if (luminance !== null) {
                    totalLuminance += luminance;
                    sampleCount++;
                }
            }

            this.navBarElement.style.visibility = '';

            if (sampleCount === 0) return false;
            return totalLuminance / sampleCount > LUMINANCE_BRIGHT_THRESHOLD;
        }

        setTextColor(targetColor) {
            if (targetColor === this.currentTextColor) return;
            this.currentTextColor = targetColor;
            this.navItems.forEach(item =>
                gsap.to(item, { color: targetColor, duration: 0.25, ease: EASE_OUT, overwrite: 'auto' })
            );
        }
    }

    customElements.define('nav-bar', NavBar);
})();
