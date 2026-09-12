import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, CircularProgress,
  MenuItem, Select, FormControl, InputLabel, IconButton, Chip,
  InputAdornment, alpha, useTheme, Divider, Card, CardContent
} from '@mui/material';
import { Add, Delete, ArrowBack, ArrowForward, Timer } from '@mui/icons-material';
import { examsAPI } from '../services/api';

const ACCENT = '#2E7D32';

interface Question {
  text: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem', display: 'block', mb: 2 }}>
    {children}
  </Typography>
);

const CreateExam = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', difficulty: 'medium',
    timeLimit: 30, passingScore: 70, maxAttempts: 3, questions: [] as Question[]
  });

  const handleChange = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const addQuestion = () => setFormData(prev => ({
    ...prev,
    questions: [...prev.questions, { text: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: 1, difficulty: 'medium' }]
  }));

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.questions];
    (updated[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, questions: updated }));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...formData.questions];
    if (!updated[qIndex].options) updated[qIndex].options = ['', '', '', ''];
    updated[qIndex].options![oIndex] = value;
    setFormData(prev => ({ ...prev, questions: updated }));
  };

  const removeQuestion = (index: number) =>
    setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) { alert('Please fill in required fields'); return; }
    if (formData.questions.length === 0) { alert('Please add at least one question'); return; }
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.text) { alert(`Please fill in question ${i + 1}`); return; }
      if (!q.correctAnswer) { alert(`Please set the correct answer for question ${i + 1}`); return; }
      if (q.type === 'multiple_choice' && q.options && q.options.filter(o => o.trim()).length < 2) {
        alert(`Question ${i + 1} needs at least 2 options`); return;
      }
    }
    setLoading(true);
    try {
      await examsAPI.create({
        title: formData.title, description: formData.description,
        category: formData.category, difficulty: formData.difficulty,
        settings: { timeLimit: formData.timeLimit, passingScore: formData.passingScore, maxAttempts: formData.maxAttempts, shuffleQuestions: false, shuffleOptions: false, showResults: true, allowReview: true },
        questions: formData.questions.map(q => ({ text: q.text, type: q.type, options: q.type === 'multiple_choice' ? q.options?.filter(o => o) : undefined, correctAnswer: q.correctAnswer, points: q.points, difficulty: q.difficulty }))
      });
      navigate('/teacher/exams');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button component={Link} to="/teacher" startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
              sx={{ color: 'text.secondary', fontSize: '0.82rem', p: 0.5 }}>
              Back
            </Button>
            <Typography sx={{ color: 'text.secondary' }}>/</Typography>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
              New Exam
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, letterSpacing: '-0.015em' }}>
            Create Exam
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Basic Info */}
          <Box>
            <SectionLabel>Basic Information</SectionLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Exam Title *" value={formData.title}
                onChange={e => handleChange('title', e.target.value)} placeholder="e.g., JavaScript Fundamentals Quiz" />
              <TextField fullWidth multiline rows={2} label="Description"
                value={formData.description} onChange={e => handleChange('description', e.target.value)}
                placeholder="Instructions for students" />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: 1, minWidth: 140 }}>
                  <InputLabel>Category *</InputLabel>
                  <Select value={formData.category} label="Category *" onChange={e => handleChange('category', e.target.value)}>
                    {['Programming', 'Data Science', 'Mathematics', 'Science', 'Language', 'Business'].map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1, minWidth: 140 }}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={formData.difficulty} label="Difficulty" onChange={e => handleChange('difficulty', e.target.value)}>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField label="Time Limit (min)" type="number" value={formData.timeLimit}
                  onChange={e => handleChange('timeLimit', Number(e.target.value))}
                  sx={{ flex: 1, minWidth: 140 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Timer sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }} />
                <TextField label="Passing Score (%)" type="number" value={formData.passingScore}
                  onChange={e => handleChange('passingScore', Number(e.target.value))} sx={{ flex: 1, minWidth: 140 }} />
                <TextField label="Max Attempts" type="number" value={formData.maxAttempts}
                  onChange={e => handleChange('maxAttempts', Number(e.target.value))} sx={{ flex: 1, minWidth: 140 }} />
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Questions */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <SectionLabel>Questions</SectionLabel>
              </Box>
              <Button variant="outlined" size="small" startIcon={<Add />} onClick={addQuestion}>
                Add question
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {formData.questions.length} question{formData.questions.length !== 1 ? 's' : ''}
            </Typography>

            {formData.questions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, border: `1px dashed ${theme.palette.divider}`, borderRadius: '6px' }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  No questions yet — click "Add question" to get started.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {formData.questions.map((question, qIndex) => (
                  <Card key={qIndex} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Chip
                          label={`Q${String(qIndex + 1).padStart(2, '0')}`}
                          size="small"
                          sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                        <IconButton size="small" onClick={() => removeQuestion(qIndex)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                          <Delete sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>

                      <TextField fullWidth multiline rows={2} label="Question *" value={question.text}
                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)} sx={{ mb: 2.5 }} />

                      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
                          <InputLabel>Type</InputLabel>
                          <Select value={question.type} label="Type"
                            onChange={e => updateQuestion(qIndex, 'type', e.target.value)}>
                            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                            <MenuItem value="short_answer">Short Answer</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ flex: 1, minWidth: 130 }}>
                          <InputLabel>Difficulty</InputLabel>
                          <Select value={question.difficulty} label="Difficulty"
                            onChange={e => updateQuestion(qIndex, 'difficulty', e.target.value)}>
                            <MenuItem value="easy">Easy</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="hard">Hard</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField type="number" size="small" label="Points" value={question.points}
                          onChange={e => updateQuestion(qIndex, 'points', Number(e.target.value))}
                          sx={{ width: 90 }} />
                      </Box>

                      {question.type === 'multiple_choice' && question.options && (
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
                            Options
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                            {question.options.map((option, oIndex) => (
                              <Box key={oIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', minWidth: 16, fontFamily: '"Space Grotesk"', fontWeight: 600 }}>
                                  {String.fromCharCode(65 + oIndex)}
                                </Typography>
                                <TextField fullWidth size="small" value={option || ''}
                                  onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                  placeholder={`Option ${oIndex + 1}`} />
                              </Box>
                            ))}
                          </Box>
                          <TextField fullWidth size="small" label="Correct Answer" value={question.correctAnswer || ''}
                            onChange={e => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                            select SelectProps={{ native: true }}>
                            <option value="">Select correct answer</option>
                            {question.options?.filter(o => o).map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </TextField>
                        </Box>
                      )}

                      {question.type === 'short_answer' && (
                        <TextField fullWidth size="small" label="Expected Answer" value={question.correctAnswer || ''}
                          onChange={e => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                          placeholder="Enter expected answer" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/teacher')} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button variant="contained"
              endIcon={loading ? <CircularProgress size={16} /> : <ArrowForward sx={{ fontSize: 16 }} />}
              onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create exam'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateExam;
