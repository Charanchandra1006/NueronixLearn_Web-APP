import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  alpha, useTheme, ToggleButton, ToggleButtonGroup, InputAdornment, IconButton,
  Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput, SelectChangeEvent
} from '@mui/material';
import { ArrowForward, School, Person, Visibility, VisibilityOff, PhoneAndroid } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const ACCENT = '#2E7D32';

const SUBJECTS = [
  'Computer Science',
  'Cyber Security',
  'Web Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Mobile Development',
  'Cloud Computing',
  'DevOps',
  'Blockchain',
  'Quantum Computing',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Business Studies',
  'English',
  'History',
  'Geography'
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const [learningPace, setLearningPace] = useState<'slow' | 'moderate' | 'fast'>('moderate');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'professional'>('beginner');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubjectChange = (event: SelectChangeEvent<typeof subjects>) => {
    const {
      target: { value },
    } = event;
    setSubjects(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role, phone, learningPace, experienceLevel, subjects);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      <SEO 
        title="Create Account"
        description="Join NeuronixLearn for free. Start your AI-powered personalized learning journey today."
        url="/register"
        noindex={false}
      />
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flex: 1, flexDirection: 'column', justifyContent: 'space-between',
        p: 8,
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'relative', overflow: 'hidden',
        background: isDark 
          ? `linear-gradient(135deg, ${alpha('#0a0a0f', 0.95)} 0%, ${alpha('#1a1a2e', 0.9)} 100%)`
          : `linear-gradient(135deg, ${alpha('#f8f9ff', 0.95)} 0%, ${alpha('#eef0f5', 0.9)} 100%)`,
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(ellipse 80% 70% at 0% 0%, ${alpha(ACCENT, isDark ? 0.25 : 0.15)} 0%, transparent 60%)`,
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            width: 40, height: 40, borderRadius: '10px', 
            background: `linear-gradient(135deg, ${ACCENT} 0%, #4DFFA3 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 20px ${alpha(ACCENT, 0.4)}`,
            overflow: 'hidden'
          }}>
            <Box component="img" src="/logo.jpg" alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>NeuronixLearn</Typography>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" sx={{ fontSize: '2.8rem', mb: 3, maxWidth: 400,
            background: `linear-gradient(135deg, ${isDark ? '#fff' : '#1a1a2e'} 0%, ${ACCENT} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Join NeuronixLearn
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { icon: '', title: 'AI-powered learning paths' },
              { icon: '', title: 'Secure & private' }
            ].map((item) => (
              <Box key={item.title} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{item.icon}</Typography>
                <Typography color="text.secondary">{item.title}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">© 2025 NeuronixLearn</Typography>
      </Box>

      <Box sx={{ flex: { xs: 1, lg: '0 0 580px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, md: 8 }, overflow: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', MsOverflowStyle: 'none' }}>
        <Box sx={{ maxWidth: 480, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 4, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: ACCENT, overflow: 'hidden' }}>
              <Box component="img" src="/logo.jpg" alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Typography fontWeight={700}>NeuronixLearn</Typography>
          </Box>

          <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>Create your account</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Start learning today</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Full name" value={name} onChange={(e) => setName(e.target.value)} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              <TextField fullWidth label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
              <TextField fullWidth label="Phone (with country code)" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                InputProps={{
                  startAdornment: <PhoneAndroid sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                }}
              />
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                helperText="At least 6 characters"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Box>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary' }}>I want to:</Typography>
                <ToggleButtonGroup value={role} exclusive onChange={(_, val) => val && setRole(val)} fullWidth
                  sx={{ '& .MuiToggleButton-root': { py: 1.5, borderRadius: '10px !important' } }}>
                  <ToggleButton value="student"><School sx={{ mr: 1 }} /> Learn</ToggleButton>
                  <ToggleButton value="teacher"><Person sx={{ mr: 1 }} /> Teach</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {role === 'student' && (
                <>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary' }}>Learning Pace:</Typography>
                    <ToggleButtonGroup value={learningPace} exclusive onChange={(_, val) => val && setLearningPace(val)} fullWidth
                      sx={{ '& .MuiToggleButton-root': { py: 1, borderRadius: '10px !important' } }}>
                      <ToggleButton value="slow">Slow</ToggleButton>
                      <ToggleButton value="moderate">Moderate</ToggleButton>
                      <ToggleButton value="fast">Fast</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500, color: 'text.secondary' }}>Experience Level:</Typography>
                    <ToggleButtonGroup value={experienceLevel} exclusive onChange={(_, val) => val && setExperienceLevel(val)} fullWidth
                      sx={{ '& .MuiToggleButton-root': { py: 1, borderRadius: '10px !important' } }}>
                      <ToggleButton value="beginner">Beginner</ToggleButton>
                      <ToggleButton value="intermediate">Intermediate</ToggleButton>
                      <ToggleButton value="professional">Professional</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <FormControl fullWidth>
                    <InputLabel sx={{ bgcolor: isDark ? '#0a0a0f' : '#fff', px: 1 }}>Subjects to Learn</InputLabel>
                    <Select
                      multiple
                      value={subjects}
                      onChange={handleSubjectChange}
                      input={<OutlinedInput label="Subjects to Learn" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" sx={{ bgcolor: `${ACCENT}20`, color: ACCENT }} />
                          ))}
                        </Box>
                      )}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    >
                      {SUBJECTS.map((subject) => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {role === 'teacher' && (
                <FormControl fullWidth>
                  <InputLabel sx={{ bgcolor: isDark ? '#0a0a0f' : '#fff', px: 1 }}>Subjects You Teach</InputLabel>
                  <Select
                    multiple
                    value={subjects}
                    onChange={handleSubjectChange}
                    input={<OutlinedInput label="Subjects You Teach" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" sx={{ bgcolor: `${ACCENT}20`, color: ACCENT }} />
                        ))}
                      </Box>
                    )}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                  >
                    {SUBJECTS.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button fullWidth variant="contained" type="submit" size="large" disabled={loading}
                sx={{ py: 1.5, borderRadius: '10px', fontWeight: 600, boxShadow: `0 4px 20px ${alpha(ACCENT, 0.3)}` }}>
                {loading ? <CircularProgress size={20} /> : 'Create Account'}
              </Button>
            </Box>
          </form>

          <Typography sx={{ mt: 3, textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: ACCENT, fontWeight: 600 }}>Sign in</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
