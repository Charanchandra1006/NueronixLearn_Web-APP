import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Grid, TextField, 
  Button, CircularProgress, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, 
  InputLabel, InputAdornment
} from '@mui/material';
import { 
  Add, Lock, LockOpen, Edit, Delete, CalendarToday, 
  EmojiEmotions, Save, Close, Create 
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const moodColors: Record<string, string> = {
  great: '#10b981',
  good: '#6366f1',
  okay: '#f59e0b',
  bad: '#ef4444',
  terrible: '#7f1d1d'
};

const Diary = () => {
  const { mode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<any[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'unlock' | 'create'>('create');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: '',
    goalsCompleted: '',
    goalsMissed: '',
    nextDayGoals: '',
    reflections: ''
  });

  useEffect(() => {
    fetchLockStatus();
  }, []);

  const fetchLockStatus = async () => {
    try {
      const res = await api.get('/diary/status');
      const hasPassword = res.data.hasPassword;
      setHasPassword(hasPassword);
      setIsLocked(hasPassword);
    } catch (error) {
      console.error('Error fetching lock status:', error);
      setHasPassword(false);
      setIsLocked(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await api.get('/diary/entries');
      setEntries(res.data.entries || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      fetchEntries();
    }
  }, [isLocked]);

  const handleUnlock = async () => {
    setUnlockError('');
    try {
      const res = await api.post('/diary/unlock', { password });
      if (res.data.unlocked) {
        setIsLocked(false);
        fetchEntries();
      }
    } catch (error: any) {
      setUnlockError(error.response?.data?.error || 'Invalid password');
    }
  };

  const handleCreatePassword = async () => {
    if (password.length < 4) {
      setUnlockError('Password must be at least 4 characters');
      return;
    }
    try {
      await api.post('/diary/lock', { password });
      setHasPassword(true);
      setDialogMode('unlock');
      setUnlockError('');
      alert('Password created! Now enter it to unlock your diary.');
      setPassword('');
    } catch (error: any) {
      setUnlockError(error.response?.data?.error || 'Failed to create password');
    }
  };

  const handleLock = () => {
    setIsLocked(true);
    setEntries([]);
    setPassword('');
  };

  const handleOpenDialog = (entry?: any) => {
    if (entry) {
      setSelectedEntry(entry);
      setFormData({
        title: entry.title || '',
        content: entry.content || '',
        mood: entry.mood || '',
        tags: entry.tags?.join(', ') || '',
        goalsCompleted: entry.goalsCompleted?.join(', ') || '',
        goalsMissed: entry.goalsMissed?.join(', ') || '',
        nextDayGoals: entry.nextDayGoals?.join(', ') || '',
        reflections: entry.reflections || ''
      });
    } else {
      setSelectedEntry(null);
      setFormData({
        title: '',
        content: '',
        mood: '',
        tags: '',
        goalsCompleted: '',
        goalsMissed: '',
        nextDayGoals: '',
        reflections: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        date: new Date(),
        title: formData.title,
        content: formData.content,
        mood: formData.mood,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        goalsCompleted: formData.goalsCompleted.split(',').map(t => t.trim()).filter(Boolean),
        goalsMissed: formData.goalsMissed.split(',').map(t => t.trim()).filter(Boolean),
        nextDayGoals: formData.nextDayGoals.split(',').map(t => t.trim()).filter(Boolean),
        reflections: formData.reflections
      };

      if (selectedEntry) {
        await api.put(`/diary/entries/${selectedEntry._id}`, data);
      } else {
        await api.post('/diary/entries', data);
      }

      setOpenDialog(false);
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await api.delete(`/diary/entries/${id}`);
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const openDiary = () => {
    if (!hasPassword) {
      setDialogMode('create');
    } else {
      setDialogMode('unlock');
    }
    setOpenDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isLocked) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card sx={{ 
          maxWidth: 400, 
          width: '100%', 
          p: 3,
          textAlign: 'center'
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            bgcolor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Lock sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            My Learning Diary
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {hasPassword 
              ? 'Enter your password to unlock your diary'
              : 'Create a password to protect your diary'
            }
          </Typography>
          
          <Button
            fullWidth
            variant="contained"
            startIcon={hasPassword ? <LockOpen /> : <Create />}
            onClick={openDiary}
            size="large"
          >
            {hasPassword ? 'Unlock Diary' : 'Set Up Password'}
          </Button>
        </Card>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {dialogMode === 'create' ? 'Create Diary Password' : 'Unlock Diary'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {dialogMode === 'create' 
                ? 'Create a password to protect your learning diary. This password will be required every time you access your diary.'
                : 'Enter your password to access your diary.'
              }
            </Typography>
            
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  dialogMode === 'create' ? handleCreatePassword() : handleUnlock();
                }
              }}
              error={!!unlockError}
              helperText={unlockError}
              sx={{ mb: 2 }}
            />

            {dialogMode === 'create' && (
              <Typography variant="caption" color="text.secondary">
                Password must be at least 4 characters long.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={dialogMode === 'create' ? handleCreatePassword : handleUnlock}
            >
              {dialogMode === 'create' ? 'Create Password' : 'Unlock'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              My Diary
            </Typography>
            <Typography color="text.secondary">
              Track your learning journey
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              startIcon={<Lock />}
              onClick={handleLock}
            >
              Lock
            </Button>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              New Entry
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {entries.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No diary entries yet
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                >
                  Create Your First Entry
                </Button>
              </Card>
            </Grid>
          ) : (
            entries.map((entry) => (
              <Grid item xs={12} md={6} key={entry._id}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {entry.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        </Box>
                      </Box>
                      {entry.mood && (
                        <Chip 
                          size="small"
                          icon={<EmojiEmotions sx={{ color: `${moodColors[entry.mood]} !important` }} />}
                          label={entry.mood}
                          sx={{ 
                            bgcolor: `${moodColors[entry.mood]}20`,
                            color: moodColors[entry.mood]
                          }}
                        />
                      )}
                    </Box>

                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {entry.content}
                    </Typography>

                    {entry.tags?.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                        {entry.tags.map((tag: string, i: number) => (
                          <Chip key={i} size="small" label={tag} variant="outlined" />
                        ))}
                      </Box>
                    )}

                    {(entry.goalsCompleted?.length > 0 || entry.goalsMissed?.length > 0) && (
                      <Box sx={{ mb: 2 }}>
                        {entry.goalsCompleted?.length > 0 && (
                          <Typography variant="body2" color="success.main">
                            ✓ Completed: {entry.goalsCompleted.join(', ')}
                          </Typography>
                        )}
                        {entry.goalsMissed?.length > 0 && (
                          <Typography variant="body2" color="error.main">
                            ✗ Missed: {entry.goalsMissed.join(', ')}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(entry)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(entry._id)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {selectedEntry ? 'Edit Entry' : 'New Diary Entry'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Mood</InputLabel>
                  <Select
                    value={formData.mood}
                    label="Mood"
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  >
                    <MenuItem value="great">Great</MenuItem>
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="okay">Okay</MenuItem>
                    <MenuItem value="bad">Bad</MenuItem>
                    <MenuItem value="terrible">Terrible</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="What happened today?"
                  multiline
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Goals Completed (comma separated)"
                  value={formData.goalsCompleted}
                  onChange={(e) => setFormData({ ...formData, goalsCompleted: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Goals Missed (comma separated)"
                  value={formData.goalsMissed}
                  onChange={(e) => setFormData({ ...formData, goalsMissed: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tomorrow's Goals (comma separated)"
                  value={formData.nextDayGoals}
                  onChange={(e) => setFormData({ ...formData, nextDayGoals: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reflections"
                  multiline
                  rows={2}
                  value={formData.reflections}
                  onChange={(e) => setFormData({ ...formData, reflections: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save Entry
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Diary;
