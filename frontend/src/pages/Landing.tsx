import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { ArrowForward, PlayArrow } from '@mui/icons-material';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import KeyboardBackground from '../components/KeyboardBackground';

// ─── Theme ────────────────────────────────────────────────────────────────────

const DARK_ACCENT  = '#2E7D32';
const LIGHT_ACCENT = '#2E7D32';

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: 50000, label: 'Active learners', suffix: '+' },
  { value: 200,   label: 'Subjects covered', suffix: '+' },
  { value: 95,    label: 'Completion rate',  suffix: '%' },
  { value: 4.9,   label: 'Average rating',   suffix: '' },
];

const FEATURES = [
  { num: '01', title: 'AI Roadmap Generation', desc: 'Add any subject and the AI instantly generates a structured learning roadmap with topics, subtopics, videos, and articles.' },
  { num: '02', title: 'Adaptive Difficulty',   desc: 'Content difficulty shifts automatically based on your performance — never too easy, never overwhelming.' },
  { num: '03', title: 'Deep Analytics',        desc: 'Track retention rates, time-on-task, streak consistency, and weak topics — all in one dashboard.' },
];

// ─── Animated counter (pure CSS / requestAnimationFrame, no framer-motion spring) ─

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const duration = 1200;
    const start    = performance.now();
    const isFloat  = target % 1 !== 0;

    const tick = (now: number) => {
      const t   = Math.min((now - start) / duration, 1);
      const val = t * target;
      if (ref.current) {
        ref.current.textContent = (isFloat ? val.toFixed(1) : Math.round(val).toString()) + suffix;
      }
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

// ─── Fade wrappers ────────────────────────────────────────────────────────────

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Magnetic button ──────────────────────────────────────────────────────────

function MagBtn({
  children, to, variant = 'contained', endIcon, onClick,
}: {
  children: React.ReactNode;
  to?: string;
  variant?: 'contained' | 'outlined';
  endIcon?: React.ReactNode;
  onClick?: () => void;
}) {
  const { mode } = useCustomTheme();
  const accent   = mode === 'dark' ? DARK_ACCENT : LIGHT_ACCENT;

  const linkProps = to ? { component: Link as any, to } : {};

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{ display: 'inline-block' }}
    >
      <Button
        {...linkProps}
        variant={variant}
        size="large"
        endIcon={endIcon}
        onClick={onClick}
        sx={{
          px: 3.5, py: 1.3, fontSize: '1rem', fontWeight: 700, borderRadius: '10px',
          transition: 'all 0.2s ease',
          ...(variant === 'contained' ? {
            bgcolor: accent, color: '#fff',
            '&:hover': { bgcolor: mode === 'dark' ? '#1B5E20' : '#1B5E20', boxShadow: 'none' },
          } : {
            borderColor: `${accent}66`, color: accent,
            '&:hover': { borderColor: accent, bgcolor: `${accent}0d`, boxShadow: 'none' },
          }),
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { mode }  = useCustomTheme();
  const isDark    = mode === 'dark';
  const accent    = isDark ? DARK_ACCENT : LIGHT_ACCENT;
  const bgColor   = isDark ? '#0a0a0a'   : '#ffffff';
  const textPri   = isDark ? '#fff'      : '#111';
  const textSec   = isDark ? '#777'      : '#888';
  const borderCol = isDark ? '#1a1a1a'   : '#ebebeb';

  return (
    <Box sx={{ bgcolor: bgColor, color: textPri, minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <Box sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* Keyboard canvas background */}
        <KeyboardBackground opacity={isDark ? 0.5 : 0.25} />

        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: isDark
            ? 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.94) 80%)'
            : 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.96) 75%)',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 12, md: 0 } }}>

          {/* Badge */}
          <FadeUp delay={0.05}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.5, mb: 4,
              border: `1px solid ${accent}44`, borderRadius: '20px', bgcolor: `${accent}0d`,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accent }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>
                AI-Powered Learning Platform
              </Typography>
            </Box>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.15}>
            <Typography component="h1" sx={{
              fontSize: { xs: '3rem', sm: '4.5rem', md: '6rem' },
              fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em', mb: 3,
            }}>
              Learn smarter.{' '}
              <Box component="span" sx={{ color: accent }}>
                Not harder.
              </Box>
            </Typography>
          </FadeUp>

          <FadeUp delay={0.28}>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: textSec, maxWidth: 520, lineHeight: 1.75, mb: 5 }}>
              NeuronixLearn generates a personalised AI roadmap for any subject —
              with topics, subtopics, videos, and articles, all in one place.
            </Typography>
          </FadeUp>

          <FadeUp delay={0.4}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: { xs: 8, md: 12 } }}>
              {!user ? (
                <>
                  <MagBtn to="/register" endIcon={<ArrowForward />}>Start for free</MagBtn>
                  <MagBtn to="/login" variant="outlined">Log in</MagBtn>
                </>
              ) : (
                <>
                  <MagBtn onClick={() => navigate(user.role === 'teacher' ? '/teacher' : '/dashboard')} endIcon={<ArrowForward />}>
                    Dashboard
                  </MagBtn>
                  <MagBtn to="/study-plan" variant="outlined" endIcon={<PlayArrow />}>
                    Study Plan
                  </MagBtn>
                </>
              )}
            </Box>
          </FadeUp>

          {/* Stats */}
          <FadeUp delay={0.55}>
            <Box sx={{ display: 'flex', gap: { xs: 4, md: 8 }, flexWrap: 'wrap', pt: 5, borderTop: `1px solid ${borderCol}` }}>
              {STATS.map((s) => (
                <Box key={s.label}>
                  <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.3rem' }, fontWeight: 800, letterSpacing: '-0.03em', color: textPri }}>
                    <Counter target={s.value} suffix={s.suffix} />
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: textSec, mt: 0.25 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </FadeUp>
        </Container>
      </Box>

      {/* ── FEATURES ── */}
      <Box sx={{ borderTop: `1px solid ${borderCol}`, borderBottom: `1px solid ${borderCol}`, py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Box sx={{ mb: 8, maxWidth: 520 }}>
              <Typography sx={{ color: accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
                Why NeuronixLearn
              </Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 700, letterSpacing: '-0.03em', mb: 2 }}>
                Built around how you learn
              </Typography>
              <Typography sx={{ color: textSec, lineHeight: 1.8, fontSize: '0.95rem' }}>
                Most platforms deliver content. We deliver understanding — through a system that reads your progress and adjusts automatically.
              </Typography>
            </Box>
          </FadeIn>

          {FEATURES.map((f, i) => (
            <FadeIn key={f.num} delay={i * 0.08}>
              <motion.div whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
                <Box sx={{
                  display: 'flex', gap: { xs: 3, md: 6 }, py: { xs: 4, md: 5 },
                  borderBottom: `1px solid ${borderCol}`,
                  ...(i === 0 ? { borderTop: `1px solid ${borderCol}` } : {}),
                  alignItems: 'flex-start', cursor: 'default',
                  '&:hover .fnum': { color: accent },
                  '&:hover .farrow': { opacity: 1, transform: 'translateX(4px)' },
                  transition: 'all 0.2s',
                }}>
                  <Typography className="fnum" sx={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#333' : '#ccc', minWidth: 32, pt: 0.25, transition: 'color 0.2s' }}>
                    {f.num}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: textSec, lineHeight: 1.75, maxWidth: 600, fontSize: '0.95rem' }}>
                      {f.desc}
                    </Typography>
                  </Box>
                  <ArrowForward className="farrow" sx={{
                    fontSize: 18, color: accent, mt: 0.75, flexShrink: 0,
                    display: { xs: 'none', md: 'block' },
                    opacity: 0, transition: 'opacity 0.2s, transform 0.2s',
                  }} />
                </Box>
              </motion.div>
            </FadeIn>
          ))}
        </Container>
      </Box>

      {/* ── HOW IT WORKS ── */}
      <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: isDark ? '#080808' : '#f8f8f8' }}>
        <Container maxWidth="lg">
          <FadeIn>
            <Typography sx={{ color: accent, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1 }}>
              The flow
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 700, letterSpacing: '-0.03em', mb: 8 }}>
              From subject to mastery
            </Typography>
          </FadeIn>
          <Grid container spacing={3}>
            {[
              { step: '1', title: 'Add a subject',    desc: 'Type any subject. The AI generates a full roadmap from basics to advanced.' },
              { step: '2', title: 'Topics appear',    desc: 'A structured list of topics in learning order, saved to your progress tracker.' },
              { step: '3', title: 'Click a subtopic', desc: 'Instantly loads curated YouTube videos and blog articles for that exact concept.' },
              { step: '4', title: 'Track progress',   desc: 'Mark topics complete. Watch your progress bar fill as you master the subject.' },
            ].map((item, i) => (
              <Grid item xs={12} sm={6} md={3} key={item.step}>
                <FadeIn delay={i * 0.09}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                    style={{ height: '100%' }}
                  >
                    <Box sx={{
                      p: 3, borderRadius: 3, height: '100%',
                      bgcolor: isDark ? '#111' : '#fff',
                      border: `1px solid ${borderCol}`,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      '&:hover': { borderColor: `${accent}55`, boxShadow: `0 16px 40px ${accent}12` },
                    }}>
                      <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: isDark ? '#1e1e1e' : '#ebebeb', letterSpacing: '-0.04em', mb: 2, lineHeight: 1 }}>
                        {item.step.padStart(2, '0')}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>{item.title}</Typography>
                      <Typography sx={{ color: textSec, fontSize: '0.875rem', lineHeight: 1.7 }}>{item.desc}</Typography>
                    </Box>
                  </motion.div>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ py: { xs: 10, md: 18 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <FadeIn>
            <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, fontWeight: 800, letterSpacing: '-0.03em', mb: 2 }}>
              Ready to learn differently?
            </Typography>
            <Typography sx={{ color: textSec, mb: 6, fontSize: '1.05rem', lineHeight: 1.75 }}>
              Join thousands of students already using NeuronixLearn to master any subject faster.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {!user ? (
                <>
                  <MagBtn to="/register" endIcon={<ArrowForward />}>Create free account</MagBtn>
                  <MagBtn to="/login" variant="outlined">Log in</MagBtn>
                </>
              ) : (
                <MagBtn to="/study-plan" endIcon={<ArrowForward />}>Open Study Plan</MagBtn>
              )}
            </Box>
          </FadeIn>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${borderCol}`, py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ fontWeight: 700, color: isDark ? '#333' : '#ccc', fontSize: '0.85rem' }}>NeuronixLearn</Typography>
            <Typography sx={{ color: isDark ? '#333' : '#ccc', fontSize: '0.78rem' }}>AI-Powered Adaptive Learning</Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
