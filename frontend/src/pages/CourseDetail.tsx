import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { coursesAPI } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    coursesAPI.getById(id!)
      .then(res => {
        setCourse(res.data.course);
        setIsEnrolled(res.data.isEnrolled || false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await coursesAPI.enroll(id!);
      if (res.data.demoEnrollment) {
        alert('Demo enrollment successful! You can now access the course.');
      }
      setIsEnrolled(true);
      navigate(`/learn/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Course not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 300, bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Typography variant="h1" color="text.secondary">{course.title?.charAt(0) || 'C'}</Typography>
          </Box>
          
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {course.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Chip label={course.difficulty || 'beginner'} color={course.difficulty === 'beginner' ? 'success' : course.difficulty === 'intermediate' ? 'warning' : 'error'} />
            <Chip label={course.category || 'General'} variant="outlined" />
            {course.isFree === false && course.price > 0 && (
              <Chip label={`$${course.price}`} color="primary" />
            )}
          </Box>

          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {course.description || 'No description available.'}
          </Typography>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            What you'll learn
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {(course.whatYouWillLearn?.length > 0 
              ? course.whatYouWillLearn 
              : ['Adaptive learning powered by AI', 'Real-time progress tracking', 'Personalized recommendations', 'Cognitive load monitoring']
            ).map((item: string, i: number) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography>{item}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            Course Content ({course.modules?.length || 0} modules)
          </Typography>
          <List>
            {course.modules?.length > 0 ? (
              course.modules.map((module: any, index: number) => (
                <ListItem key={module._id || index} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                  <ListItemIcon>
                    <PlayArrowIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${index + 1}. ${module.title}`} 
                    secondary={`${module.duration || 10} min • ${module.type || 'video'}`} 
                  />
                </ListItem>
              ))
            ) : (
              <ListItem sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
                <ListItemText 
                  primary="No content added yet" 
                  secondary="Check back later for course materials"
                />
              </ListItem>
            )}
          </List>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                <PersonIcon fontSize="small" />
                <Typography variant="body2">Instructor: {course.instructor?.name || 'Unknown'}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary' }}>
                <AccessTimeIcon fontSize="small" />
                <Typography variant="body2">{course.modules?.length || 0} modules</Typography>
              </Box>

              {isEnrolled ? (
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate(`/learn/${id}`)}
                >
                  Continue Learning
                </Button>
              ) : (
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? <CircularProgress size={24} /> : course.isFree || course.price === 0 ? 'Enroll for Free' : `Enroll - $${course.price}`}
                </Button>
              )}

              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                component={Link}
                to="/courses"
              >
                Back to Courses
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;
