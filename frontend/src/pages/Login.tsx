import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  alpha, useTheme, IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const ACCENT = '#2E7D32';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!data.user?.onboardingCompleted) {
          navigate('/onboarding');
        } else {
          navigate(data.user.role === 'teacher' ? '/teacher' : '/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      bgcolor: 'background.default',
      overflow: 'hidden',
      '&': {
        overflowX: 'hidden'
      }
    }}>
      <SEO 
        title="Login"
        description="Sign in to your NeuronixLearn account and continue your AI-powered learning journey."
        url="/login"
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
          backgroundImage: `radial-gradient(ellipse 80% 70% at 0% 100%, ${alpha(ACCENT, isDark ? 0.25 : 0.15)} 0%, transparent 60%)`,
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
          <Typography variant="h2" sx={{ fontSize: '3rem', mb: 3, maxWidth: 420,
            background: `linear-gradient(135deg, ${isDark ? '#fff' : '#1a1a2e'} 0%, ${ACCENT} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Welcome back!
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 380, fontSize: '1.1rem' }}>
            Sign in to continue your learning journey.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            {['🔒 Secure', '⚡ Fast', '📚 500+ Courses'].map((stat) => (
              <Box key={stat} sx={{ px: 2, py: 1, borderRadius: '8px', bgcolor: alpha(ACCENT, isDark ? 0.15 : 0.1) }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: ACCENT }}>{stat}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">© 2025 NeuronixLearn</Typography>
      </Box>

      <Box sx={{ 
        flex: { xs: 1, lg: '0 0 520px' }, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        p: { xs: 3, md: 8 },
        overflow: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        MsOverflowStyle: 'none'
      }}>
        <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 5, alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '9px', background: ACCENT, overflow: 'hidden' }}>
              <Box component="img" src="/logo.jpg" alt="Logo" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Typography fontWeight={700}>NeuronixLearn</Typography>
          </Box>

          <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Sign in to continue</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth label="Email address" type="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                fullWidth label="Password" type={showPassword ? 'text' : 'password'}
                value={password} onChange={(e) => setPassword(e.target.value)} required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button fullWidth variant="contained" type="submit" size="large" disabled={loading}
                sx={{ py: 1.5, borderRadius: '10px', fontWeight: 600, boxShadow: `0 4px 20px ${alpha(ACCENT, 0.3)}` }}>
                {loading ? <CircularProgress size={20} /> : 'Sign In'}
              </Button>
            </Box>
          </form>

          <Typography sx={{ mt: 4, textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: ACCENT, fontWeight: 600 }}>Create one</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
