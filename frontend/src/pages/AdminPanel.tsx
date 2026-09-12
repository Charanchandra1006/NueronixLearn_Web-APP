import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Grid, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, Tabs, Tab, Avatar, Select, MenuItem, FormControl,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Tooltip, InputAdornment, LinearProgress, Divider, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Search, Delete, Edit, Block, CheckCircle, People, School, Assignment,
  Logout, Refresh, Close, Save, BarChart, PersonAdd, AdminPanelSettings,
  MenuBook, Quiz, TrendingUp, DoNotDisturb, Security
} from '@mui/icons-material';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../services/api';

// ── Theme tokens ──────────────────────────────────────────────────────────────

const BG     = '#0a0a0a';
const CARD   = '#111';
const BORDER = '#1a1a1a';
const ACCENT = '#2E7D32';

const cardSx       = { bgcolor: CARD, border: `1px solid ${BORDER}`, borderRadius: 2.5 };
const cellSx       = { borderColor: BORDER, color: '#bbb', fontSize: '0.82rem', py: 1.2 };
const headSx       = { borderColor: BORDER, color: '#555', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', py: 1 };
const fieldSx      = {
  '& .MuiOutlinedInput-root': { color: '#fff', '& fieldset': { borderColor: '#2a2a2a' }, '&:hover fieldset': { borderColor: ACCENT }, '&.Mui-focused fieldset': { borderColor: ACCENT } },
  '& .MuiInputLabel-root': { color: '#555' },
  '& .MuiInputLabel-root.Mui-focused': { color: ACCENT },
  '& .MuiSelect-icon': { color: '#555' },
};
const menuSx = { bgcolor: '#1a1a1a', color: '#fff', border: `1px solid ${BORDER}` };
const roleColor: Record<string, string> = { student: ACCENT, teacher: '#81c784', admin: '#e57373' };

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  _id: string; name: string; email: string; role: string;
  isActive: boolean; avatar?: string; createdAt: string;
  onboardingCompleted?: boolean;
  profile?: { subjectInterests?: string[]; weakAreas?: string[] };
}
interface AdminCourse {
  _id: string; title: string; category: string;
  teacherId: { name: string; email: string };
  enrollments: number; featured: boolean; createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>;
}

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }: {
  icon: React.ElementType; label: string; value: number | string; color: string; delay?: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, transition: { duration: 0.18 } }}>
    <Card sx={{ ...cardSx, position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: color }} />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: `${color}18`, display: 'inline-flex', mb: 1.5 }}>
          <Icon sx={{ color, fontSize: 20 }} />
        </Box>
        <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="#555" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [authed,    setAuthed]    = useState(false);
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [loginErr,  setLoginErr]  = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab,     setTab]     = useState(0);
  const [msg,     setMsg]     = useState('');
  const [err,     setErr]     = useState('');

  // ── Users ──────────────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [usersTotal,   setUsersTotal]   = useState(0);
  const [userSearch,   setUserSearch]   = useState('');
  const [userRole,     setUserRole]     = useState('');
  const [userPage,     setUserPage]     = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  const [editUser,   setEditUser]   = useState<AdminUser | null>(null);
  const [editName,   setEditName]   = useState('');
  const [editEmail,  setEditEmail]  = useState('');
  const [editRole,   setEditRole]   = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [viewUser,    setViewUser]    = useState<AdminUser | null>(null);
  const [viewDetail,  setViewDetail]  = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // ── Courses ────────────────────────────────────────────────────────────────
  const [courses,        setCourses]        = useState<AdminCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseSearch,   setCourseSearch]   = useState('');

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats,      setStats]      = useState<any>(null);
  const [topSubjects, setTopSubjects] = useState<any[]>([]);
  const [topTopics,   setTopTopics]   = useState<any[]>([]);
  const [userGrowth,  setUserGrowth]  = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Admin Management ───────────────────────────────────────────────────────
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [addAdminDialog, setAddAdminDialog] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminIsSuperAdmin, setNewAdminIsSuperAdmin] = useState(false);
  const [newAdminPermissions, setNewAdminPermissions] = useState({
    manageUsers: false,
    manageCourses: false,
    manageExams: false,
    manageAdmins: false,
    viewAnalytics: false,
    manageContent: false
  });
  const [addingAdmin, setAddingAdmin] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    if (token) {
      setAuthed(true);
      if (adminInfo) {
        const info = JSON.parse(adminInfo);
        setIsSuperAdmin(info.isSuperAdmin || false);
      }
    }
  }, []);

  const handleLogin = async () => {
    setLoggingIn(true); setLoginErr('');
    try {
      const res = await adminAPI.login(username, password);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
      setIsSuperAdmin(res.data.admin.isSuperAdmin);
      setAuthed(true);
    } catch (e: any) { setLoginErr(e.response?.data?.error || 'Invalid credentials'); }
    finally { setLoggingIn(false); }
  };

  const handleLogout = () => { 
    localStorage.removeItem('adminToken'); 
    localStorage.removeItem('adminInfo');
    setAuthed(false); 
  };

  // ── Data loaders ──────────────────────────────────────────────────────────

  const flash = (m: string, isErr = false) => {
    if (isErr) { setErr(m); setTimeout(() => setErr(''), 4000); }
    else       { setMsg(m); setTimeout(() => setMsg(''), 3000); }
  };

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
      setTopSubjects(res.data.topSubjects   || []);
      setTopTopics(res.data.topCompletedTopics || []);
      setUserGrowth(res.data.userGrowth     || []);
    } catch { /* silent */ } finally { setStatsLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminAPI.getUsers({ search: userSearch || undefined, role: userRole || undefined, page: userPage, limit: 25 });
      setUsers(res.data.users || []);
      setUsersTotal(res.data.total || 0);
    } catch { /* silent */ } finally { setUsersLoading(false); }
  }, [userSearch, userRole, userPage]);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await adminAPI.getCourses({ search: courseSearch || undefined, limit: 50 });
      setCourses(res.data.courses || []);
    } catch { /* silent */ } finally { setCoursesLoading(false); }
  }, [courseSearch]);

  const loadAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setAdminsLoading(true);
    try {
      const res = await adminAPI.listAdmins();
      setAdmins(res.data.admins || []);
    } catch { /* silent */ } finally { setAdminsLoading(false); }
  }, [isSuperAdmin]);

  const handleAddAdmin = async () => {
    if (!newAdminUsername || !newAdminEmail || !newAdminPassword) {
      flash('Please fill all required fields', true);
      return;
    }
    setAddingAdmin(true);
    try {
      await adminAPI.addAdmin({
        username: newAdminUsername,
        email: newAdminEmail,
        password: newAdminPassword,
        isSuperAdmin: newAdminIsSuperAdmin,
        permissions: newAdminPermissions
      });
      flash('Admin created successfully');
      setAddAdminDialog(false);
      setNewAdminUsername('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminIsSuperAdmin(false);
      setNewAdminPermissions({
        manageUsers: false,
        manageCourses: false,
        manageExams: false,
        manageAdmins: false,
        viewAnalytics: false,
        manageContent: false
      });
      loadAdmins();
    } catch (e: any) {
      flash(e.response?.data?.error || 'Failed to create admin', true);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await adminAPI.removeAdmin(id);
      flash('Admin removed');
      loadAdmins();
    } catch {
      flash('Failed to remove admin', true);
    }
  };

  useEffect(() => { if (authed && isSuperAdmin) loadAdmins(); }, [authed, isSuperAdmin, loadAdmins]);
  useEffect(() => { if (authed) { loadStats(); loadUsers(); } }, [authed, loadStats, loadUsers]);
  useEffect(() => { if (authed && tab === 2) loadCourses(); }, [authed, tab, loadCourses]);

  // ── User actions ──────────────────────────────────────────────────────────

  const handleBlock = async (u: AdminUser) => {
    try { await adminAPI.blockUser(u._id, u.isActive); flash(u.isActive ? `${u.name} blocked` : `${u.name} unblocked`); loadUsers(); }
    catch { flash('Failed to update status', true); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user and all their data?')) return;
    try { await adminAPI.deleteUser(id); flash('User deleted'); loadUsers(); }
    catch { flash('Failed to delete user', true); }
  };

  const openEdit = (u: AdminUser) => { setEditUser(u); setEditName(u.name); setEditEmail(u.email); setEditRole(u.role); };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try { await adminAPI.updateUser(editUser._id, { name: editName, email: editEmail, role: editRole }); flash('User updated'); setEditUser(null); loadUsers(); }
    catch (e: any) { flash(e.response?.data?.error || 'Failed to update', true); }
    finally { setEditSaving(false); }
  };

  const openView = async (u: AdminUser) => {
    setViewUser(u); setViewDetail(null); setViewLoading(true);
    try { const res = await adminAPI.getUser(u._id); setViewDetail(res.data); }
    catch { /* silent */ } finally { setViewLoading(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course?')) return;
    try { await adminAPI.deleteCourse(id); flash('Course deleted'); loadCourses(); }
    catch { flash('Failed to delete', true); }
  };

  // ── Login page ─────────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <Box sx={{ bgcolor: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ ...cardSx, width: 380, p: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AdminPanelSettings sx={{ color: ACCENT, fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#fff">Admin Panel</Typography>
                  <Typography variant="caption" color="#555">NeuronixLearn</Typography>
                </Box>
              </Box>
              {loginErr && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(229,115,115,0.08)', color: '#e57373', border: '1px solid rgba(229,115,115,0.2)', borderRadius: 2 }}>{loginErr}</Alert>}
              <TextField fullWidth label="Username" value={username} onChange={e => setUsername(e.target.value)} sx={{ ...fieldSx, mb: 2 }} />
              <TextField fullWidth label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                sx={{ ...fieldSx, mb: 3 }} />
              <Button fullWidth variant="contained" onClick={handleLogin} disabled={loggingIn}
                startIcon={loggingIn ? <CircularProgress size={15} color="inherit" /> : undefined}
                sx={{ bgcolor: ACCENT, color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#1B5E20' } }}>
                {loggingIn ? 'Signing in…' : 'Sign in'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  // ── Admin panel ────────────────────────────────────────────────────────────

  const bigStats = [
    { icon: People,       label: 'Total users',      value: stats?.totalUsers       ?? 0, color: ACCENT,    delay: 0    },
    { icon: TrendingUp,   label: 'Active this week',  value: stats?.activeUsersWeek  ?? 0, color: '#81c784', delay: 0.06 },
    { icon: PersonAdd,    label: 'New this week',     value: stats?.newUsersWeek     ?? 0, color: '#ffb74d', delay: 0.12 },
    { icon: DoNotDisturb, label: 'Blocked users',     value: stats?.blockedUsers     ?? 0, color: '#e57373', delay: 0.18 },
    { icon: School,       label: 'Students',          value: stats?.totalStudents    ?? 0, color: '#4db6ac', delay: 0.24 },
    { icon: Security,     label: 'Admins',            value: stats?.totalAdmins      ?? 0, color: '#f48fb1', delay: 0.27 },
    { icon: MenuBook,     label: 'Courses',           value: stats?.totalCourses     ?? 0, color: '#ce93d8', delay: 0.30 },
    { icon: Quiz,         label: 'Exams',             value: stats?.totalExams       ?? 0, color: '#80cbc4', delay: 0.36 },
    { icon: BarChart,     label: 'Subjects in study', value: stats?.totalSubjects    ?? 0, color: '#a5d6a7', delay: 0.42 },
  ];

  const chartColors = [ACCENT, '#81c784', '#ffb74d', '#e57373', '#ce93d8', '#80cbc4', '#a5d6a7', '#4db6ac', '#f48fb1', '#ffe082'];

  return (
    <Box sx={{ bgcolor: BG, minHeight: '100vh', color: '#fff' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettings sx={{ color: ACCENT, fontSize: 26 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">Admin Panel</Typography>
              <Typography variant="caption" color="#444">Full platform control</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => { loadStats(); loadUsers(); }} sx={{ color: '#555', border: `1px solid ${BORDER}`, borderRadius: 1.5 }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" startIcon={<Logout sx={{ fontSize: 14 }} />} onClick={handleLogout}
              sx={{ color: '#555', borderColor: BORDER, fontSize: '0.8rem', '&:hover': { color: '#e57373', borderColor: '#e57373' } }}>
              Sign out
            </Button>
          </Box>
        </Box>

        {/* Flash */}
        <AnimatePresence>
          {msg && <motion.div key="m" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(129,199,132,0.08)', color: '#81c784', border: '1px solid rgba(129,199,132,0.2)', borderRadius: 2 }}>{msg}</Alert>
          </motion.div>}
          {err && <motion.div key="e" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(229,115,115,0.08)', color: '#e57373', border: '1px solid rgba(229,115,115,0.2)', borderRadius: 2 }}>{err}</Alert>
          </motion.div>}
        </AnimatePresence>

        {/* Stats grid */}
        {statsLoading ? (
          <LinearProgress sx={{ mb: 3, bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
        ) : (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {bigStats.map(s => (
              <Grid item xs={6} sm={4} md={3} lg={1.5} key={s.label}>
                <StatCard {...s} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tabs */}
        <Card sx={cardSx}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
            px: 2, borderBottom: `1px solid ${BORDER}`,
            '& .MuiTab-root': { color: '#555', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', minHeight: 48 },
            '& .Mui-selected': { color: ACCENT },
            '& .MuiTabs-indicator': { bgcolor: ACCENT, height: 2 },
          }}>
            <Tab label="Users" />
            <Tab label="Analytics" />
            <Tab label="Courses" />
            {isSuperAdmin && <Tab label="Admins" icon={<Security sx={{ fontSize: 14 }} />} iconPosition="end" />}
          </Tabs>

          {/* ── USERS TAB ── */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField placeholder="Search name or email…" value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 15, color: '#555' }} /></InputAdornment> }}
                  sx={{ ...fieldSx, width: 260 }} />
                <FormControl size="small" sx={{ ...fieldSx, minWidth: 130 }}>
                  <InputLabel>Role</InputLabel>
                  <Select value={userRole} label="Role" onChange={e => { setUserRole(e.target.value); setUserPage(1); }}
                    MenuProps={{ PaperProps: { sx: menuSx } }}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="#444" sx={{ ml: 'auto' }}>{usersTotal} users total</Typography>
              </Box>

              {usersLoading
                ? <LinearProgress sx={{ bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
                : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                            <TableCell key={h} sx={headSx}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u._id} sx={{ '&:hover': { bgcolor: '#141414' } }}>
                            <TableCell sx={cellSx}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={u.avatar} sx={{ width: 28, height: 28, bgcolor: '#1e1e1e', fontSize: 12, color: ACCENT }}>
                                  {!u.avatar && u.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography sx={{ fontSize: '0.82rem', color: '#e8e8e8', fontWeight: 500 }}>{u.name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, color: '#666' }}>{u.email}</TableCell>
                            <TableCell sx={cellSx}>
                              <Select size="small" value={u.role}
                                onChange={e => adminAPI.updateUserRole(u._id, e.target.value).then(() => { flash('Role updated'); loadUsers(); }).catch(() => flash('Failed', true))}
                                sx={{ color: roleColor[u.role] || '#fff', fontSize: '0.75rem', fontWeight: 600, minWidth: 88,
                                  '& .MuiOutlinedInput-notchedOutline': { borderColor: `${roleColor[u.role] || BORDER}44` },
                                  '& .MuiSelect-icon': { color: roleColor[u.role] || '#555', fontSize: 15 } }}
                                MenuProps={{ PaperProps: { sx: menuSx } }}>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                              </Select>
                            </TableCell>
                            <TableCell sx={cellSx}>
                              <Chip label={u.isActive ? 'Active' : 'Blocked'} size="small"
                                sx={{ bgcolor: u.isActive ? 'rgba(129,199,132,0.1)' : 'rgba(229,115,115,0.1)', color: u.isActive ? '#81c784' : '#e57373',
                                  border: `1px solid ${u.isActive ? 'rgba(129,199,132,0.25)' : 'rgba(229,115,115,0.25)'}`, fontSize: '0.68rem', height: 19 }} />
                            </TableCell>
                            <TableCell sx={{ ...cellSx, color: '#444' }}>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell sx={cellSx}>
                              <Box sx={{ display: 'flex', gap: 0.25 }}>
                                <Tooltip title="View details"><IconButton size="small" onClick={() => openView(u)} sx={{ color: '#444', '&:hover': { color: ACCENT } }}><BarChart sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(u)} sx={{ color: '#444', '&:hover': { color: '#ffb74d' } }}><Edit sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                <Tooltip title={u.isActive ? 'Block' : 'Unblock'}><IconButton size="small" onClick={() => handleBlock(u)} sx={{ color: '#444', '&:hover': { color: u.isActive ? '#e57373' : '#81c784' } }}>{u.isActive ? <Block sx={{ fontSize: 14 }} /> : <CheckCircle sx={{ fontSize: 14 }} />}</IconButton></Tooltip>
                                <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteUser(u._id)} sx={{ color: '#444', '&:hover': { color: '#e57373' } }}><Delete sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2.5 }}>
                <Button size="small" variant="outlined" disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}
                  sx={{ color: '#555', borderColor: BORDER, '&:hover': { borderColor: ACCENT, color: ACCENT } }}>Prev</Button>
                <Typography variant="caption" sx={{ alignSelf: 'center', color: '#444' }}>Page {userPage} / {Math.max(1, Math.ceil(usersTotal / 25))}</Typography>
                <Button size="small" variant="outlined" disabled={userPage >= Math.ceil(usersTotal / 25)} onClick={() => setUserPage(p => p + 1)}
                  sx={{ color: '#555', borderColor: BORDER, '&:hover': { borderColor: ACCENT, color: ACCENT } }}>Next</Button>
              </Box>
            </Box>
          </TabPanel>

          {/* ── ANALYTICS TAB ── */}
          <TabPanel value={tab} index={1}>
            <Box sx={{ px: 2, pb: 2 }}>

              {/* Overview nums */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                  { label: 'Total users',      v: stats?.totalUsers      ?? 0 },
                  { label: 'Active (7d)',       v: stats?.activeUsersWeek ?? 0 },
                  { label: 'Active (30d)',      v: stats?.activeUsersMonth ?? 0 },
                  { label: 'Blocked',           v: stats?.blockedUsers    ?? 0 },
                  { label: 'New this week',     v: stats?.newUsersWeek    ?? 0 },
                  { label: 'Subjects in study', v: stats?.totalSubjects   ?? 0 },
                ].map(item => (
                  <Grid item xs={6} sm={4} md={2} key={item.label}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: ACCENT, letterSpacing: '-0.03em' }}>{item.v}</Typography>
                      <Typography variant="caption" color="#444">{item.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3}>

                {/* User growth chart */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: '#555', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                    User registrations (14 days)
                  </Typography>
                  <Box sx={{ bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: 2, p: 2 }}>
                    {userGrowth.length === 0 ? (
                      <Typography color="#444" textAlign="center" py={3} fontSize="0.85rem">No registration data yet</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <ReBarChart data={userGrowth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                          <XAxis dataKey="_id" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <RTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: 8 }} labelStyle={{ color: '#555' }} itemStyle={{ color: ACCENT }} />
                          <Bar dataKey="count" fill={ACCENT} radius={[3, 3, 0, 0]} />
                        </ReBarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Grid>

                {/* Top subjects */}
                <Grid item xs={12} md={6}>
                  <Typography sx={{ color: '#555', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                    Most studied subjects
                  </Typography>
                  <Box sx={{ bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: 2, p: 2 }}>
                    {topSubjects.length === 0 ? (
                      <Typography color="#444" textAlign="center" py={3} fontSize="0.85rem">No study data yet</Typography>
                    ) : (
                      <ResponsiveContainer width="100%" height={180}>
                        <ReBarChart data={topSubjects.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                          <XAxis type="number" tick={{ fill: '#444', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="subject" type="category" tick={{ fill: '#bbb', fontSize: 10 }} width={70} axisLine={false} tickLine={false} />
                          <RTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #1e1e1e', borderRadius: 8 }} labelStyle={{ color: '#555' }} itemStyle={{ color: '#81c784' }} />
                          <Bar dataKey="learnerCount" radius={[0, 3, 3, 0]}>
                            {topSubjects.slice(0, 8).map((_, i) => (
                              <Cell key={i} fill={chartColors[i % chartColors.length]} />
                            ))}
                          </Bar>
                        </ReBarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Grid>

                {/* Top completed topics */}
                <Grid item xs={12}>
                  <Typography sx={{ color: '#555', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5 }}>
                    Most completed topics across all users
                  </Typography>
                  <Box sx={{ bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, borderRadius: 2, overflow: 'hidden' }}>
                    {topTopics.length === 0 ? (
                      <Typography color="#444" textAlign="center" py={3} fontSize="0.85rem">No completion data yet</Typography>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {['Rank', 'Subject', 'Topic', 'Completions'].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topTopics.slice(0, 10).map((t, i) => (
                              <TableRow key={i} sx={{ '&:hover': { bgcolor: '#111' } }}>
                                <TableCell sx={{ ...cellSx, color: '#555' }}>#{i + 1}</TableCell>
                                <TableCell sx={cellSx}>
                                  <Chip label={t.subject} size="small" sx={{ bgcolor: `${chartColors[i % chartColors.length]}18`, color: chartColors[i % chartColors.length], fontSize: '0.68rem', height: 18, border: 'none', textTransform: 'capitalize' }} />
                                </TableCell>
                                <TableCell sx={cellSx}>{t.topic}</TableCell>
                                <TableCell sx={{ ...cellSx, color: '#81c784', fontWeight: 700 }}>{t.completions}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* ── COURSES TAB ── */}
          <TabPanel value={tab} index={2}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                <TextField placeholder="Search courses…" value={courseSearch} onChange={e => setCourseSearch(e.target.value)} size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 15, color: '#555' }} /></InputAdornment> }}
                  sx={{ ...fieldSx, width: 280 }} />
              </Box>
              {coursesLoading
                ? <LinearProgress sx={{ bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
                : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow>{['Title', 'Category', 'Teacher', 'Enrolled', 'Featured', 'Actions'].map(h => <TableCell key={h} sx={headSx}>{h}</TableCell>)}</TableRow></TableHead>
                      <TableBody>
                        {courses.map(c => (
                          <TableRow key={c._id} sx={{ '&:hover': { bgcolor: '#141414' } }}>
                            <TableCell sx={cellSx}>{c.title}</TableCell>
                            <TableCell sx={{ ...cellSx, color: '#666' }}>{c.category}</TableCell>
                            <TableCell sx={{ ...cellSx, color: '#666' }}>{c.teacherId?.name}</TableCell>
                            <TableCell sx={cellSx}>{c.enrollments}</TableCell>
                            <TableCell sx={cellSx}>
                              <Chip label={c.featured ? 'Featured' : 'Normal'} size="small"
                                sx={{ bgcolor: c.featured ? 'rgba(255,183,77,0.1)' : 'rgba(80,80,80,0.1)', color: c.featured ? '#ffb74d' : '#555', fontSize: '0.68rem', height: 18 }} />
                            </TableCell>
                            <TableCell sx={cellSx}>
                              <Box sx={{ display: 'flex', gap: 0.25 }}>
                                <Tooltip title={c.featured ? 'Remove featured' : 'Feature this'}>
                                  <IconButton size="small" onClick={() => adminAPI.updateCourseFeatured(c._id, !c.featured).then(() => { flash('Updated'); loadCourses(); }).catch(() => flash('Failed', true))}
                                    sx={{ color: c.featured ? '#ffb74d' : '#444', '&:hover': { color: '#ffb74d' } }}>
                                    <Assignment sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton size="small" onClick={() => handleDeleteCourse(c._id)} sx={{ color: '#444', '&:hover': { color: '#e57373' } }}>
                                    <Delete sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
            </Box>
          </TabPanel>

          {/* ── ADMINS TAB (Super Admin Only) ── */}
          <TabPanel value={tab} index={3}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="body2" color="#555">{admins.length} admin(s)</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
                  onClick={() => setAddAdminDialog(true)}
                  sx={{ bgcolor: ACCENT, color: '#000', fontWeight: 700, fontSize: '0.75rem', px: 2, '&:hover': { bgcolor: '#1B5E20' } }}
                >
                  Add Admin
                </Button>
              </Box>

              {adminsLoading
                ? <LinearProgress sx={{ bgcolor: '#1a1a1a', '& .MuiLinearProgress-bar': { bgcolor: ACCENT } }} />
                : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['Username', 'Email', 'Role', 'Permissions', 'Created', 'Actions'].map(h => (
                            <TableCell key={h} sx={headSx}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {admins.map(a => (
                          <TableRow key={a._id} sx={{ '&:hover': { bgcolor: '#141414' } }}>
                            <TableCell sx={cellSx}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#1e1e1e', fontSize: 12, color: ACCENT }}>
                                  {a.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography sx={{ fontSize: '0.82rem', color: '#e8e8e8', fontWeight: 500 }}>{a.username}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, color: '#666' }}>{a.email}</TableCell>
                            <TableCell sx={cellSx}>
                              <Chip 
                                label={a.isSuperAdmin ? 'Super Admin' : 'Admin'} 
                                size="small"
                                sx={{ 
                                  bgcolor: a.isSuperAdmin ? 'rgba(229,115,115,0.1)' : 'rgba(46,125,50,0.1)', 
                                  color: a.isSuperAdmin ? '#e57373' : ACCENT,
                                  border: `1px solid ${a.isSuperAdmin ? 'rgba(229,115,115,0.25)' : 'rgba(46,125,50,0.25)'}`, 
                                  fontSize: '0.68rem', height: 19 
                                }} 
                              />
                            </TableCell>
                            <TableCell sx={cellSx}>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                                {a.isSuperAdmin ? (
                                  <Chip label="Full Access" size="small" sx={{ bgcolor: 'rgba(229,115,115,0.1)', color: '#e57373', fontSize: '0.6rem', height: 16 }} />
                                ) : (
                                  <>
                                    {a.permissions?.manageUsers && <Chip label="Users" size="small" sx={{ bgcolor: 'rgba(46,125,50,0.1)', color: ACCENT, fontSize: '0.6rem', height: 16 }} />}
                                    {a.permissions?.manageCourses && <Chip label="Courses" size="small" sx={{ bgcolor: 'rgba(206,147,216,0.1)', color: '#ce93d8', fontSize: '0.6rem', height: 16 }} />}
                                    {a.permissions?.manageExams && <Chip label="Exams" size="small" sx={{ bgcolor: 'rgba(128,203,196,0.1)', color: '#80cbc4', fontSize: '0.6rem', height: 16 }} />}
                                    {a.permissions?.manageAdmins && <Chip label="Admins" size="small" sx={{ bgcolor: 'rgba(255,183,77,0.1)', color: '#ffb74d', fontSize: '0.6rem', height: 16 }} />}
                                    {a.permissions?.viewAnalytics && <Chip label="Analytics" size="small" sx={{ bgcolor: 'rgba(165,214,167,0.1)', color: '#a5d6a7', fontSize: '0.6rem', height: 16 }} />}
                                    {a.permissions?.manageContent && <Chip label="Content" size="small" sx={{ bgcolor: 'rgba(244,143,177,0.1)', color: '#f48fb1', fontSize: '0.6rem', height: 16 }} />}
                                  </>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...cellSx, color: '#444' }}>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell sx={cellSx}>
                              <Tooltip title="Remove admin">
                                <IconButton size="small" onClick={() => handleDeleteAdmin(a._id)} sx={{ color: '#444', '&:hover': { color: '#e57373' } }}>
                                  <Delete sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
            </Box>
          </TabPanel>
        </Card>
      </Container>

      {/* ── Edit user dialog ── */}
      <Dialog open={Boolean(editUser)} onClose={() => setEditUser(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#111', color: '#fff', border: `1px solid ${BORDER}`, borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700}>Edit User</Typography>
          <IconButton onClick={() => setEditUser(null)} sx={{ color: '#555' }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Name"  value={editName}  onChange={e => setEditName(e.target.value)}  sx={fieldSx} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email" value={editEmail} onChange={e => setEditEmail(e.target.value)} sx={fieldSx} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel>Role</InputLabel>
                <Select value={editRole} label="Role" onChange={e => setEditRole(e.target.value)} MenuProps={{ PaperProps: { sx: menuSx } }}>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditUser(null)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={editSaving}
            startIcon={editSaving ? <CircularProgress size={14} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
            sx={{ bgcolor: ACCENT, color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#1B5E20' } }}>
            {editSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View user dialog ── */}
      <Dialog open={Boolean(viewUser)} onClose={() => setViewUser(null)} maxWidth="lg" fullWidth
        PaperProps={{ sx: { bgcolor: '#111', color: '#fff', border: `1px solid ${BORDER}`, borderRadius: 3, maxHeight: '90vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: `1px solid ${BORDER}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={viewDetail?.user?.avatar} sx={{ width: 48, height: 48, bgcolor: '#1a1a1a', color: ACCENT, fontSize: 20 }}>
              {!viewDetail?.user?.avatar && viewDetail?.user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{viewDetail?.user?.name}</Typography>
              <Typography variant="caption" color="#666">{viewDetail?.user?.email}</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setViewUser(null)} sx={{ color: '#555' }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {viewLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: ACCENT }} /></Box>
          ) : viewDetail ? (
            <Box>
              {/* Main Stats Row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: ACCENT }}>{viewDetail.stats?.totalProgress || 0}</Typography>
                    <Typography variant="caption" color="#555">Courses</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#81c784' }}>{viewDetail.stats?.completedCourses || 0}</Typography>
                    <Typography variant="caption" color="#555">Completed</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffb74d' }}>{Math.round(viewDetail.stats?.averageScore || 0)}%</Typography>
                    <Typography variant="caption" color="#555">Avg Score</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#ce93d8' }}>{Math.round((viewDetail.stats?.totalTimeSpent || 0) / 60)}m</Typography>
                    <Typography variant="caption" color="#555">Time Spent</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#4db6ac' }}>{viewDetail.stats?.completedTodos || 0}/{viewDetail.stats?.totalTodos || 0}</Typography>
                    <Typography variant="caption" color="#555">Todos</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4} md={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0d0d0d', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#f48fb1' }}>{viewDetail.stats?.totalExams || 0}</Typography>
                    <Typography variant="caption" color="#555">Exams</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  {/* Enrolled Courses */}
                  <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Enrolled Courses ({viewDetail.enrolledCourses?.length || 0})</Typography>
                  {viewDetail.enrolledCourses?.length > 0 ? (
                    <Box sx={{ mb: 3, maxHeight: 220, overflow: 'auto' }}>
                      {viewDetail.enrolledCourses.map((c: any) => (
                        <Box key={c._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, mb: 1, borderRadius: 1, bgcolor: '#0a0a0a', border: `1px solid ${BORDER}` }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MenuBook sx={{ fontSize: 16, color: ACCENT }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.courseId?.title || 'Unknown Course'}</Typography>
                            <Typography variant="caption" color="#555">{c.courseId?.category}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: c.completed ? '#81c784' : ACCENT }}>
                            {c.completed ? '✓ Completed' : `${Math.round(c.score || 0)}%`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#444" sx={{ mb: 3, p: 2, bgcolor: '#0a0a0a', borderRadius: 1 }}>No courses enrolled</Typography>
                  )}

                  {/* Weak Topics */}
                  <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Weak Topics ({viewDetail.weakTopics?.length || 0})</Typography>
                  {viewDetail.weakTopics?.length > 0 ? (
                    <Box sx={{ mb: 3, maxHeight: 150, overflow: 'auto' }}>
                      {viewDetail.weakTopics.map((w: any, i: number) => (
                        <Chip key={i} label={w.topicName || w.subject} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: w.completed ? 'rgba(129,199,132,0.12)' : 'rgba(229,115,115,0.12)', color: w.completed ? '#81c784' : '#e57373', fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#444" sx={{ mb: 3, p: 2, bgcolor: '#0a0a0a', borderRadius: 1 }}>No weak topics</Typography>
                  )}

                  {/* Recent Activity */}
                  <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Recent Activity</Typography>
                  {viewDetail.recentActivity?.length > 0 ? (
                    <Box sx={{ maxHeight: 180, overflow: 'auto' }}>
                      {viewDetail.recentActivity.map((a: any, i: number) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, borderBottom: `1px solid ${BORDER}` }}>
                          {a.completed ? <CheckCircle sx={{ fontSize: 14, color: '#81c784' }} /> : <Assignment sx={{ fontSize: 14, color: '#555' }} />}
                          <Typography sx={{ fontSize: '0.8rem', flex: 1 }}>{a.courseId?.title || 'Course'}</Typography>
                          <Typography variant="caption" color="#555">{new Date(a.updatedAt).toLocaleDateString()}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="#444" sx={{ p: 2, bgcolor: '#0a0a0a', borderRadius: 1 }}>No recent activity</Typography>
                  )}
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6}>
                  {/* Profile Info */}
                  <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Profile Info</Typography>
                  <Box sx={{ mb: 3, p: 2, bgcolor: '#0a0a0a', borderRadius: 1, border: `1px solid ${BORDER}` }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Status</Typography>
                        <Box><Chip label={viewDetail.user?.isActive ? 'Active' : 'Blocked'} size="small" sx={{ bgcolor: viewDetail.user?.isActive ? 'rgba(129,199,132,0.1)' : 'rgba(229,115,115,0.1)', color: viewDetail.user?.isActive ? '#81c784' : '#e57373' }} /></Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Role</Typography>
                        <Box><Chip label={viewDetail.user?.role} size="small" sx={{ bgcolor: `${roleColor[viewDetail.user?.role] || ACCENT}18`, color: roleColor[viewDetail.user?.role] || ACCENT }} /></Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Joined</Typography>
                        <Typography variant="body2">{new Date(viewDetail.user?.createdAt).toLocaleDateString()}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Onboarding</Typography>
                        <Typography variant="body2">{viewDetail.user?.onboardingCompleted ? '✓ Completed' : 'Pending'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Phone</Typography>
                        <Typography variant="body2">{viewDetail.user?.phone || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Phone Verified</Typography>
                        <Typography variant="body2">{viewDetail.user?.phoneVerified ? '✓ Verified' : 'Not verified'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Subject Interests */}
                  {viewDetail.user?.profile?.subjectInterests?.length > 0 && (
                    <>
                      <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Subject Interests</Typography>
                      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {viewDetail.user.profile.subjectInterests.map((s: string) => (
                          <Chip key={s} label={s} size="small" sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Weak Areas */}
                  {viewDetail.user?.profile?.weakAreas?.length > 0 && (
                    <>
                      <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Weak Areas</Typography>
                      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {viewDetail.user.profile.weakAreas.map((s: string) => (
                          <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(229,115,115,0.12)', color: '#e57373', fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Learning Stats */}
                  <Typography sx={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, mb: 1, textTransform: 'uppercase' }}>Learning Preferences</Typography>
                  <Box sx={{ p: 2, bgcolor: '#0a0a0a', borderRadius: 1, border: `1px solid ${BORDER}` }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Learning Style</Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{viewDetail.user?.profile?.preferredLearningStyle || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Pace</Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{viewDetail.user?.profile?.pacePreference || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Performance</Typography>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{viewDetail.user?.profile?.currentPerformanceLevel?.replace('_', ' ') || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#555">Language</Typography>
                        <Typography variant="body2">{viewDetail.user?.profile?.languagePreference || 'en'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : <Typography color="#555" textAlign="center" py={8}>No data available</Typography>}
        </DialogContent>
      </Dialog>

      {/* ── Add Admin dialog ── */}
      <Dialog open={addAdminDialog} onClose={() => setAddAdminDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#111', color: '#fff', border: `1px solid ${BORDER}`, borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700}>Add New Admin</Typography>
          <IconButton onClick={() => setAddAdminDialog(false)} sx={{ color: '#555' }}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Username" value={newAdminUsername} onChange={e => setNewAdminUsername(e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Password" type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={newAdminIsSuperAdmin} onChange={e => setNewAdminIsSuperAdmin(e.target.checked)} sx={{ color: '#555', '&.Mui-checked': { color: ACCENT } }} />}
                label={<Typography sx={{ color: '#bbb', fontSize: '0.85rem' }}>Make Super Admin (has full access)</Typography>}
              />
            </Grid>
            {!newAdminIsSuperAdmin && (
              <Grid item xs={12}>
                <Typography sx={{ color: '#555', fontSize: '0.75rem', mb: 1, fontWeight: 700 }}>PERMISSIONS</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <FormControlLabel
                    control={<Checkbox checked={newAdminPermissions.manageUsers} onChange={e => setNewAdminPermissions(p => ({ ...p, manageUsers: e.target.checked }))} sx={{ color: '#555', '&.Mui-checked': { color: ACCENT } }} />}
                    label={<Typography sx={{ color: '#bbb', fontSize: '0.8rem' }}>Manage Users</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={newAdminPermissions.manageCourses} onChange={e => setNewAdminPermissions(p => ({ ...p, manageCourses: e.target.checked }))} sx={{ color: '#555', '&.Mui-checked': { color: '#ce93d8' } }} />}
                    label={<Typography sx={{ color: '#bbb', fontSize: '0.8rem' }}>Manage Courses</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={newAdminPermissions.manageExams} onChange={e => setNewAdminPermissions(p => ({ ...p, manageExams: e.target.checked }))} sx={{ color: '#555', '&.Mui-checked': { color: '#80cbc4' } }} />}
                    label={<Typography sx={{ color: '#bbb', fontSize: '0.8rem' }}>Manage Exams</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={newAdminPermissions.manageAdmins} onChange={e => setNewAdminPermissions(p => ({ ...p, manageAdmins: e.target.checked }))} sx={{ color: '#555', '&.Mui-checked': { color: '#ffb74d' } }} />}
                    label={<Typography sx={{ color: '#bbb', fontSize: '0.8rem' }}>Manage Admins</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={newAdminPermissions.viewAnalytics} onChange={e => setNewAdminPermissions(p => ({ ...p, viewAnalytics: e.target.checked }))} sx={{ color: '#555', '&.Mui-checked': { color: '#a5d6a7' } }} />}
                    label={<Typography sx={{ color: '#bbb', fontSize: '0.8rem' }}>View Analytics</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={newAdminPermissions.manageContent} onChange={e => setNewAdminPermissions(p => ({ ...p, manageContent: e.target.checked }))} sx={{ color: '#555', '&.Mui-checked': { color: '#f48fb1' } }} />}
                    label={<Typography sx={{ color: '#bbb', fontSize: '0.8rem' }}>Manage Content</Typography>}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setAddAdminDialog(false)} sx={{ color: '#555' }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAdmin} disabled={addingAdmin}
            startIcon={addingAdmin ? <CircularProgress size={14} color="inherit" /> : <Save sx={{ fontSize: 14 }} />}
            sx={{ bgcolor: ACCENT, color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#1B5E20' } }}>
            {addingAdmin ? 'Creating…' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
