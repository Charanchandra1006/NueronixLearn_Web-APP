import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Typography, TextField, Button, CircularProgress,
  MenuItem, Select, FormControl, InputLabel, Switch, FormControlLabel,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  alpha, useTheme, Divider, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { Add, Delete, ArrowBack, Save, ExpandMore, ArrowForward } from "@mui/icons-material";
import { coursesAPI } from "../services/api";

const ACCENT = '#2E7D32';

interface Module {
  _id?: string;
  title: string;
  content: string;
  type: "video" | "text" | "quiz";
  duration: number;
  videoUrl: string;
  order: number;
}

interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: string;
  price: number;
  isFree: boolean;
  language: string;
  tags: string;
  whatYouWillLearn: string[];
  requirements: string[];
  modules: Module[];
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.1em', fontSize: '0.65rem', display: 'block', mb: 2 }}>
    {children}
  </Typography>
);

const CreateCourse = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | false>(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: "", description: "", shortDescription: "", category: "",
    difficulty: "beginner", price: 0, isFree: true, language: "English",
    tags: "", whatYouWillLearn: [""], requirements: [""], modules: [],
  });

  const handleChange = (field: keyof CourseFormData, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleArrayChange = (field: "whatYouWillLearn" | "requirements", index: number, value: string) =>
    setFormData(prev => { const updated = [...prev[field]]; updated[index] = value; return { ...prev, [field]: updated }; });

  const addArrayItem = (field: "whatYouWillLearn" | "requirements") =>
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));

  const removeArrayItem = (field: "whatYouWillLearn" | "requirements", index: number) =>
    setFormData(prev => { const updated = [...prev[field]]; updated.splice(index, 1); return { ...prev, [field]: updated.length ? updated : [""] }; });

  const openModuleDialog = (module?: Module, index?: number) => {
    if (module && index !== undefined) {
      setEditModule({ ...module, order: index });
    } else {
      setEditModule({ title: "", content: "", type: "video", duration: 10, videoUrl: "", order: formData.modules.length });
    }
    setModuleDialogOpen(true);
  };

  const saveModule = () => {
    if (!editModule?.title) return;
    setFormData(prev => {
      const existingIndex = prev.modules.findIndex(m => m.order === editModule.order);
      if (existingIndex >= 0) {
        const updated = [...prev.modules]; updated[existingIndex] = editModule;
        return { ...prev, modules: updated };
      }
      return { ...prev, modules: [...prev.modules, editModule] };
    });
    setModuleDialogOpen(false);
    setEditModule(null);
  };

  const deleteModule = (order: number) =>
    setFormData(prev => ({ ...prev, modules: prev.modules.filter(m => m.order !== order) }));

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title || !formData.description || !formData.category) {
      alert("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        whatYouWillLearn: formData.whatYouWillLearn.filter(t => t.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        isPublished: publish,
      };
      const res = await coursesAPI.create(data);
      if (publish) navigate("/teacher");
      else navigate(`/teacher/edit-course/${res.data.course._id}`);
    } catch (error: any) {
      alert(error?.response?.data?.error || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = { mb: 0 };

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
              New Course
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, letterSpacing: '-0.015em' }}>
            Create Course
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Basic Info */}
          <Box>
            <SectionLabel>Basic Information</SectionLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Course Title *" value={formData.title}
                onChange={e => handleChange("title", e.target.value)} sx={fieldSx}
                placeholder="e.g., Complete JavaScript Masterclass" />
              <TextField fullWidth multiline rows={4} label="Full Description *"
                value={formData.description} onChange={e => handleChange("description", e.target.value)}
                placeholder="Describe what students will learn..." sx={fieldSx} />
              <TextField fullWidth label="Short Description"
                value={formData.shortDescription} onChange={e => handleChange("shortDescription", e.target.value)}
                placeholder="One-line summary" sx={fieldSx} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select value={formData.category} label="Category *" onChange={e => handleChange("category", e.target.value)}>
                    {['Programming', 'Data Science', 'Design', 'Business', 'Marketing', 'Mathematics', 'Science', 'Language'].map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={formData.difficulty} label="Difficulty" onChange={e => handleChange("difficulty", e.target.value)}>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={<Switch checked={formData.isFree} onChange={e => handleChange("isFree", e.target.checked)} />}
                  label={<Typography sx={{ fontSize: '0.875rem' }}>Free Course</Typography>}
                />
                {!formData.isFree && (
                  <TextField type="number" label="Price (USD)" size="small"
                    value={formData.price} onChange={e => handleChange("price", Number(e.target.value))}
                    sx={{ width: 140 }} />
                )}
              </Box>
              <TextField fullWidth label="Tags (comma separated)" value={formData.tags}
                onChange={e => handleChange("tags", e.target.value)}
                placeholder="javascript, web development, react" />
            </Box>
          </Box>

          <Divider />

          {/* What you'll learn */}
          <Box>
            <SectionLabel>What Students Will Learn</SectionLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {formData.whatYouWillLearn.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: ACCENT, flexShrink: 0, mt: 0.25 }} />
                  <TextField fullWidth size="small" value={item}
                    onChange={e => handleArrayChange("whatYouWillLearn", index, e.target.value)}
                    placeholder="e.g., Build real-world projects" />
                  <IconButton size="small" onClick={() => removeArrayItem("whatYouWillLearn", index)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => addArrayItem("whatYouWillLearn")}
                sx={{ alignSelf: 'flex-start', color: 'text.secondary', fontSize: '0.8rem' }}>
                Add outcome
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Requirements */}
          <Box>
            <SectionLabel>Requirements</SectionLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {formData.requirements.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: alpha(ACCENT, 0.4), flexShrink: 0, mt: 0.25 }} />
                  <TextField fullWidth size="small" value={item}
                    onChange={e => handleArrayChange("requirements", index, e.target.value)}
                    placeholder="e.g., Basic programming knowledge" />
                  <IconButton size="small" onClick={() => removeArrayItem("requirements", index)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<Add />} onClick={() => addArrayItem("requirements")}
                sx={{ alignSelf: 'flex-start', color: 'text.secondary', fontSize: '0.8rem' }}>
                Add requirement
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Modules */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <SectionLabel>Course Content</SectionLabel>
              </Box>
              <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => openModuleDialog()}>
                Add module
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {formData.modules.length} module{formData.modules.length !== 1 ? 's' : ''}
            </Typography>

            {formData.modules.length === 0 ? (
              <Box sx={{
                textAlign: 'center', py: 6,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: '6px'
              }}>
                <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  No modules yet — add your first module to start building the course.
                </Typography>
              </Box>
            ) : (
              formData.modules.sort((a, b) => a.order - b.order).map((module, index) => (
                <Accordion key={module.order}
                  expanded={expandedModule === `m-${module.order}`}
                  onChange={(_, exp) => setExpandedModule(exp ? `m-${module.order}` : false)}
                  sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 18 }} />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
                      <Typography sx={{
                        fontFamily: '"Space Grotesk"', fontWeight: 700,
                        fontSize: '0.7rem', color: 'text.secondary', minWidth: 24
                      }}>
                        {String(index + 1).padStart(2, '0')}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{module.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {module.type} · {module.duration} min
                        </Typography>
                      </Box>
                      <IconButton size="small"
                        onClick={e => { e.stopPropagation(); deleteModule(module.order); }}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <Delete sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {module.content || "No content added."}
                    </Typography>
                    {module.videoUrl && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1.5 }}>
                        📹 {module.videoUrl}
                      </Typography>
                    )}
                    <Button size="small" onClick={() => openModuleDialog(module, module.order)}
                      sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                      Edit module
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>

          {/* Actions */}
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/teacher")} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button variant="outlined" onClick={() => handleSubmit(false)} disabled={loading} sx={{ fontSize: '0.875rem' }}>
              Save draft
            </Button>
            <Button variant="contained" endIcon={loading ? <CircularProgress size={16} /> : <ArrowForward sx={{ fontSize: 16 }} />}
              onClick={() => handleSubmit(true)} disabled={loading}>
              {loading ? "Publishing..." : "Publish course"}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Space Grotesk"', fontWeight: 600, fontSize: '1rem', pb: 1 }}>
          {editModule?._id ? "Edit Module" : "Add Module"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField fullWidth label="Module Title *" value={editModule?.title || ""}
              onChange={e => setEditModule(p => p ? { ...p, title: e.target.value } : null)} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={editModule?.type || "video"} label="Type"
                  onChange={e => setEditModule(p => p ? { ...p, type: e.target.value as any } : null)}>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="text">Text / Article</MenuItem>
                  <MenuItem value="quiz">Quiz</MenuItem>
                </Select>
              </FormControl>
              <TextField type="number" label="Duration (min)" value={editModule?.duration || 10}
                onChange={e => setEditModule(p => p ? { ...p, duration: Number(e.target.value) } : null)}
                sx={{ width: 160 }} />
            </Box>
            {editModule?.type === "video" && (
              <TextField fullWidth label="Video URL" value={editModule?.videoUrl || ""}
                onChange={e => setEditModule(p => p ? { ...p, videoUrl: e.target.value } : null)}
                placeholder="YouTube or Vimeo URL" />
            )}
            <TextField fullWidth multiline rows={4} label="Content"
              value={editModule?.content || ""}
              onChange={e => setEditModule(p => p ? { ...p, content: e.target.value } : null)}
              placeholder={editModule?.type === "text" ? "Write your lesson content here..." : "Brief description or notes..."} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setModuleDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={saveModule} disabled={!editModule?.title}>
            Save module
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateCourse;
