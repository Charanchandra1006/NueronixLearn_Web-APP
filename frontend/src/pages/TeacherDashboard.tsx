import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, CircularProgress, Chip, alpha, useTheme, Divider,
  IconButton, Menu, MenuItem
} from '@mui/material';
import { Add, People, School, TrendingUp, BarChart, MoreHoriz, Visibility, Edit } from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ACCENT = '#2E7D32';

const StatCard = ({ label, value, icon, sub }: any) => (
  <Card>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
          {label}
        </Typography>
        <Box sx={{ p: 0.75, borderRadius: '6px', bgcolor: alpha(ACCENT, 0.1), color: ACCENT, display: 'flex' }}>
          {icon}
        </Box>
      </Box>
      <Typography sx={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: '2rem', fontWeight: 700,
        letterSpacing: '-0.025em', lineHeight: 1, color: 'text.primary'
      }}>
        {value}
      </Typography>
      {sub && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{sub}</Typography>}
    </CardContent>
  </Card>
);

const TeacherDashboard = () => {
  const { mode } = useCustomTheme();
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, averageRating: 0, totalRatings: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  useEffect(() => {
    Promise.all([api.get('/courses/teacher'), api.get('/auth/me')])
      .then(([coursesRes, userRes]) => {
        setCourses(coursesRes.data.courses || []);
        const tp = userRes.data.user.teacherProfile || {};
        setStats({
          totalStudents: tp.totalStudents || 0,
          totalCourses: coursesRes.data.courses?.length || 0,
          averageRating: tp.averageRating || 0,
          totalRatings: tp.totalRatings || 0
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <CircularProgress size={28} />
    </Box>
  );

  if (user?.role !== 'teacher') return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography color="error" variant="h6">Access denied — teachers only.</Typography>
    </Container>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Teacher
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Dashboard
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Add />} component={Link} to="/teacher/create-course" size="small">
              New course
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 6 }}>
          <Grid item xs={6} md={3}>
            <StatCard label="Students" value={stats.totalStudents} icon={<People sx={{ fontSize: 16 }} />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Courses" value={stats.totalCourses} icon={<School sx={{ fontSize: 16 }} />} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Avg Rating" value={stats.averageRating.toFixed(1)}
              icon={<TrendingUp sx={{ fontSize: 16 }} />} sub="out of 5" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Reviews" value={stats.totalRatings} icon={<BarChart sx={{ fontSize: 16 }} />} />
          </Grid>
        </Grid>

        {/* Quick actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 5, flexWrap: 'wrap' }}>
          <Button variant="outlined" component={Link} to="/teacher/create-exam" size="small" startIcon={<Add />}>
            Create exam
          </Button>
          <Button variant="outlined" component={Link} to="/teacher/exams" size="small">
            Manage exams
          </Button>
        </Box>

        {/* Courses */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
            Your courses
          </Typography>
        </Box>

        {courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px' }}>
            <School sx={{ fontSize: 40, color: 'text.secondary', mb: 2, opacity: 0.4 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>No courses yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 4, fontSize: '0.9rem' }}>
              Create your first course to start teaching.
            </Typography>
            <Button variant="contained" component={Link} to="/teacher/create-course" startIcon={<Add />}>
              Create course
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {courses.map((course: any) => (
              <Grid item xs={12} md={6} key={course._id}>
                <Card sx={{ '&:hover': { borderColor: alpha(ACCENT, 0.4) } }}>
                  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                          <Chip label={course.isPublished ? 'Published' : 'Draft'}
                            color={course.isPublished ? 'success' : 'default'} size="small" />
                          <Chip label={course.difficulty} size="small"
                            color={course.difficulty === 'beginner' ? 'success' : course.difficulty === 'intermediate' ? 'warning' : 'error'} />
                        </Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.35, mb: 0.5 }} noWrap>
                          {course.title}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }} noWrap>
                          {course.category} • {course.modules?.length || 0} modules
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedCourse(course); }}
                        sx={{ ml: 1, flexShrink: 0 }}
                      >
                        <MoreHoriz sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{course.enrolledCount || 0}</Typography>
                        </Box>
                        {course.rating > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            ⭐ {course.rating.toFixed(1)}
                          </Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: course.isFree ? 'success.main' : 'text.primary' }}>
                        {course.isFree ? 'Free' : course.price > 0 ? `$${course.price}` : 'Free'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 160 } }}>
        <MenuItem component={Link} to={`/teacher/edit-course/${selectedCourse?._id}`} onClick={() => setAnchorEl(null)}>
          <Edit sx={{ fontSize: 15, mr: 1.5, color: 'text.secondary' }} />
          <Typography fontSize="0.875rem">Edit</Typography>
        </MenuItem>
        <MenuItem component={Link} to={`/courses/${selectedCourse?._id}`} onClick={() => setAnchorEl(null)}>
          <Visibility sx={{ fontSize: 15, mr: 1.5, color: 'text.secondary' }} />
          <Typography fontSize="0.875rem">Preview</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeacherDashboard;
