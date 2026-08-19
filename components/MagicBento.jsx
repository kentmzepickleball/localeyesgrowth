import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 7;
const DEFAULT_SPOTLIGHT_RADIUS = 320;
const DEFAULT_GLOW_COLOR = '198, 166, 106'; // brand gold (#c6a66a) as an rgb triplet
const MOBILE_BREAKPOINT = 768;

/* ----------------------------------------------------------------------
   Adapted from React Bits' MagicBento. The stock component hardcoded its
   own demo card content AND a fixed 6-card nth-child bento span layout —
   neither works for a real, variable-length list of client sites, so:
   - card content now comes from an `items` prop (number/title/meta/
     description), not a baked-in array
   - clicking a card calls `onCardClick(index)` in addition to the
     library's own visual click-ripple
   - the asymmetric 6-cell span layout is gone in favor of a plain
     responsive grid, since 5 real business names don't line up with a
     layout tuned for 6 placeholder cards
   - recolored to the brand palette (ink/cream/gold) instead of the
     stock purple
   The particle/spotlight/tilt/magnetism mechanics themselves (the part
   worth keeping) are untouched — all event-driven GSAP tweens on
   hover/mousemove/click, no canvas, no continuous rAF loop, and every
   effect is auto-disabled on mobile via useMobileDetection below.
   ---------------------------------------------------------------------- */

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = radius => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty('--glow-x', `${relativeX}%`);
  card.style.setProperty('--glow-y', `${relativeY}%`);
  card.style.setProperty('--glow-intensity', glow.toString());
  card.style.setProperty('--glow-radius', `${radius}px`);
};

const spawnClickRipple = (element, e, glowColor) => {
  const rect = element.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const maxDistance = Math.max(
    Math.hypot(x, y),
    Math.hypot(x - rect.width, y),
    Math.hypot(x, y - rect.height),
    Math.hypot(x - rect.width, y - rect.height)
  );

  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    width: ${maxDistance * 2}px;
    height: ${maxDistance * 2}px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${glowColor}, 0.35) 0%, rgba(${glowColor}, 0.18) 30%, transparent 70%);
    left: ${x - maxDistance}px;
    top: ${y - maxDistance}px;
    pointer-events: none;
    z-index: 1000;
  `;

  element.appendChild(ripple);

  gsap.fromTo(
    ripple,
    { scale: 0, opacity: 1 },
    { scale: 1, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => ripple.remove() }
  );
};

const ParticleCard = ({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
  onActivate
}) => {
  const cardRef = useRef(null);
  const hoverParticlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const spawnParticle = useCallback(
    trackRef => {
      if (!cardRef.current) return;
      const { width, height } = cardRef.current.getBoundingClientRect();
      const el = createParticleElement(Math.random() * width, Math.random() * height, glowColor);
      cardRef.current.appendChild(el);
      trackRef.current.push(el);

      gsap.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
      gsap.to(el, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        rotation: Math.random() * 360,
        duration: 2 + Math.random() * 2,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });
      gsap.to(el, {
        opacity: 0.3,
        duration: 1.5,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      });
    },
    [glowColor]
  );

  const clearParticleSet = useCallback(trackRef => {
    trackRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    trackRef.current = [];
  }, []);

  const animateHoverParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    for (let i = 0; i < particleCount; i++) {
      /* staggered — starts with one or two and visibly builds up the
         longer the hover holds, instead of the whole burst landing at once */
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        spawnParticle(hoverParticlesRef);
      }, i * 260);

      timeoutsRef.current.push(timeoutId);
    }
  }, [particleCount, spawnParticle]);

  /* Click/activate is its own effect, deliberately NOT gated behind
     disableAnimations — this is what makes the card navigate at all, so
     mobile (where hover/tilt/sparkle effects are disabled below) still
     needs it wired up. Keyboard activation (Enter/Space) is handled
     separately via onKeyDown on the element itself. */
  useEffect(() => {
    if (!cardRef.current) return;
    const element = cardRef.current;

    const handleClick = e => {
      onActivate?.();
      if (!clickEffect || disableAnimations) return;
      spawnClickRipple(element, e, glowColor);
    };

    element.addEventListener('click', handleClick);
    return () => element.removeEventListener('click', handleClick);
  }, [clickEffect, disableAnimations, glowColor, onActivate]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateHoverParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      magnetismAnimationRef.current?.kill();
      clearParticleSet(hoverParticlesRef);

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = e => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.04;
        const magnetY = (y - centerY) * 0.04;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      clearParticleSet(hoverParticlesRef);
    };
  }, [animateHoverParticles, clearParticleSet, disableAnimations, enableTilt, enableMagnetism]);

  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate?.();
        }
      }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR
}) => {
  const spotlightRef = useRef(null);
  const isNearViewportRef = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    /* The mousemove handler below does DOM reads (getBoundingClientRect)
       and querySelectorAll on every single mouse movement anywhere on
       the page — cheap enough while this section is on screen, wasteful
       for the rest of the page's lifetime while it's scrolled away.
       Gate all of that behind a simple ref flip from an observer instead
       of doing real work just to find out we're nowhere near it. */
    const section = gridRef.current.closest('.bento-section');
    const visibilityObserver = section
      ? new IntersectionObserver(([entry]) => (isNearViewportRef.current = entry.isIntersecting), {
          rootMargin: '200px'
        })
      : null;
    if (section && visibilityObserver) visibilityObserver.observe(section);

    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.13) 0%,
        rgba(${glowColor}, 0.07) 15%,
        rgba(${glowColor}, 0.03) 25%,
        rgba(${glowColor}, 0.015) 40%,
        rgba(${glowColor}, 0.008) 65%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = e => {
      if (!isNearViewportRef.current || !spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest('.bento-section');
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll('.magic-bento-card');

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
        cards.forEach(card => card.style.setProperty('--glow-intensity', '0'));
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) - Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(card, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });

      const targetOpacity =
        minDistance <= proximity
          ? 0.7
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.7
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll('.magic-bento-card').forEach(card => {
        card.style.setProperty('--glow-intensity', '0');
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      visibilityObserver?.disconnect();
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

/* items: [{ number, title, meta, description }], one per card.
   onCardClick(index) fires on click or Enter/Space. */
const MagicBento = ({
  items,
  onCardClick,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true
}) => {
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className="card-grid bento-section" ref={gridRef}>
        {items.map((item, index) => {
          const baseClassName = `magic-bento-card ${enableBorderGlow ? 'magic-bento-card--border-glow' : ''}`;

          return (
            <ParticleCard
              key={item.title ?? index}
              className={baseClassName}
              style={{ '--glow-color': glowColor }}
              disableAnimations={shouldDisableAnimations}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
              onActivate={() => onCardClick?.(index)}
            >
              {item.bobbleColor && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 z-0 h-40 w-40 rounded-full blur-3xl"
                  style={{ backgroundColor: `${item.bobbleColor}66` }}
                />
              )}
              <div className="magic-bento-card__header">
                <span className="magic-bento-card__number">{item.number}</span>
                <span className="magic-bento-card__meta">{item.meta}</span>
              </div>
              <div className="magic-bento-card__content">
                <h3 className="magic-bento-card__title">{item.title}</h3>
                {item.description && <p className="magic-bento-card__description">{item.description}</p>}
              </div>
              <span className="magic-bento-card__footer">
                Preview <span aria-hidden="true">↗</span>
              </span>
            </ParticleCard>
          );
        })}
      </div>
    </>
  );
};

export default MagicBento;
