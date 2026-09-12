import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Card, CardContent, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, CircularProgress, Tabs, Tab, LinearProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [feedbackTrends, setFeedbackTrends] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get('/analytics/admin/stats'),
      api.get('/analytics/admin/recommendations'),
      api.get('/analytics/admin/feedback-trends')
    ])
      .then(([statsRes, recRes, feedbackRes]) => {
        setStats(statsRes.data);
        setRecommendations(recRes.data);
        setFeedbackTrends(feedbackRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" color="error">
          Access Denied - Admin Only
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, color: 'primary' },
          { label: 'Active Users (7d)', value: stats?.activeUsers || 0, color: 'success' },
          { label: 'Total Courses', value: stats?.totalCourses || 0, color: 'info' },
          { label: 'Total Enrollments', value: stats?.totalEnrollments || 0, color: 'warning' },
          { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, color: 'secondary' }
        ].map((item, i) => (
          <Grid item xs={12} sm={6} md={2.4} key={i}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color={`${item.color}.main`}>
                  {item.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Course Engagement" />
          <Tab label="Recommendations" />
          <Tab label="Feedback Trends" />
        </Tabs>
      </Card>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Top Courses by Enrollment</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Enrollments</TableCell>
                    <TableCell align="right">Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.courseEngagement?.map((course: any) => (
                    <TableRow key={course._id}>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell align="right">{course.enrolledCount}</TableCell>
                      <TableCell align="right">{course.rating?.toFixed(1) || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Total Generated</Typography>
                <Typography variant="h5">{recommendations?.totalGenerated || 0}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Adjusted on Feedback</Typography>
                <Typography variant="h5">{recommendations?.adjustedBasedOnFeedback || 0}</Typography>
              </Grid>
            </Grid>
            <Typography variant="h6" gutterBottom>Intent Distribution</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {recommendations?.intentDistribution?.map((item: any) => (
                <Chip 
                  key={item._id} 
                  label={`${item._id}: ${item.count}`} 
                  variant="outlined" 
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Feedback by Type (Last 30 days)</Typography>
                {feedbackTrends?.feedbackByType?.map((item: any) => (
                  <Box key={item._id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item._id}</Typography>
                      <Typography variant="body2">{item.count}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(item.count / (feedbackTrends?.feedbackByType?.reduce((a: any, b: any) => a + b.count, 0) || 1)) * 100} 
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sentiment Distribution</Typography>
                {feedbackTrends?.sentimentDistribution?.map((item: any) => (
                  <Box key={item._id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item._id}</Typography>
                      <Typography variant="body2">{item.count}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(item.count / (feedbackTrends?.sentimentDistribution?.reduce((a: any, b: any) => a + b.count, 0) || 1)) * 100}
                      color={item._id === 'positive' ? 'success' : item._id === 'negative' ? 'error' : 'primary'}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;
