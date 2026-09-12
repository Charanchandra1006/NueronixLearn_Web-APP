import { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid, TextField,
  Button, CircularProgress, Avatar, Alert, Chip, LinearProgress, Tooltip, IconButton
} from '@mui/material';
import { CameraAlt, Save, Person, BarChart, Settings } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI, analyticsAPI } from '../services/api';

const ACCENT  = '#2E7D32';
const cardSx  = { bgcolor: '#111', border: '1px solid #1a1a1a', borderRadius: 3 };
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': { borderColor: '#2a2a2a' },
    '&:hover fieldset': { borderColor: ACCENT },
    '&.Mui-focused fieldset': { borderColor: ACCENT },
  },
  '& .MuiInputLabel-root': { color: '#555' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: 'easeOut' as const },
});

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [stats,        setStats]        = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [name,         setName]         = useState(user?.name || '');
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState('');
  const [saveErr,      setSaveErr]      = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarErr,    setAvatarErr]    = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data.stats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Avatar upload ────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarErr('Image must be under 2 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarErr('Only image files are supported');
      return;
    }

    setAvatarErr('');
    setAvatarLoading(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        await authAPI.updateAvatar(base64);
        await refreshUser();
      } catch (err: any) {
        setAvatarErr(err.response?.data?.error || 'Failed to upload photo');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be picked again
    e.target.value = '';
  };

  // ── Save name ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    setSaveErr('');
    try {
      await authAPI.updateProfile({ name });
      await refreshUser();
      setSaveMsg('Profile saved.');
    } catch (err: any) {
      setSaveErr(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const roleColor: Record<string, string> = {
    student: ACCENT,
    teacher: '#81c784',
    admin:   '#e57373',
  };

  const statItems = [
    { label: 'Enrolled courses', value: stats?.enrolledCourses  ?? 0 },
    { label: 'Completed',        value: stats?.completedCourses ?? 0 },
    { label: 'Time spent',       value: `${Math.floor((stats?.totalTimeSpent || 0) / 60)}h` },
    { label: 'Streak',           value: `${stats?.currentStreak ?? 0}d` },
  ];

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: '#fff', py: 5 }}>
      <Container maxWidth="lg">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.02em' }}>
            Profile
          </Typography>
          <Typography variant="body2" color="#555" sx={{ mb: 4 }}>
            Manage your account details and profile photo
          </Typography>
        </motion.div>

        <Grid container spacing={3}>

          {/* ── LEFT: Avatar + identity ── */}
          <Grid item xs={12} md={4}>
            <motion.div {...fadeUp(0.05)}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>

                  {/* Avatar with camera button */}
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    {avatarLoading ? (
                      <Box sx={{
                        width: 110, height: 110, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: '#1a1a1a', border: `2px solid ${ACCENT}44`,
                        mx: 'auto',
                      }}>
                        <CircularProgress size={30} sx={{ color: ACCENT }} />
                      </Box>
                    ) : (
                      <Avatar
                        src={user?.avatar}
                        sx={{
                          width: 110, height: 110, mx: 'auto',
                          bgcolor: '#1a1a1a',
                          border: `2px solid ${ACCENT}44`,
                          fontSize: 40, fontWeight: 700, color: ACCENT,
                        }}
                      >
                        {!user?.avatar && user?.name.charAt(0).toUpperCase()}
                      </Avatar>
                    )}

                    {/* Camera overlay button */}
                    <Tooltip title="Upload photo (max 2 MB)">
                      <IconButton
                        onClick={() => fileRef.current?.click()}
                        disabled={avatarLoading}
                        size="small"
                        sx={{
                          position: 'absolute', bottom: 2, right: 2,
                          bgcolor: ACCENT, color: '#000',
                          width: 30, height: 30,
                          '&:hover': { bgcolor: '#1B5E20' },
                          border: '2px solid #0a0a0a',
                        }}
                      >
                        <CameraAlt sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </Box>

                  {avatarErr && (
                    <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(229,115,115,0.08)', color: '#e57373', border: '1px solid rgba(229,115,115,0.15)', borderRadius: 2, fontSize: '0.78rem' }}>
                      {avatarErr}
                    </Alert>
                  )}

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>{user?.name}</Typography>
                  <Typography variant="body2" color="#555" sx={{ mb: 1.5 }}>{user?.email}</Typography>

                  <Chip
                    label={user?.role}
                    size="small"
                    sx={{
                      bgcolor: `${roleColor[user?.role || 'student']}18`,
                      color: roleColor[user?.role || 'student'],
                      border: `1px solid ${roleColor[user?.role || 'student']}44`,
                      fontWeight: 600, textTransform: 'capitalize', fontSize: '0.75rem',
                    }}
                  />

                  <Typography variant="caption" color="#333" sx={{ display: 'block', mt: 2 }}>
                    Click the camera icon to update your photo
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* ── RIGHT: Stats + settings ── */}
          <Grid item xs={12} md={8}>

            {/* Stats */}
            <motion.div {...fadeUp(0.1)}>
              <Card sx={{ ...cardSx, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <BarChart sx={{ color: ACCENT, fontSize: 18 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: ACCENT }}>
                      Learning Statistics
                    </Typography>
                  </Box>

                  {statsLoading ? (
                    <LinearProgress sx={{ bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
                  ) : (
                    <Grid container spacing={2}>
                      {statItems.map((item) => (
                        <Grid item xs={6} sm={3} key={item.label}>
                          <Box sx={{
                            textAlign: 'center', p: 2, borderRadius: 2,
                            bgcolor: '#0d0d0d', border: '1px solid #1a1a1a',
                          }}>
                            <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: ACCENT, letterSpacing: '-0.03em' }}>
                              {item.value}
                            </Typography>
                            <Typography variant="caption" color="#555">{item.label}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Account settings */}
            <motion.div {...fadeUp(0.15)}>
              <Card sx={cardSx}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                    <Settings sx={{ color: '#81c784', fontSize: 18 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#81c784' }}>
                      Account Settings
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="Display name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="Email"
                        value={user?.email || ''}
                        disabled
                        sx={{ ...fieldSx, '& .Mui-disabled': { color: '#444 !important', WebkitTextFillColor: '#444 !important' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth label="Role"
                        value={user?.role || ''}
                        disabled
                        sx={{ ...fieldSx, '& .Mui-disabled': { color: '#444 !important', WebkitTextFillColor: '#444 !important' } }}
                      />
                    </Grid>
                    {user?.profile?.grade && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth label="Grade / Class"
                          value={user.profile.grade}
                          disabled
                          sx={{ ...fieldSx, '& .Mui-disabled': { color: '#444 !important', WebkitTextFillColor: '#444 !important' } }}
                        />
                      </Grid>
                    )}
                  </Grid>

                  {saveMsg && (
                    <Alert severity="success" sx={{ mt: 2, bgcolor: 'rgba(129,199,132,0.08)', color: '#81c784', border: '1px solid rgba(129,199,132,0.15)', borderRadius: 2 }}>
                      {saveMsg}
                    </Alert>
                  )}
                  {saveErr && (
                    <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(229,115,115,0.08)', color: '#e57373', border: '1px solid rgba(229,115,115,0.15)', borderRadius: 2 }}>
                      {saveErr}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={15} color="inherit" /> : <Save sx={{ fontSize: 16 }} />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      mt: 3, bgcolor: ACCENT, color: '#000', fontWeight: 700,
                      '&:hover': { bgcolor: '#1B5E20' },
                      '&:disabled': { bgcolor: '#1a1a1a', color: '#444' },
                    }}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Learning preferences (read-only display) */}
            {user?.profile && (
              <motion.div {...fadeUp(0.2)}>
                <Card sx={{ ...cardSx, mt: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Person sx={{ color: '#ffb74d', fontSize: 18 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffb74d' }}>
                        Learning Preferences
                      </Typography>
                    </Box>
                    <Grid container spacing={1.5}>
                      {[
                        { label: 'Learning style', value: user.profile.preferredLearningStyle },
                        { label: 'Pace', value: user.profile.pacePreference },
                        { label: 'Level', value: user.profile.currentPerformanceLevel },
                      ].filter(i => i.value).map((item) => (
                        <Grid item xs={6} sm={4} key={item.label}>
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                            <Typography variant="caption" color="#444" sx={{ display: 'block', mb: 0.25 }}>
                              {item.label}
                            </Typography>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 600, color: '#bbb' }}>
                              {item.value?.replace(/_/g, ' ')}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {user.profile.subjectInterests && user.profile.subjectInterests.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="#444" sx={{ mb: 1, display: 'block' }}>
                          Subject interests
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {user.profile.subjectInterests.map(s => (
                            <Chip key={s} label={s} size="small"
                              sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}33`, fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {user.profile.weakAreas && user.profile.weakAreas.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="#444" sx={{ mb: 1, display: 'block' }}>
                          Focus areas (weak topics)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {user.profile.weakAreas.map(s => (
                            <Chip key={s} label={s} size="small"
                              sx={{ bgcolor: 'rgba(255,183,77,0.1)', color: '#ffb74d', border: '1px solid rgba(255,183,77,0.25)', fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
