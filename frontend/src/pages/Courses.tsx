import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button,
  CircularProgress, Chip, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, Pagination, alpha, useTheme
} from '@mui/material';
import { Search, ArrowForward } from '@mui/icons-material';
import { coursesAPI } from '../services/api';
import SEO from '../components/SEO';

const ACCENT = '#2E7D32';
const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'];
const CATEGORIES = ['All', 'Programming', 'Data Science', 'Web Development', 'Machine Learning', 'Mathematics', 'Science'];

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const theme = useTheme();

  useEffect(() => {
    setLoading(true);
    coursesAPI.getAll({ search: search || undefined, category: category || undefined, difficulty: difficulty || undefined, page })
      .then(res => {
        setCourses(res.data.courses || []);
        setTotalPages(res.data.pagination?.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, difficulty, page]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <SEO 
        title="Explore Courses"
        description="Browse our catalog of AI-powered courses. Learn programming, data science, web development, machine learning, and more with adaptive learning technology."
        url="/courses"
      />
      {/* Header section */}
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 5 }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Catalogue
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Explore Courses
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {courses.length} courses found
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            size="small"
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value === 'All' ? '' : e.target.value); setPage(1); }}>
              {CATEGORIES.map(c => <MenuItem key={c} value={c === 'All' ? '' : c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select value={difficulty} label="Difficulty" onChange={(e) => { setDifficulty(e.target.value === 'All' ? '' : e.target.value); setPage(1); }}>
              {DIFFICULTIES.map(d => <MenuItem key={d} value={d === 'All' ? '' : d}>{d === 'All' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>
          {(search || category || difficulty) && (
            <Button size="small" onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); setPage(1); }}
              sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
              Clear filters
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={28} />
          </Box>
        ) : courses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>No courses found</Typography>
            <Button onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); }}>Clear filters</Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Card sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    '&:hover': { borderColor: alpha(ACCENT, 0.4), boxShadow: 'none' }
                  }}>
                    {/* Minimal thumbnail */}
                    <Box sx={{
                      height: 120,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      position: 'relative'
                    }}>
                      <Typography sx={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontSize: '2.5rem', fontWeight: 700,
                        color: alpha(ACCENT, 0.25),
                        letterSpacing: '-0.04em'
                      }}>
                        {course.title?.charAt(0)}
                      </Typography>
                      <Chip
                        label={course.difficulty}
                        size="small"
                        color={course.difficulty === 'beginner' ? 'success' : course.difficulty === 'intermediate' ? 'warning' : 'error'}
                        sx={{ position: 'absolute', top: 10, left: 10 }}
                      />
                    </Box>

                    <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                      <Typography sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
                        {course.category}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.35, mb: 1 }}>
                        {course.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.6, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                          {course.modules?.length || 0} modules
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: course.isFree ? 'success.main' : 'text.primary' }}>
                          {course.isFree ? 'Free' : course.price > 0 ? `$${course.price}` : 'Free'}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box sx={{ px: 2.5, pb: 2.5 }}>
                      <Button
                        fullWidth component={Link} to={`/courses/${course._id}`}
                        variant="outlined" size="small"
                        endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                        sx={{ fontSize: '0.8rem' }}
                      >
                        View course
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Courses;
