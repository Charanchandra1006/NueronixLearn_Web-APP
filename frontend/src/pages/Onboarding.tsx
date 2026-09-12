import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid, TextField,
  Button, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput,
  CircularProgress, LinearProgress, Stepper, Step, StepLabel, StepConnector,
  stepConnectorClasses
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';
import { AutoAwesome, Person, Psychology, EmojiEvents } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// ─── Styled stepper connector ────────────────────────────────────────────────

const NeonConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { backgroundImage: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)' }
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { backgroundImage: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)' }
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#1e1e1e',
    borderRadius: 1
  }
}));

// ─── Data ─────────────────────────────────────────────────────────────────────

const subjectOptions = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'English', 'History', 'Geography', 'Economics', 'Business Studies',
  'Accounting', 'Psychology', 'Philosophy', 'Art', 'Music'
];

const goalOptions = [
  { value: 'board_exams', label: 'Board Exams' },
  { value: 'jee', label: 'JEE Preparation' },
  { value: 'neet', label: 'NEET Preparation' },
  { value: 'certification', label: 'Professional Certification' },
  { value: 'skill_improvement', label: 'Skill Improvement' },
  { value: 'knowledge_exploration', label: 'Knowledge Exploration' },
  { value: 'career', label: 'Career Advancement' }
];

const steps = [
  { label: 'About You', icon: <Person /> },
  { label: 'Learning Style', icon: <Psychology /> },
  { label: 'Goals', icon: <EmojiEvents /> }
];

// ─── Common MUI dark field sx ─────────────────────────────────────────────────

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': { borderColor: '#2a2a2a' },
    '&:hover fieldset': { borderColor: '#2E7D32' },
    '&.Mui-focused fieldset': { borderColor: '#2E7D32' }
  },
  '& .MuiInputLabel-root': { color: '#666' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2E7D32' },
  '& .MuiSvgIcon-root': { color: '#666' },
  '& .MuiSelect-icon': { color: '#666' },
  '& .MuiMenuItem-root': { color: '#fff' }
};

