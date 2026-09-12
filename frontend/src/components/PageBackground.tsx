/**
 * PageBackground — theme-aware canvas particle background.
 *
 * Variants change particle colour, density, speed, and connection style
 * to give each page its own distinct feel. In light mode every colour
 * automatically shifts to a darker, saturated tint so it reads against
 * the white background.
 */
import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

// ── Per-page variant configs ──────────────────────────────────────────────────

type Variant = 'dashboard' | 'study' | 'courses' | 'exams' | 'diary' | 'admin' | 'landing' | 'default';

interface VariantConfig {
  darkColor:  string;
  lightColor: string;
  quantity:   number;
  speed:      number;
  connectionDistance: number;
  connectOpacity: number;
  dotOpacity: number;
  pulsate: boolean;
}

const VARIANTS: Record<Variant, VariantConfig> = {
  dashboard: { darkColor: '#2E7D32', lightColor: '#2E7D32', quantity: 55, speed: 0.3,  connectionDistance: 120, connectOpacity: 0.12, dotOpacity: 0.65, pulsate: false },
  study:     { darkColor: '#81c784', lightColor: '#2e7d32', quantity: 45, speed: 0.2,  connectionDistance: 100, connectOpacity: 0.10, dotOpacity: 0.55, pulsate: false },
  courses:   { darkColor: '#ffb74d', lightColor: '#e65100', quantity: 50, speed: 0.35, connectionDistance: 110, connectOpacity: 0.11, dotOpacity: 0.50, pulsate: true  },
  exams:     { darkColor: '#e57373', lightColor: '#c62828', quantity: 40, speed: 0.25, connectionDistance: 90,  connectOpacity: 0.09, dotOpacity: 0.50, pulsate: true  },
  diary:     { darkColor: '#ce93d8', lightColor: '#7b1fa2', quantity: 40, speed: 0.18, connectionDistance: 95,  connectOpacity: 0.09, dotOpacity: 0.45, pulsate: false },
  admin:     { darkColor: '#e57373', lightColor: '#b71c1c', quantity: 35, speed: 0.22, connectionDistance: 85,  connectOpacity: 0.08, dotOpacity: 0.40, pulsate: false },
  landing:   { darkColor: '#2E7D32', lightColor: '#2E7D32', quantity: 60, speed: 0.3,  connectionDistance: 130, connectOpacity: 0.14, dotOpacity: 0.60, pulsate: false },
  default:   { darkColor: '#2E7D32', lightColor: '#2E7D32', quantity: 45, speed: 0.28, connectionDistance: 110, connectOpacity: 0.10, dotOpacity: 0.50, pulsate: false },
};

// ── Particle type ─────────────────────────────────────────────────────────────

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  phase: number; // for pulsating size
}

// ── Hex to RGB ────────────────────────────────────────────────────────────────

function hexRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 79, g: 195, b: 247 };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  variant?: Variant;
  children: React.ReactNode;
}

export default function PageBackground({ variant = 'default', children }: Props) {
  const { mode } = useCustomTheme();
  const isDark    = mode === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const cfg       = VARIANTS[variant];

  const bgColor   = isDark ? '#000000' : '#ffffff';
  const hexColor  = isDark ? cfg.darkColor : cfg.lightColor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rgb = hexRgb(hexColor);
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < cfg.quantity; i++) {
        particles.push({
          x:     Math.random() * canvas.width,
          y:     Math.random() * canvas.height,
          vx:    (Math.random() - 0.5) * cfg.speed,
          vy:    (Math.random() - 0.5) * cfg.speed,
          size:  0.8 + Math.random() * 2,
          alpha: 0.25 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    let tick = 0;
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const size = cfg.pulsate
          ? p.size * (0.85 + 0.15 * Math.sin(p.phase + tick * 0.025))
          : p.size;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${p.alpha * cfg.dotOpacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < cfg.connectionDistance) {
            const a = (1 - d / cfg.connectionDistance) * cfg.connectOpacity;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
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
  }, [hexColor, cfg]);

  return (
    <Box sx={{ position: 'relative', bgcolor: bgColor, minHeight: '100vh', color: isDark ? '#fff' : '#111', transition: 'background-color 0.3s' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: isDark ? 1 : 0.7,
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
