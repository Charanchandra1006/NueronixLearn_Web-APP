import { useState, useRef } from 'react';
import {
  Box, Button, Typography, LinearProgress,
  MenuItem, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, List, ListItem, ListItemText, Alert, CircularProgress
} from '@mui/material';
import { CloudUpload, PictureAsPdf, Quiz, HourglassEmpty } from '@mui/icons-material';
import { mlAPI } from '../services/api';

interface PDFUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Computer Science', 'History', 'Geography',
  'Economics', 'Business Studies', 'Accounting'
];

export default function PDFUploadDialog({ open, onClose, onSuccess }: PDFUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !subject) {
      setError('Please select a file and subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await mlAPI.uploadPDF(file, subject);
      setResult(res.data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSubject('');
    setResult(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload PDF for Study Plan</DialogTitle>
      <DialogContent>
        {!result ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload a PDF and we'll extract topics to add to your study plan.
            </Typography>

            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                mb: 2,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                style={{ display: 'none' }}
              />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              {file ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <PictureAsPdf color="error" />
                  <Typography>{file.name}</Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Click to select PDF file
                </Typography>
              )}
            </Box>

            <TextField
              select
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 2 }}
            >
              {SUBJECTS.map((sub) => (
                <MenuItem key={sub} value={sub}>{sub}</MenuItem>
              ))}
            </TextField>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
                  <HourglassEmpty sx={{ color: 'primary.main', animation: 'pulse 1.5s infinite' }} />
                  <Typography color="primary.main" sx={{ fontWeight: 500 }}>
                    Uploading PDF... Please wait till I get a response
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Analyzing content and extracting topics...
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              PDF processed successfully!
            </Alert>

            {result.summary && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Summary:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.summary}
                </Typography>
              </Box>
            )}

            {result.topics && result.topics.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Topics Found ({result.topics.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {result.topics.map((topic: string, idx: number) => (
                    <Chip key={idx} label={topic} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {result.addedToStudyPlan !== undefined && (
              <Alert severity="info">
                {result.addedToStudyPlan} topics added to your study plan
                {result.duplicates > 0 && ` (${result.duplicates} duplicates skipped)`}
              </Alert>
            )}

            {result.questions && result.questions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Quiz sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Practice Questions:
                </Typography>
                <List dense>
                  {result.questions.slice(0, 5).map((q: string, idx: number) => (
                    <ListItem key={idx}>
                      <ListItemText primary={`${idx + 1}. ${q}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {result ? (
          <Button onClick={handleClose}>Close</Button>
        ) : (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleUpload} 
              variant="contained" 
              disabled={!file || !subject || loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CloudUpload />}
            >
              {loading ? 'Processing PDF...' : 'Upload & Process'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
