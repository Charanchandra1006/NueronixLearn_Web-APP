import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Card, CardContent, Button,
    CircularProgress, Chip, LinearProgress, alpha, useTheme, Divider
} from '@mui/material';
import { School, PlayArrow, CheckCircle, ArrowForward } from '@mui/icons-material';
import { coursesAPI } from '../services/api';

const ACCENT = '#2E7D32';

const MyCourses = () => {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        coursesAPI.getMyCourses()
            .then(res => setEnrollments(res.data.courses || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress size={28} />
        </Box>
    );

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 5 }}>
                <Container maxWidth="lg">
                    <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        Learning
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                            My Courses
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {enrollments.length} enrolled
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 5 }}>
                {enrollments.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center', py: 12,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px'
                    }}>
                        <School sx={{ fontSize: 40, color: 'text.secondary', mb: 2, opacity: 0.4 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>No courses yet</Typography>
                        <Typography color="text.secondary" sx={{ mb: 4, fontSize: '0.9rem' }}>
                            Browse the catalogue and enroll in your first course.
                        </Typography>
                        <Button variant="contained" component={Link} to="/courses" endIcon={<ArrowForward />}>
                            Browse courses
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {enrollments.map((enrollment: any, i: number) => {
                            const course = enrollment.course;
                            if (!course) return null;
                            const modulesTotal = course.modules?.length || 0;
                            const modulesCompleted = enrollment.progress || 0;
                            const pct = modulesTotal > 0 ? Math.round((modulesCompleted / modulesTotal) * 100) : 0;
                            const completed = enrollment.completed;

                            return (
                                <Grid item xs={12} sm={6} md={4} key={course._id || i}>
                                    <Card sx={{
                                        height: '100%', display: 'flex', flexDirection: 'column',
                                        '&:hover': { borderColor: alpha(ACCENT, 0.4) }
                                    }}>
                                        {/* Header bar */}
                                        <Box sx={{
                                            height: 4, borderRadius: '8px 8px 0 0',
                                            background: completed
                                                ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                                                : `linear-gradient(90deg, ${ACCENT}, #4DFFA3)`,
                                            width: `${Math.max(pct, 8)}%`
                                        }} />

                                        <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                <Chip
                                                    label={course.difficulty}
                                                    size="small"
                                                    color={course.difficulty === 'beginner' ? 'success' : course.difficulty === 'intermediate' ? 'warning' : 'error'}
                                                />
                                                {completed && <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />}
                                            </Box>

                                            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.35, mb: 1 }}>
                                                {course.title}
                                            </Typography>
                                            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', mb: 2.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {course.description}
                                            </Typography>

                                            {/* Progress */}
                                            <Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                                                    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                        Progress
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: completed ? 'success.main' : 'text.primary' }}>
                                                        {pct}%
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate" value={pct}
                                                    color={completed ? 'success' : 'primary'}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    {modulesCompleted} / {modulesTotal} modules
                                                </Typography>
                                            </Box>
                                        </CardContent>

                                        <Divider />
                                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                component={Link} to={`/learn/${course._id}`}
                                                size="small" variant={completed ? 'outlined' : 'contained'}
                                                startIcon={<PlayArrow sx={{ fontSize: 15 }} />}
                                                sx={{ fontSize: '0.8rem' }}
                                            >
                                                {completed ? 'Review' : 'Continue'}
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default MyCourses;
