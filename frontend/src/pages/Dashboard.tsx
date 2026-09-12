import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  CircularProgress, Chip, LinearProgress, Avatar, useTheme
} from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowForward, TrendingUp, Schedule, LocalFireDepartment,
  School, BookmarkBorder, CheckCircleOutline, AutoAwesome
} from '@mui/icons-material';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, mlAPI, aiAPI } from '../services/api';
import PageBackground from '../components/PageBackground';

const DARK_ACCENT  = '#2E7D32';
const LIGHT_ACCENT = '#2E7D32';

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, delay = 0 }: {
  icon: React.ElementType; label: string; value: string | number; color: string; delay?: number;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const ref      = useRef(null);
  const inView   = useInView(ref, { once: true });

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
    >
      <Card sx={{
        bgcolor: 'background.paper',
        border: `1px solid divider`,
        borderRadius: 3, position: 'relative', overflow: 'hidden',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.1)',
        },
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color },
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              <Icon sx={{ color, fontSize: 20 }} />
            </Box>
            <TrendingUp sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'text.primary', lineHeight: 1 }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {label}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Scroll fade-in ───────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Custom recharts tooltip ──────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, accent }: any) => {
  const theme = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ color: accent, fontWeight: 700 }}>{payload[0].value} min</Typography>
    </Box>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accent   = isDark ? DARK_ACCENT : LIGHT_ACCENT;

  const [data,            setData]            = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [dailyProgress,   setDailyProgress]   = useState<any[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    const safe = (v: any): any[] => (Array.isArray(v) ? v : []);

    Promise.all([
      analyticsAPI.getDashboard().catch(() => ({ data: {} })),
      mlAPI.getRecommendations().catch(() => ({ data: {} })),
      analyticsAPI.getDailyProgress().catch(() => ({ data: {} })),
      aiAPI.getRecommendation().catch(() => ({ data: {} })),
    ]).then(([dash, recs, daily, aiRec]) => {
      setData(dash.data ?? {});
      setRecommendations(safe(recs.data?.recommendations));
      setDailyProgress(safe(daily.data?.dailyProgress));
      setAiRecommendation(aiRec.data || null);
    }).catch(() => {
      // final safety net
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageBackground variant="dashboard">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: accent }} />
        </Box>
      </PageBackground>
    );
  }

  const stats          = data?.stats || {};
  const recentActivity = Array.isArray(data?.recentActivity) ? data.recentActivity : [];

  const chartData = dailyProgress.length > 0
    ? dailyProgress.map((d: any) => ({ date: d.date, minutes: Math.round(d.timeSpent / 60) }))
    : Array.from({ length: 7 }, (_, i) => ({
        date:    new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en', { weekday: 'short' }),
        minutes: Math.floor(Math.random() * 50 + 10),
      }));

  const cardBg     = 'background.paper';
  const cardBorder = 'divider';
  const tp         = 'text.primary';
  const ts         = 'text.secondary';
  const cardShadow = 'none';

  return (
    <PageBackground variant="dashboard">
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: tp }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </Typography>
            <Typography variant="body2" sx={{ color: ts, mt: 0.5 }}>
              Here is your learning overview
            </Typography>
          </Box>
        </motion.div>

        {/* Stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { icon: School,              label: 'Enrolled',   value: stats.enrolledCourses  ?? 0, color: accent,    delay: 0    },
            { icon: CheckCircleOutline,  label: 'Completed',  value: stats.completedCourses ?? 0, color: '#81c784', delay: 0.07 },
            { icon: Schedule,            label: 'Hours spent',value: `${Math.floor((stats.totalTimeSpent || 0) / 60)}h`, color: '#ffb74d', delay: 0.14 },
            { icon: LocalFireDepartment, label: 'Day streak', value: `${stats.currentStreak ?? 0}d`, color: '#e57373', delay: 0.21 },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* ── Left ── */}
          <Grid item xs={12} md={8}>

            {/* Activity chart */}
            <FadeIn delay={0.1}>
              <Card sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 3, mb: 3, boxShadow: cardShadow }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                    <Box>
                      <Typography sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem', fontWeight: 700, mb: 0.3 }}>
                        Activity
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: tp, letterSpacing: '-0.01em' }}>
                        Weekly progress
                      </Typography>
                    </Box>
                    <Chip label="7 days" size="small" sx={{ bgcolor: `${accent}14`, color: accent, fontSize: '0.68rem', height: 20, border: `1px solid ${accent}33` }} />
                  </Box>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={accent} stopOpacity={0.22} />
                          <stop offset="95%" stopColor={accent} stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="divider" />
                      <XAxis dataKey="date" tick={{ fill: 'text.secondary', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'text.secondary', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RTooltip content={<CustomTooltip accent={accent} />} cursor={{ stroke: `${accent}44` }} />
                      <Area type="monotone" dataKey="minutes" stroke={accent} strokeWidth={2} fill="url(#ag)"
                        dot={{ fill: accent, strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: accent }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Continue learning */}
            <FadeIn delay={0.16}>
              <Card sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 3, boxShadow: cardShadow }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem', fontWeight: 700, mb: 0.3 }}>
                    Continue
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: tp, mb: 2.5, letterSpacing: '-0.01em' }}>
                    Recent activity
                  </Typography>

                  {recentActivity.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BookmarkBorder sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
                      <Typography variant="body2" sx={{ color: ts, mb: 2 }}>No recent activity</Typography>
                      <Button component={Link} to="/courses" size="small" variant="contained" endIcon={<ArrowForward sx={{ fontSize: 13 }} />}>
                        Explore courses
                      </Button>
                    </Box>
                  ) : recentActivity.slice(0, 4).map((item: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 2, py: 1.5,
                        borderBottom: i < Math.min(recentActivity.length, 4) - 1 ? `1px solid ${cardBorder}` : 'none',
                      }}>
                        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${accent}12`, flexShrink: 0 }}>
                          <School sx={{ color: accent, fontSize: 16 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: tp, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.courseName || 'Course'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.4 }}>
                            <LinearProgress variant="determinate" value={item.progress || 0}
                              sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: accent } }} />
                            <Typography variant="caption" sx={{ color: ts, minWidth: 28, fontSize: '0.68rem' }}>{item.progress || 0}%</Typography>
                          </Box>
                        </Box>
                        <Button component={Link} to={`/learn/${item.courseId}`} size="small" endIcon={<ArrowForward sx={{ fontSize: 11 }} />}
                          sx={{ color: accent, fontSize: '0.74rem', fontWeight: 600, flexShrink: 0 }}>
                          Continue
                        </Button>
                      </Box>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>

          {/* ── Right ── */}
          <Grid item xs={12} md={4}>

            {/* AI Learning Twin Recommendation */}
            {aiRecommendation && (
              <FadeIn delay={0.1}>
                <Card sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 3, boxShadow: cardShadow, mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <AutoAwesome sx={{ color: '#4DFFA3', fontSize: 18 }} />
                      <Typography sx={{ color: '#4DFFA3', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem', fontWeight: 700 }}>
                        AI Learning Twin
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: tp, mb: 1.5, letterSpacing: '-0.01em' }}>
                      Your Personal Recommendation
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: isDark ? 'rgba(77,255,163,0.08)' : 'rgba(46,125,50,0.08)',
                      border: '1px solid rgba(77,255,163,0.15)',
                      mb: 2
                    }}>
                      <Typography variant="body2" sx={{ color: tp, lineHeight: 1.6, fontSize: '0.9rem' }}>
                        {aiRecommendation.recommendation || 'Start learning to get personalized recommendations!'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Pace: ${aiRecommendation.learningPace || 'moderate'}`} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(77,255,163,0.15)', color: '#4DFFA3', fontSize: '0.7rem' }} 
                      />
                      <Chip 
                        label={`Level: ${aiRecommendation.experienceLevel || 'beginner'}`} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(77,255,163,0.15)', color: '#4DFFA3', fontSize: '0.7rem' }} 
                      />
                      <Chip 
                        label={`Completed: ${aiRecommendation.completedTopicsCount || 0} topics`} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(77,255,163,0.15)', color: '#4DFFA3', fontSize: '0.7rem' }} 
                      />
                    </Box>
                    <Button 
                      component={Link} 
                      to="/study-plan" 
                      size="small" 
                      variant="outlined"
                      endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                      sx={{ mt: 2, color: '#4DFFA3', borderColor: 'rgba(77,255,163,0.3)', fontSize: '0.78rem', width: '100%' }}
                    >
                      View Study Plan
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            {/* Recommendations */}
            <FadeIn delay={0.22}>
              <Card sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 3, boxShadow: cardShadow }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ color: '#81c784', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem', fontWeight: 700, mb: 0.3 }}>
                    AI picks
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: tp, mb: 2.5, letterSpacing: '-0.01em' }}>
                    Recommended
                  </Typography>

                  {recommendations.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" sx={{ color: ts, mb: 2, fontSize: '0.85rem' }}>
                        Complete onboarding to get AI recommendations.
                      </Typography>
                      <Button component={Link} to="/onboarding" size="small" variant="outlined"
                        sx={{ color: '#81c784', borderColor: '#81c784', fontSize: '0.78rem' }}>
                        Complete setup
                      </Button>
                    </Box>
                  ) : recommendations.slice(0, 5).map((rec: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}>
                      <Box component={Link} to={`/courses/${rec.courseId || ''}`} sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.5,
                        textDecoration: 'none',
                        borderBottom: i < recommendations.length - 1 ? `1px solid ${cardBorder}` : 'none',
                        '&:hover .rt': { color: '#81c784' }, transition: 'all 0.15s',
                      }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#81c78418', color: '#81c784', fontSize: 13, fontWeight: 700, borderRadius: 1.5, flexShrink: 0 }}>
                          {(rec.courseName || 'C').charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography className="rt" variant="body2" sx={{ fontWeight: 600, color: tp, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                            {rec.courseName || 'Course'}
                          </Typography>
                          {rec.reason && (
                            <Typography variant="caption" sx={{ color: ts, fontSize: '0.68rem' }}>{rec.reason}</Typography>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  ))}

                  <Button component={Link} to="/courses" fullWidth variant="outlined" size="small" endIcon={<ArrowForward sx={{ fontSize: 12 }} />}
                    sx={{ mt: 2, color: ts, borderColor: cardBorder, fontSize: '0.78rem', '&:hover': { borderColor: '#81c784', color: '#81c784' } }}>
                    Browse all courses
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Quick links */}
            <FadeIn delay={0.3}>
              <Card sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 3, mt: 3, boxShadow: cardShadow }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ color: '#ffb74d', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.68rem', fontWeight: 700, mb: 2 }}>
                    Quick links
                  </Typography>
                  {[
                    { label: 'Study Plan', to: '/study-plan',  color: '#81c784' },
                    { label: 'Exams',      to: '/exams',       color: '#e57373' },
                    { label: 'My Diary',   to: '/diary',       color: '#ce93d8' },
                    { label: 'My Courses', to: '/my-courses',  color: '#ffb74d' },
                  ].map((l, i) => (
                    <motion.div key={l.to} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
                      <Box component={Link} to={l.to} sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        py: 1.2, px: 1.5, borderRadius: 1.5, textDecoration: 'none',
                        mb: i < 3 ? 0.5 : 0,
                        '&:hover': { bgcolor: isDark ? '#141414' : '#f7f7f7' }, transition: 'background-color 0.15s',
                      }}>
                        <Typography sx={{ fontSize: '0.83rem', fontWeight: 500, color: tp }}>{l.label}</Typography>
                        <ArrowForward sx={{ fontSize: 13, color: l.color }} />
                      </Box>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        </Grid>
      </Container>
    </PageBackground>
  );
}
