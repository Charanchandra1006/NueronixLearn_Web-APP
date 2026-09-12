import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, LinearProgress, Chip, TextField, Alert, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { learningAPI, mlAPI } from '../services/api';

const Learn = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [cognitiveLoad, setCognitiveLoad] = useState<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const loadModule = async () => {
    setLoading(true);
    setResult(null);
    setAnswer('');
    startTimeRef.current = Date.now();
    
    try {
      const res = await learningAPI.getNextModule(courseId!);
      if (res.data.completed) {
        setModule({ completed: true });
      } else {
        setModule(res.data.module);
        setProgress(res.data.progress);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModule();
  }, [courseId]);

  const handleComplete = async () => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    await learningAPI.updateProgress({
      courseId: courseId!,
      moduleId: module._id,
      completed: true,
      timeSpent
    });

    const metrics = {
      timeOnModule: timeSpent,
      errorRate: result?.correct ? 0 : 1,
      hintUsage: 0,
      attempts: 1,
      previousLoad: cognitiveLoad
    };

    try {
      const loadRes = await mlAPI.updateCognitiveLoad({ courseId: courseId!, metrics });
      setCognitiveLoad(loadRes.data.cognitiveLoad);
    } catch (err) {
      console.error(err);
    }

    loadModule();
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setAnalyzing(true);

    try {
      const [answerRes, analysisRes] = await Promise.all([
        learningAPI.submitAnswer({
          courseId: courseId!,
          assessmentId: module.assessments?.[0]?._id || 'demo',
          questionId: module.assessments?.[0]?.questions?.[0]?._id || 'demo',
          answer
        }),
        mlAPI.analyzeResponse({ response: answer, question: module.assessments?.[0]?.questions?.[0]?.text })
      ]);

      setResult({
        ...answerRes.data,
        analysis: analysisRes.data
      });
    } catch (err) {
      setResult({ correct: false, feedback: 'Analysis completed' });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (module?.completed) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Course Completed!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Congratulations on completing this course!
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          {module?.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {cognitiveLoad !== null && (
            <Chip 
              label={`Cognitive Load: ${cognitiveLoad}%`} 
              color={cognitiveLoad > 70 ? 'error' : cognitiveLoad > 40 ? 'warning' : 'success'}
            />
          )}
          <Typography color="text.secondary">
            {progress?.completed}/{progress?.total} completed
          </Typography>
        </Box>
      </Box>

      <LinearProgress 
        variant="determinate" 
        value={progress?.percentage || 0} 
        sx={{ mb: 4, height: 8, borderRadius: 4 }}
      />

      <Card>
        <CardContent>
          <Chip label={module?.type} size="small" sx={{ mb: 2 }} />
          
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {module?.content?.substring(0, 100)}...
          </Typography>
          
          <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 4 }}>
            {module?.content}
          </Typography>

          {module?.type === 'quiz' && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Test Your Knowledge
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                onClick={handleSubmitAnswer}
                disabled={analyzing || !answer.trim()}
              >
                {analyzing ? <CircularProgress size={24} /> : 'Submit Answer'}
              </Button>

              {result && (
                <Alert 
                  severity={result.correct ? 'success' : 'info'} 
                  sx={{ mt: 3 }}
                >
                  <Typography fontWeight={600}>
                    {result.correct ? 'Correct!' : 'Keep Learning!'}
                  </Typography>
                  <Typography variant="body2">
                    {result.analysis?.feedback || result.explanation}
                  </Typography>
                  {result.analysis?.concepts?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" fontWeight={600}>Concepts detected:</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {result.analysis.concepts.map((c: string, i: number) => (
                          <Chip key={i} label={c} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Alert>
              )}
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" size="large" onClick={handleComplete}>
              Continue to Next Module
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Learn;
