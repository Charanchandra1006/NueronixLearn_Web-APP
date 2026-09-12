import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent, Grid, Button,
  CircularProgress, Chip, IconButton, Menu, MenuItem
} from '@mui/material';
import {
  Add, Edit, Visibility, MoreVert, Delete, Publish, School
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import api, { examsAPI } from '../services/api';

const TeacherExamsList = () => {
  useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams?status=all');
      setExams(res.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await examsAPI.publish(id);
      fetchExams();
    } catch (error) {
      console.error('Error publishing exam:', error);
    }
    setAnchorEl(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
    setAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, exam: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedExam(exam);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              My Exams
            </Typography>
            <Typography color="text.secondary">
              Manage your exams
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/teacher/create-exam"
          >
            Create Exam
          </Button>
        </Box>

        <Grid container spacing={3}>
          {exams.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No exams yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Create your first exam to test your students
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  component={Link}
                  to="/teacher/create-exam"
                >
                  Create Exam
                </Button>
              </Card>
            </Grid>
          ) : (
            exams.map((exam: any) => (
              <Grid item xs={12} md={6} key={exam._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {exam.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {exam.description || 'No description'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={exam.status}
                            color={exam.status === 'published' ? 'success' : 'default'}
                          />
                          <Chip size="small" label={exam.difficulty || 'Medium'} />
                          <Chip size="small" label={exam.category} />
                          <Chip size="small" label={`${exam.questions?.length || 0} questions`} />
                        </Box>
                      </Box>
                      <IconButton onClick={(e) => handleMenuClick(e, exam)}>
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {exam.totalAttempts || 0} attempts • Avg: {exam.averageScore?.toFixed(1) || 0}%
                      </Typography>
                      {exam.status !== 'published' && (
                        <Button
                          size="small"
                          startIcon={<Publish />}
                          onClick={() => handlePublish(exam._id)}
                        >
                          Publish
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { navigate(`/exams/${selectedExam?._id}`); setAnchorEl(null); }}>
            <Visibility sx={{ mr: 1 }} /> View Results
          </MenuItem>
          <MenuItem onClick={() => { navigate(`/teacher/edit-exam/${selectedExam?._id}`); setAnchorEl(null); }}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedExam?._id)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
};

export default TeacherExamsList;
