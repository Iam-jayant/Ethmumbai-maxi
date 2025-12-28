import { useEffect, useRef, useCallback, useMemo } from 'react';
import './ProfileCard.css';

const DEFAULT_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';
const INITIAL_DURATION = 1200;

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v) => parseFloat(v.toFixed(3));
const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

export default function ProfileCard({
  avatarUrl = '',
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = '',
  enableTilt = true,
  name = '',
  title = '',
  handle = '',
  status = '',
  contactText = 'Contact',
  showUserInfo = true,
  onContactClick
}) {
  const wrapRef = useRef(null);
  const shellRef = useRef(null);
  const enterTimerRef = useRef(null);
  const leaveRafRef = useRef(null);

  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;

    let rafId = null;
    let running = false;
    let lastTs = 0;
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let initialUntil = 0;

    const setVars = (x, y) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;

      const w = shell.clientWidth || 1;
      const h = shell.clientHeight || 1;
      const px = clamp((100 / w) * x);
      const py = clamp((100 / h) * y);

      const props = {
        '--pointer-x': `${px}%`,
        '--pointer-y': `${py}%`,
        '--background-x': `${adjust(px, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(py, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${py / 100}`,
        '--pointer-from-left': `${px / 100}`,
        '--rotate-x': `${round(-(px - 50) / 5)}deg`,
        '--rotate-y': `${round((py - 50) / 4)}deg`
      };

      Object.entries(props).forEach(([k, v]) => wrap.style.setProperty(k, v));
    };

    const step = (ts) => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const tau = ts < initialUntil ? 0.6 : 0.14;
      const k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVars(currentX, currentY);

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05 || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate: (x, y) => { currentX = x; currentY = y; setVars(x, y); },
      setTarget: (x, y) => { targetX = x; targetY = y; start(); },
      toCenter: function() { 
        const s = shellRef.current; 
        if (s) this.setTarget(s.clientWidth / 2, s.clientHeight / 2); 
      },
      beginInitial: (ms) => { initialUntil = performance.now() + ms; start(); },
      getCurrent: () => ({ x: currentX, y: currentY, tx: targetX, ty: targetY }),
      cancel: () => { if (rafId) cancelAnimationFrame(rafId); rafId = null; running = false; }
    };
  }, [enableTilt]);

  const getOffsets = (e, el) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMove = useCallback((e) => {
    if (!shellRef.current || !tiltEngine) return;
    const { x, y } = getOffsets(e, shellRef.current);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine]);

  const onEnter = useCallback((e) => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    shell.classList.add('active', 'entering');
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    enterTimerRef.current = setTimeout(() => shell.classList.remove('entering'), 180);
    const { x, y } = getOffsets(e, shell);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine]);

  const onLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    tiltEngine.toCenter();
    const check = () => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      if (Math.hypot(tx - x, ty - y) < 0.6) {
        shell.classList.remove('active');
      } else {
        leaveRafRef.current = requestAnimationFrame(check);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(check);
  }, [tiltEngine]);

  useEffect(() => {
    if (!enableTilt || !tiltEngine) return;
    const shell = shellRef.current;
    if (!shell) return;

    shell.addEventListener('pointerenter', onEnter);
    shell.addEventListener('pointermove', onMove);
    shell.addEventListener('pointerleave', onLeave);

    const w = shell.clientWidth || 0;
    tiltEngine.setImmediate(w - 70, 60);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(INITIAL_DURATION);

    return () => {
      shell.removeEventListener('pointerenter', onEnter);
      shell.removeEventListener('pointermove', onMove);
      shell.removeEventListener('pointerleave', onLeave);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
    };
  }, [enableTilt, tiltEngine, onEnter, onMove, onLeave]);

  const style = useMemo(() => ({
    '--inner-gradient': innerGradient ?? DEFAULT_GRADIENT,
    '--behind-glow-color': behindGlowColor ?? 'rgba(125, 190, 255, 0.67)',
    '--behind-glow-size': behindGlowSize ?? '50%'
  }), [innerGradient, behindGlowColor, behindGlowSize]);

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`} style={style}>
      {behindGlowEnabled && <div className="pc-behind" />}
      <div ref={shellRef} className="pc-card-shell">
        <section className="pc-card">
          <div className="pc-inside">
            <div className="pc-shine" />
            <div className="pc-glare" />
            <div className="pc-content pc-avatar-content">
              <img
                className="avatar"
                src={avatarUrl}
                alt={`${name} avatar`}
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              {showUserInfo && (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      <img src={avatarUrl} alt="" loading="lazy" />
                    </div>
                    <div className="pc-user-text">
                      <div className="pc-handle">@{handle}</div>
                      <div className="pc-status">{status}</div>
                    </div>
                  </div>
                  <button
                    className="pc-contact-btn"
                    onClick={onContactClick}
                    type="button"
                  >
                    {contactText}
                  </button>
                </div>
              )}
            </div>
            <div className="pc-content">
              <div className="pc-details">
                <h3>{name}</h3>
                <p>{title}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
