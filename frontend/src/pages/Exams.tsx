import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, Container, Typography, Card, CardContent, Grid, Button, 
  CircularProgress, Chip, LinearProgress, Radio, RadioGroup, 
  FormControlLabel, FormControl, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton 
} from '@mui/material';
import { 
  Timer, CheckCircle, Cancel, ArrowBack, ArrowForward,
  LocalFireDepartment, EmojiEvents 
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Exams = () => {
  const { mode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Available Exams
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Test your knowledge and track your progress
        </Typography>

        <Grid container spacing={3}>
          {exams.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <EmojiEvents sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No exams available
                </Typography>
                <Typography color="text.secondary">
                  Check back later for new exams
                </Typography>
              </Card>
            </Grid>
          ) : (
            exams.map((exam: any) => (
              <Grid item xs={12} md={6} key={exam._id}>
                <Card sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {exam.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exam.description || 'No description'}
                        </Typography>
                      </Box>
                      <Chip 
                        size="small"
                        icon={<Timer />}
                        label={`${exam.settings?.timeLimit || 60} min`}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small"
                        label={exam.difficulty || 'Medium'}
                        color={exam.difficulty === 'easy' ? 'success' : exam.difficulty === 'hard' ? 'error' : 'warning'}
                      />
                      <Chip size="small" label={exam.category} />
                      <Chip 
                        size="small"
                        label={`${exam.questions?.length || 0} questions`}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Passing Score: {exam.settings?.passingScore || 70}%
                      </Typography>
                      <Button 
                        variant="contained"
                        component={Link}
                        to={`/exams/${exam._id}`}
                      >
                        Start Exam
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
};

const ExamTaking = () => {
  const { mode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (examData && !showResult && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examData, showResult, timeLeft]);

  const fetchExam = async () => {
    try {
      const res = await api.post(`/exams/${id}/start`);
      setExamData(res.data);
      setTimeLeft(res.data.timeLimit * 60);
    } catch (error) {
      console.error('Error starting exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const res = await api.post(`/exams/${id}/submit`, {
        answers: formattedAnswers,
        timeSpent: (examData.timeLimit * 60) - timeLeft
      });

      setResult(res.data);
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting exam:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (showResult && result) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="md">
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              bgcolor: result.result.passed ? 'success.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}>
              {result.result.passed ? (
                <CheckCircle sx={{ fontSize: 60, color: 'white' }} />
              ) : (
                <Cancel sx={{ fontSize: 60, color: 'white' }} />
              )}
            </Box>
            
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {result.result.passed ? 'Congratulations!' : 'Keep Trying!'}
            </Typography>
            
            <Typography variant="h2" fontWeight={700} color={result.result.passed ? 'success.main' : 'error.main'} sx={{ my: 3 }}>
              {result.result.percentage}%
            </Typography>
            
            <Typography color="text.secondary">
              You scored {result.result.score} out of {result.result.totalPoints} points
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button variant="outlined" onClick={() => navigate('/exams')}>
                Back to Exams
              </Button>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Retake Exam
              </Button>
            </Box>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!examData?.questions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <Typography>Exam not found or not available</Typography>
      </Box>
    );
  }

  const question = examData.questions[currentQuestion];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 2 }}>
      <Container maxWidth="md">
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {examData.examTitle}
            </Typography>
            <Chip 
              icon={<Timer />}
              label={formatTime(timeLeft)}
              color={timeLeft < 300 ? 'error' : 'default'}
              sx={{ fontWeight: 600, fontSize: 16 }}
            />
          </CardContent>
          <LinearProgress 
            variant="determinate" 
            value={((currentQuestion + 1) / examData.questions.length) * 100} 
          />
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Question {currentQuestion + 1} of {examData.questions.length}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {question.points} points
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              {question.text}
            </Typography>

            {question.type === 'multiple_choice' && question.options && (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[question.questionId] || ''}
                  onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                >
                  {question.options.map((option: string, i: number) => (
                    <FormControlLabel
                      key={i}
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{ 
                        mb: 1, 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: answers[question.questionId] === option 
                          ? 'primary.main' 
                          : mode === 'dark' ? 'grey.800' : 'grey.100',
                        color: answers[question.questionId] === option ? 'white' : 'inherit',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: answers[question.questionId] === option 
                            ? 'primary.dark' 
                            : mode === 'dark' ? 'grey.700' : 'grey.200'
                        }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {question.type === 'short_answer' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your answer here..."
                value={answers[question.questionId] || ''}
                onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
          >
            Previous
          </Button>
          
          {currentQuestion === examData.questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit Exam
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Next
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export { Exams, ExamTaking };
