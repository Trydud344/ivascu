import './NavBar.css';
import {
  HIGHLIGHT_DEFAULT_WIDTH,
  HIGHLIGHT_INSET,
  MINIMAL_SCALE,
  EXPANDED_PADDING,
  COLLAPSED_PADDING,
  SCROLL_THRESHOLD,
  CONTRAST_CHECK_INTERVAL_MS,
  LUMINANCE_BRIGHT_THRESHOLD,
  COLOR_WHITE,
  COLOR_BLACK,
  EASE_OUT,
  EASE_IN,
  NAV_ITEMS_CONFIG,
} from './constants.js';
import { sampleLuminanceAtPoint, clearImageCache } from './luminance.js';

function calculatePullStrength(closestItem) {
  const influenceZone = closestItem.width;
  const normalizedDistance = gsap.utils.clamp(0, 1)(closestItem.distanceToCursor / influenceZone);
  return Math.sqrt(1 - normalizedDistance);
}

function calculateTargetWidth(closestItem, pullStrength) {
  return HIGHLIGHT_DEFAULT_WIDTH + (closestItem.width - HIGHLIGHT_DEFAULT_WIDTH) * pullStrength;
}

function calculateBlendedLeft(closestItem, cursorX, targetWidth, barWidth, pullStrength) {
  const clampPosition = gsap.utils.clamp(HIGHLIGHT_INSET, barWidth - targetWidth - HIGHLIGHT_INSET);
  const freeFollowLeft = clampPosition(cursorX - targetWidth / 2);
  const snapToItemLeft = closestItem.centerX - targetWidth / 2;
  const blendedLeft = freeFollowLeft + (snapToItemLeft - freeFollowLeft) * pullStrength;
  return clampPosition(blendedLeft);
}

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

  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll);
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);
    document.removeEventListener('load', this.handleImageLoad, true);
  }

  renderTemplate() {
    const itemsHTML = NAV_ITEMS_CONFIG.map((item, index) => {
      const activeClass = index === 0 ? ' active' : '';
      return `<div class="nav-item${activeClass}" data-index="${index}" data-href="${item.href}">${item.label}</div>`;
    }).join('\n');

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
    this.lastScrollY = window.scrollY;
    this.currentTextColor = COLOR_WHITE;
    this.lastContrastCheckTime = 0;
  }

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

    const pullStrength = calculatePullStrength(closestItem);
    const targetWidth = calculateTargetWidth(closestItem, pullStrength);
    const targetLeft = calculateBlendedLeft(closestItem, cursorX, targetWidth, this.navBarElement.offsetWidth, pullStrength);

    this.animateHighlight(targetLeft, targetWidth);
  }

  animateHighlight(left, width) {
    gsap.to(this.highlight, {
      left,
      width,
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

  initializeScrollBehavior() {
    this.handleScroll = () => {
      const scrollDirection = window.scrollY - this.lastScrollY;
      this.lastScrollY = window.scrollY;

      const shouldMinimize = scrollDirection > 0 && window.scrollY > SCROLL_THRESHOLD;
      const shouldExpand = scrollDirection < 0;

      if (shouldMinimize) {
        this.transitionToMinimal();
      } else if (shouldExpand) {
        this.transitionToExpanded();
      }

      this.updateNavContrast();
    };

    window.addEventListener('scroll', this.handleScroll, { passive: true });

    this.handleMouseEnter = () => {
      if (this.isMinimal) this.temporarilyExpand();
    };
    this.handleMouseLeave = () => {
      if (this.isMinimal) this.temporarilyCollapse();
    };

    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
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

  temporarilyExpand() {
    this.navBackground.classList.remove('minimal');
    this.animateBarLayout(1, EXPANDED_PADDING);
    gsap.to(this.highlight, { opacity: 1, duration: 0.5, ease: EASE_OUT, delay: 0.1 });
    this.setTextColor(COLOR_WHITE);
  }

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

  initializeContrastDetection() {
    this.handleImageLoad = (event) => {
      if (event.target.tagName === 'IMG') {
        clearImageCache(event.target);
      }
    };
    document.addEventListener('load', this.handleImageLoad, true);

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

  isBackgroundBright() {
    const navRect = this.navBarElement.getBoundingClientRect();
    const sampleY = navRect.top + navRect.height / 2;
    const samplePositions = [0.15, 0.3, 0.5, 0.7, 0.85];

    this.navBarElement.style.visibility = 'hidden';
    const luminanceData = this.collectLuminanceSamples(navRect, sampleY, samplePositions);
    this.navBarElement.style.visibility = '';

    if (luminanceData.count === 0) return false;
    return (luminanceData.total / luminanceData.count) > LUMINANCE_BRIGHT_THRESHOLD;
  }

  collectLuminanceSamples(navRect, sampleY, samplePositions) {
    let total = 0;
    let count = 0;
    for (const ratio of samplePositions) {
      const sampleX = navRect.left + navRect.width * ratio;
      const luminance = sampleLuminanceAtPoint(sampleX, sampleY);
      if (luminance !== null) {
        total += luminance;
        count++;
      }
    }
    return { total, count };
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
