/**
 * KeyboardBackground — Canvas 2D floating keyboard keys
 * No WebGL / Three.js dependency — works on all browsers/devices.
 */
import { useEffect, useRef } from 'react';

const KEYS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '0','1','2','3','4','5','6','7','8','9',
  'Ctrl','Alt','Shift','Tab','Enter','Del','Esc','⌘','Fn',
  '←','→','↑','↓','Space','PgUp','End','Home',
];

interface Key {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  label: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
}

interface Props {
  opacity?: number;
}

export default function KeyboardBackground({ opacity = 0.5 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const keys: Key[] = [];
    const COUNT = 55;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };

    const init = () => {
      keys.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const size = 28 + Math.random() * 22;
        keys.push({
          x:        Math.random() * canvas.width,
          y:        Math.random() * canvas.height,
          vx:       (Math.random() - 0.5) * 0.45,
          vy:       (Math.random() - 0.5) * 0.35,
          size,
          label:    KEYS[Math.floor(Math.random() * KEYS.length)],
          alpha:    0.18 + Math.random() * 0.22,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.008,
        });
      }
    };

    const drawKey = (k: Key) => {
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(k.rotation);
      ctx.globalAlpha = k.alpha * opacity;

      const w = k.size * (k.label.length > 2 ? 1.8 : 1.1);
      const h = k.size;
      const r = 6;

      // key body
      ctx.beginPath();
      ctx.moveTo(-w / 2 + r, -h / 2);
      ctx.lineTo( w / 2 - r, -h / 2);
      ctx.quadraticCurveTo( w / 2, -h / 2,  w / 2, -h / 2 + r);
      ctx.lineTo( w / 2,  h / 2 - r);
      ctx.quadraticCurveTo( w / 2,  h / 2,  w / 2 - r,  h / 2);
      ctx.lineTo(-w / 2 + r,  h / 2);
      ctx.quadraticCurveTo(-w / 2,  h / 2, -w / 2,  h / 2 - r);
      ctx.lineTo(-w / 2, -h / 2 + r);
      ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      ctx.closePath();

      ctx.fillStyle   = 'rgba(20,25,35,0.75)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(46,125,50,0.45)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      // label
      const fontSize = k.label.length > 3 ? k.size * 0.28 : k.size * 0.42;
      ctx.fillStyle   = 'rgba(180,255,220,0.85)';
      ctx.font        = `600 ${fontSize}px "Courier New", monospace`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(k.label, 0, 0);

      ctx.restore();
    };

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const k of keys) {
        k.x        += k.vx;
        k.y        += k.vy;
        k.rotation += k.rotSpeed;

        if (k.x < -60)               k.x = canvas.width  + 60;
        if (k.x > canvas.width  + 60) k.x = -60;
        if (k.y < -60)               k.y = canvas.height + 60;
        if (k.y > canvas.height + 60) k.y = -60;

        drawKey(k);
      }
    };

    resize();
    init();
    draw();

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