const menuProps = {
  PaperProps: {
    sx: { bgcolor: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a' }
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'teacher') {
      navigate('/teacher');
      return;
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    grade: '',
    subjectInterests: [] as string[],
    weakAreas: [] as string[],
    preferredLearningStyle: 'mixed',
    learningGoals: [] as string[],
    currentPerformanceLevel: 'average',
    pacePreference: 'medium',
    languagePreference: 'en',
    targetExamDate: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      setLoading(true);
      try {
        await authAPI.completeOnboarding({
          ...formData,
          targetExamDate: formData.targetExamDate || undefined
        });
        navigate('/study-plan');  // Send straight to Study Plan so they see their auto-generated roadmaps
      } catch (error) {
        console.error('Onboarding error:', error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const pageVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        py: 6
      }}
    >
      <Container maxWidth="md">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <AutoAwesome sx={{ color: '#2E7D32', fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                NeuronixLearn
              </Typography>
            </Box>
            <Typography variant="body1" color="#666">
              Let's personalise your AI learning experience
            </Typography>
          </Box>
        </motion.div>

        {/* Stepper */}
        <Box sx={{ mb: 5 }}>
          <Stepper activeStep={activeStep} alternativeLabel connector={<NeonConnector />}>
            {steps.map((step, idx) => (
              <Step key={step.label} completed={activeStep > idx}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: activeStep >= idx ? '#2E7D32' : '#1a1a1a',
                        border: `2px solid ${activeStep >= idx ? '#2E7D32' : '#2a2a2a'}`,
                        color: activeStep >= idx ? '#000' : '#555',
                        transition: 'all 0.3s'
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: activeStep >= idx ? '#2E7D32' : '#555',
                      fontWeight: activeStep === idx ? 700 : 400,
                      mt: 1
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step progress bar */}
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / steps.length) * 100}
            sx={{
              mt: 3,
              height: 3,
              borderRadius: 2,
              bgcolor: '#1a1a1a',
              '& .MuiLinearProgress-bar': {
                backgroundImage: 'linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)'
              }
            }}
          />
        </Box>

        {/* Card */}
        <Card
          sx={{
            bgcolor: '#111',
            border: '1px solid #1e1e1e',
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {loading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  sx={{
                    bgcolor: '#1a1a1a',
                    '& .MuiLinearProgress-bar': { bgcolor: '#2E7D32' }
                  }}
                />
                <Typography variant="caption" color="#2E7D32" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Setting up your personalised study plan…
                </Typography>
              </Box>
            )}

            <AnimatePresence mode="wait">

              {/* ── Step 0: About You ── */}
              {activeStep === 0 && (
                <motion.div
                  key="step0"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
                    Tell us about yourself
                  </Typography>
                  <Typography variant="body2" color="#666" sx={{ mb: 4 }}>
                    This helps us tailor your learning roadmap
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Grade / Class"
                        value={formData.grade}
                        onChange={(e) => handleChange('grade', e.target.value)}
                        placeholder="e.g., Class 10, College 2nd Year"
                        sx={fieldSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Performance Level</InputLabel>
                        <Select
                          value={formData.currentPerformanceLevel}
                          label="Performance Level"
                          onChange={(e) => handleChange('currentPerformanceLevel', e.target.value)}
                          MenuProps={menuProps}
                        >
                          <MenuItem value="below_average">Below Average</MenuItem>
                          <MenuItem value="average">Average</MenuItem>
                          <MenuItem value="above_average">Above Average</MenuItem>
                          <MenuItem value="excellent">Excellent</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Subjects You're Interested In</InputLabel>
                        <Select
                          multiple
                          value={formData.subjectInterests}
                          onChange={(e) => handleChange('subjectInterests', e.target.value)}
                          input={<OutlinedInput label="Subjects You're Interested In" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(46,125,50,0.15)', color: '#2E7D32', borderColor: '#2E7D32' }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={menuProps}
                        >
                          {subjectOptions.map((subject) => (
                            <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Subjects You Find Difficult</InputLabel>
                        <Select
                          multiple
                          value={formData.weakAreas}
                          onChange={(e) => handleChange('weakAreas', e.target.value)}
                          input={<OutlinedInput label="Subjects You Find Difficult" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={value}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(255,183,77,0.15)', color: '#ffb74d', borderColor: '#ffb74d' }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={menuProps}
                        >
                          {subjectOptions.map((subject) => (
                            <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="caption" color="#555" sx={{ mt: 0.5, display: 'block' }}>
                        These will automatically appear as AI roadmaps in your Study Plan
                      </Typography>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* ── Step 1: Learning Style ── */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
                    How do you prefer to learn?
                  </Typography>
                  <Typography variant="body2" color="#666" sx={{ mb: 4 }}>
                    The AI will adapt resource recommendations to your style
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Preferred Learning Style</InputLabel>
                        <Select
                          value={formData.preferredLearningStyle}
                          label="Preferred Learning Style"
                          onChange={(e) => handleChange('preferredLearningStyle', e.target.value)}
                          MenuProps={menuProps}
                        >
                          <MenuItem value="video">Video Lectures</MenuItem>
                          <MenuItem value="text">Reading Materials</MenuItem>
                          <MenuItem value="practice">Practice Exercises</MenuItem>
                          <MenuItem value="interactive">Interactive Content</MenuItem>
                          <MenuItem value="mixed">Mix of Everything</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Learning Pace</InputLabel>
                        <Select
                          value={formData.pacePreference}
                          label="Learning Pace"
                          onChange={(e) => handleChange('pacePreference', e.target.value)}
                          MenuProps={menuProps}
                        >
                          <MenuItem value="slow">Slow — Take your time</MenuItem>
                          <MenuItem value="medium">Medium — Comfortable pace</MenuItem>
                          <MenuItem value="fast">Fast — Quick learner</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* ── Step 2: Goals ── */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700, color: '#fff' }}>
                    What are your learning goals?
                  </Typography>
                  <Typography variant="body2" color="#666" sx={{ mb: 4 }}>
                    We'll align your study plan and resources accordingly
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth sx={fieldSx}>
                        <InputLabel>Learning Goals</InputLabel>
                        <Select
                          multiple
                          value={formData.learningGoals}
                          onChange={(e) => handleChange('learningGoals', e.target.value)}
                          input={<OutlinedInput label="Learning Goals" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={goalOptions.find(g => g.value === value)?.label || value}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(46,125,50,0.15)', color: '#2E7D32' }}
                                />
                              ))}
                            </Box>
                          )}
                          MenuProps={menuProps}
                        >
                          {goalOptions.map((goal) => (
                            <MenuItem key={goal.value} value={goal.value}>{goal.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Target Exam Date (Optional)"
                        type="date"
                        value={formData.targetExamDate}
                        onChange={(e) => handleChange('targetExamDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={fieldSx}
                      />
                    </Grid>
                  </Grid>

                  {/* Summary */}
                  {(formData.weakAreas.length > 0 || formData.subjectInterests.length > 0) && (
                    <Box
                      sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(46,125,50,0.06)',
                        border: '1px solid rgba(46,125,50,0.15)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AutoAwesome sx={{ color: '#2E7D32', fontSize: 16 }} />
                        <Typography variant="body2" color="#2E7D32" fontWeight={600}>
                          Your Study Plan will be auto-generated for:
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {[...new Set([...formData.weakAreas, ...formData.subjectInterests])].map((s) => (
                          <Chip
                            key={s}
                            label={s}
                            size="small"
                            sx={{ bgcolor: 'rgba(46,125,50,0.12)', color: '#2E7D32', fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
              <Button
                disabled={activeStep === 0 || loading}
                onClick={handleBack}
                sx={{ color: '#666', '&:hover': { color: '#fff' } }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={16} color="inherit" /> : undefined
                }
                sx={{
                  bgcolor: '#2E7D32',
                  color: '#000',
                  fontWeight: 700,
                  px: 4,
                  '&:hover': { bgcolor: '#1B5E20' },
                  '&:disabled': { bgcolor: '#1a1a1a', color: '#444' }
                }}
              >
                {loading
                  ? 'Setting up…'
                  : activeStep === steps.length - 1
                  ? 'Complete Setup'
                  : 'Next'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Onboarding;
