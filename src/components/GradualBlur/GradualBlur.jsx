import React, { useEffect, useRef, useState, useMemo } from 'react';
import useResponsiveDimension from '../../hooks/useResponsiveDimension';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { DEFAULT_CONFIG, PRESETS, CURVE_FUNCTIONS } from './constants';
import './GradualBlur.css';

const mergeConfigs = (...configs) => configs.reduce((acc, c) => ({ ...acc, ...c }), {});

const getGradientDirection = (position) =>
  ({
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  })[position] || 'to bottom';

function calculateBlurValue(progress, divCount, strength, exponential) {
  if (exponential) {
    return Math.pow(2, progress * 4) * 0.0625 * strength;
  }
  return 0.0625 * (progress * divCount + 1) * strength;
}

function generateGradientStops(index, increment) {
  const p1 = Math.round((increment * index - increment) * 10) / 10;
  const p2 = Math.round(increment * index * 10) / 10;
  const p3 = Math.round((increment * index + increment) * 10) / 10;
  const p4 = Math.round((increment * index + increment * 2) * 10) / 10;

  let stops = `transparent ${p1}%, black ${p2}%`;
  if (p3 <= 100) stops += `, black ${p3}%`;
  if (p4 <= 100) stops += `, transparent ${p4}%`;
  return stops;
}

function GradualBlur(props) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props);
  }, [props]);

  const responsiveHeight = useResponsiveDimension(config.responsive, config, 'height');
  const responsiveWidth = useResponsiveDimension(config.responsive, config, 'width');
  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll');

  const blurDivs = useMemo(() => {
    const divs = [];
    const increment = 100 / config.divCount;
    const currentStrength = isHovered && config.hoverIntensity
      ? config.strength * config.hoverIntensity
      : config.strength;

    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear;
    const direction = getGradientDirection(config.position);

    for (let i = 1; i <= config.divCount; i++) {
      const progress = curveFunc(i / config.divCount);
      const blurValue = calculateBlurValue(progress, config.divCount, currentStrength, config.exponential);
      const stops = generateGradientStops(i, increment);

      const divStyle = {
        position: 'absolute',
        inset: '0',
        maskImage: `linear-gradient(${direction}, ${stops})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${stops})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition: config.animated && config.animated !== 'scroll'
          ? `backdrop-filter ${config.duration} ${config.easing}`
          : undefined,
      };

      divs.push(<div key={i} style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const containerStyle = useMemo(() => {
    const isVertical = ['top', 'bottom'].includes(config.position);
    const isHorizontal = ['left', 'right'].includes(config.position);
    const isPageTarget = config.target === 'page';

    const baseStyle = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style,
    };

    if (isVertical) {
      baseStyle.height = responsiveHeight;
      baseStyle.width = responsiveWidth || '100%';
      baseStyle[config.position] = 0;
      baseStyle.left = 0;
      baseStyle.right = 0;
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight;
      baseStyle.height = '100%';
      baseStyle[config.position] = 0;
      baseStyle.top = 0;
      baseStyle.bottom = 0;
    }

    return baseStyle;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const ms = parseFloat(duration) * 1000;
      const t = setTimeout(() => onAnimationComplete(), ms);
      return () => clearTimeout(t);
    }
  }, [isVisible, animated, onAnimationComplete, duration]);

  const wrapperClass = config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent';

  return (
    <div
      ref={containerRef}
      className={`gradual-blur ${wrapperClass} ${config.className}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div
        className="gradual-blur-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {blurDivs}
      </div>
    </div>
  );
}

const GradualBlurMemo = React.memo(GradualBlur);
GradualBlurMemo.displayName = 'GradualBlur';
GradualBlurMemo.PRESETS = PRESETS;
GradualBlurMemo.CURVE_FUNCTIONS = CURVE_FUNCTIONS;

export default GradualBlurMemo;
