function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 0, g: 229, b: 255 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function mountParticleBg(opts: { accent: string }) {
  let accent = opts.accent;
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-particles';
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '0' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  let w = 0, h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mouseX = -9999, mouseY = -9999;
  let smoothX = -9999, smoothY = -9999;
  const grid = 38;
  let dots: Array<{ ox: number; oy: number }> = [];
  let rgb = hexToRgb(accent);

  function rebuild() {
    const cols = Math.ceil(w / grid) + 2;
    const rows = Math.ceil(h / grid) + 2;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ ox: c * grid, oy: r * grid });
      }
    }
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuild();
  }

  const onMove = (e: PointerEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
  const onLeave = () => { mouseX = -9999; mouseY = -9999; };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  window.addEventListener('resize', resize);
  resize();

  const RADIUS2 = 220 * 220;
  let raf = 0;

  function frame() {
    if (mouseX > -1000) {
      smoothX += (mouseX - smoothX) * 0.18;
      smoothY += (mouseY - smoothY) * 0.18;
    } else {
      smoothX += (-9999 - smoothX) * 0.05;
      smoothY += (-9999 - smoothY) * 0.05;
    }
    ctx.clearRect(0, 0, w, h);
    if (mouseX > -1000) {
      const grd = ctx.createRadialGradient(smoothX, smoothY, 0, smoothX, smoothY, 360);
      grd.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.12)`);
      grd.addColorStop(0.5, `rgba(${rgb.r},${rgb.g},${rgb.b},0.04)`);
      grd.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }
    for (const d of dots) {
      const dx = d.ox - smoothX, dy = d.oy - smoothY;
      const dist2 = dx * dx + dy * dy;
      let alpha = 0.06, size = 1, nx = d.ox, ny = d.oy;
      if (dist2 < RADIUS2) {
        const f = 1 - dist2 / RADIUS2;
        const dist = Math.sqrt(dist2) || 1;
        nx = d.ox + (dx / dist) * f * 14;
        ny = d.oy + (dy / dist) * f * 14;
        alpha = 0.06 + f * 0.55;
        size = 1 + f * 2.2;
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      }
      ctx.beginPath();
      ctx.arc(nx, ny, size, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      window.removeEventListener('resize', resize);
      canvas.parentNode?.removeChild(canvas);
    },
    setAccent(c: string) { accent = c; rgb = hexToRgb(c); },
  };
}
