import { useRef, useCallback, useEffect } from 'react';

const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3.0;
const LERP = 0.08;
const DRAG_THRESHOLD = 8; // px — must move this far before pan starts (lets taps pass through)

interface Camera { x: number; y: number; zoom: number }

export function useMuseumCamera(canvasRef: React.RefObject<HTMLDivElement | null>) {
  const cam = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const tgt = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const dragPending = useRef(false); // mousedown happened, waiting for threshold
  const dragActive = useRef(false);  // threshold exceeded, actually panning
  const dragOrigin = useRef({ x: 0, y: 0 });
  const camOrigin = useRef({ x: 0, y: 0 });
  const pinchDist = useRef(0);

  const applyTransform = useCallback(() => {
    const c = cam.current, t = tgt.current;
    c.x += (t.x - c.x) * LERP;
    c.y += (t.y - c.y) * LERP;
    c.zoom += (t.zoom - c.zoom) * LERP;
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${c.x}px,${c.y}px) scale(${c.zoom})`;
    }
  }, [canvasRef]);

  const reset = useCallback(() => { tgt.current = { x: 0, y: 0, zoom: 1 }; }, []);
  const panTo = useCallback((x: number, y: number) => { tgt.current.x = x; tgt.current.y = y; }, []);
  const zoomTo = useCallback((z: number) => { tgt.current.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)); }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const clamp = (v: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v));

    // Mouse handlers with drag threshold
    const md = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragPending.current = true;
      dragActive.current = false;
      dragOrigin.current = { x: e.clientX, y: e.clientY };
      camOrigin.current = { x: tgt.current.x, y: tgt.current.y };
    };

    const mm = (e: MouseEvent) => {
      if (!dragPending.current && !dragActive.current) return;
      const dx = e.clientX - dragOrigin.current.x;
      const dy = e.clientY - dragOrigin.current.y;

      if (!dragActive.current) {
        if (Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
        dragActive.current = true;
        dragPending.current = false;
        el.classList.add('dragging');
      }

      tgt.current.x = camOrigin.current.x + dx / cam.current.zoom;
      tgt.current.y = camOrigin.current.y + dy / cam.current.zoom;
    };

    const mu = () => {
      dragPending.current = false;
      dragActive.current = false;
      el.classList.remove('dragging');
    };

    const wh = (e: WheelEvent) => {
      const t = (document.activeElement as HTMLElement)?.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      e.preventDefault();
      tgt.current.zoom = clamp(tgt.current.zoom * (1 - e.deltaY * 0.002));
    };

    const dc = () => reset();

    // Touch handlers with drag threshold
    const ts = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        dragPending.current = true;
        dragActive.current = false;
        dragOrigin.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        camOrigin.current = { x: tgt.current.x, y: tgt.current.y };
      } else if (e.touches.length === 2) {
        dragPending.current = false;
        dragActive.current = false;
        pinchDist.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const tmv = (e: TouchEvent) => {
      if (e.touches.length === 1 && (dragPending.current || dragActive.current)) {
        const dx = e.touches[0].clientX - dragOrigin.current.x;
        const dy = e.touches[0].clientY - dragOrigin.current.y;

        if (!dragActive.current) {
          if (Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
          dragActive.current = true;
          dragPending.current = false;
        }

        tgt.current.x = camOrigin.current.x + dx / cam.current.zoom;
        tgt.current.y = camOrigin.current.y + dy / cam.current.zoom;
      } else if (e.touches.length === 2 && pinchDist.current > 0) {
        const d = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        tgt.current.zoom = clamp(tgt.current.zoom * (d / pinchDist.current));
        pinchDist.current = d;
      }
    };

    const te = () => {
      dragPending.current = false;
      dragActive.current = false;
      pinchDist.current = 0;
    };

    el.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', mu);
    document.addEventListener('wheel', wh, { passive: false });
    el.addEventListener('dblclick', dc);
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tmv, { passive: true });
    el.addEventListener('touchend', te, { passive: true });

    return () => {
      el.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      document.removeEventListener('wheel', wh);
      el.removeEventListener('dblclick', dc);
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchmove', tmv);
      el.removeEventListener('touchend', te);
    };
  }, [canvasRef, reset]);

  return { applyTransform, reset, panTo, zoomTo, camera: cam, target: tgt };
}
