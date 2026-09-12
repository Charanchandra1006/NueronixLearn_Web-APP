import { useState, useRef, useEffect } from 'react';
import {
  Box, IconButton, Fab, Dialog, DialogTitle, DialogContent,
  Typography, TextField, Avatar, CircularProgress,
  Fade, Slide, Chip, Button, Card, CardContent
} from '@mui/material';
import {
  Close, Send, SmartToy, Psychology, AutoAwesome,
  YouTube, AddCircle, PictureAsPdf, AttachFile
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { chatbotAPI, mlAPI } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'cached' | 'hardcoded' | 'ai' | 'pdf';
  pdfName?: string;
}

interface Suggestion {
  suggestion: string;
  reason: string;
  priority: string;
  topic?: string;
  subject?: string;
  videos?: Video[];
}

interface Video {
  videoId?: string;
  title: string;
  channelName?: string;
  duration?: string;
  url?: string;
  thumbnail?: string;
}

const NeuroBot = () => {
  const { mode } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [detectedTopic, setDetectedTopic] = useState<{ topic: string; subject: string } | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      fetchGreeting();
      fetchSuggestion();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGreeting = async () => {
    try {
      const res = await chatbotAPI.getGreeting();
      setMessages([{
        role: 'assistant',
        content: res.data?.content || res.data?.message || '',
        timestamp: new Date(),
        source: 'hardcoded'
      }]);
    } catch {}
  };

  const fetchSuggestion = async () => {
    try {
      const res = await chatbotAPI.getSuggestion();
      setSuggestion(res.data);
    } catch {}
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      const res = await chatbotAPI.chat(userMessage);

      const botReply = res.data?.content || res.data?.message || 'No response from server';
      const source = res.data?.source || 'ai';
      const detectedWeakTopic = res.data?.detectedWeakTopic;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: botReply,
        timestamp: new Date(),
        source
      }]);

      if (detectedWeakTopic) {
        setDetectedTopic(detectedWeakTopic);
        setShowAddTopic(true);
      }

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Server error. Please try again.",
        timestamp: new Date(),
        source: 'cached'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeakTopic = async () => {
    if (!detectedTopic) return;
    
    try {
      await chatbotAPI.addWeakTopic(detectedTopic.topic, detectedTopic.subject);
      setShowAddTopic(false);
      setDetectedTopic(null);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Great! I've added "${detectedTopic.topic}" to your weak areas and created a study plan for you.`,
        timestamp: new Date(),
        source: 'cached'
      }]);
    } catch (err) {
      console.error('Failed to add weak topic:', err);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please upload a PDF file.',
        timestamp: new Date(),
        source: 'cached'
      }]);
      return;
    }

    setPdfFile(file);
    setPdfUploading(true);

    setMessages(prev => [...prev, {
      role: 'user',
      content: `📄 Uploaded: ${file.name}`,
      timestamp: new Date(),
      pdfName: file.name
    }]);

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `I'm analyzing "${file.name}"... This may take a moment.`,
      timestamp: new Date(),
      source: 'cached'
    }]);

    try {
      const res = await mlAPI.uploadPDF(file, 'general');
      console.log('[NeuroBot] PDF upload response:', res.data);
      
      const summary = res.data?.summary || 'Analysis completed';
      const topics = res.data?.topics || [];
      const questions = res.data?.questions || [];
      const keyPoints = res.data?.keyPoints || [];
      const addedToStudyPlan = res.data?.addedToStudyPlan || 0;

      let responseContent = `📄 **PDF Analysis Complete**\n\n`;
      
      if (summary && !summary.includes('not configured')) {
        responseContent += `${summary}\n\n`;
      }
      
      if (keyPoints.length > 0) {
        responseContent += `**Key Points:**\n`;
        keyPoints.forEach((point: string, idx: number) => {
          responseContent += `• ${point}\n`;
        });
        responseContent += '\n';
      }

      if (topics.length > 0) {
        responseContent += `**Topics Covered:**\n`;
        topics.forEach((topic: string, idx: number) => {
          responseContent += `${idx + 1}. ${topic}\n`;
        });
        responseContent += '\n';
      }

      if (questions.length > 0) {
        responseContent += `**Practice Questions:**\n`;
        questions.forEach((q: string, idx: number) => {
          responseContent += `${idx + 1}. ${q}\n`;
        });
      }

      if (addedToStudyPlan > 0) {
        responseContent += `\n✨ ${addedToStudyPlan} topic(s) added to your study plan!`;
      }

      if (topics.length === 0 && questions.length === 0 && keyPoints.length === 0) {
        responseContent += `\n⚠️ Could not fully analyze this PDF. Try a different file or check if it's a scanned document.`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        source: 'pdf'
      }]);

    } catch (err: any) {
      console.error('[NeuroBot] PDF upload error:', err);
      let errorMsg = 'Please try again.';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Sorry, I couldn't process the PDF.\n\nError: ${errorMsg}\n\nPlease make sure:\n• The file is a valid PDF\n• The file is not password protected\n• The file is not too large (>10MB)`,
        timestamp: new Date(),
        source: 'cached'
      }]);
    } finally {
      setPdfUploading(false);
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'cached': return 'info';
      case 'hardcoded': return 'success';
      case 'ai': return 'warning';
      case 'pdf': return 'primary';
      default: return 'default';
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'cached': return 'Cached';
      case 'hardcoded': return 'Quick Reply';
      case 'ai': return 'AI';
      case 'pdf': return 'PDF Analysis';
      default: return '';
    }
  };

  return (
    <>
      <Fab
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: mode === 'dark'
            ? 'linear-gradient(45deg, #6366f1, #818cf8)'
            : 'linear-gradient(45deg, #4f46e5, #6366f1)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
        }}
      >
        <SmartToy sx={{ fontSize: 28 }} />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        PaperProps={{
          sx: {
            height: '80vh',
            maxHeight: 700,
            borderRadius: 3,
            bgcolor: mode === 'dark' ? '#1e293b' : '#ffffff'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology />
            <Typography variant="h6" fontWeight={700}>
              Neuro Bot
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {suggestion && (
            <Fade in>
              <Card sx={{ m: 2, bgcolor: mode === 'dark' ? '#334155' : '#f1f5f9' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AutoAwesome fontSize="small" color="primary" />
                    <Typography variant="subtitle2" fontWeight={600}>
                      Learning Suggestion
                    </Typography>
                    <Chip 
                      label={suggestion.priority} 
                      size="small" 
                      color={suggestion.priority === 'high' ? 'error' : 'default'}
                      sx={{ ml: 'auto', height: 20, fontSize: 11 }}
                    />
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {suggestion.suggestion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.reason}
                  </Typography>
                  
                  {suggestion.videos && suggestion.videos.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {suggestion.videos.slice(0, 3).map((video, idx) => (
                        <Chip
                          key={idx}
                          icon={<YouTube />}
                          label={video.title.substring(0, 25) + '...'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: 11 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          )}

          {showAddTopic && detectedTopic && (
            <Fade in>
              <Box sx={{ p: 2, m: 2, borderRadius: 2, bgcolor: 'warning.light' }}>
                <Typography variant="body2" fontWeight={500}>
                  I noticed you're having trouble with "{detectedTopic.topic}"
                </Typography>
                <Typography variant="caption">
                  Would you like me to add this to your weak areas and create a study plan?
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<AddCircle />}
                    onClick={handleAddWeakTopic}
                  >
                    Yes, add to study plan
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => {
                      setShowAddTopic(false);
                      setDetectedTopic(null);
                    }}
                  >
                    No thanks
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <SmartToy fontSize="small" />
                  </Avatar>
                )}
                <Box sx={{ maxWidth: '80%' }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: msg.role === 'user' ? 'primary.main' : mode === 'dark' ? '#334155' : '#e2e8f0',
                      color: msg.role === 'user' ? '#fff' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  </Box>
                  {msg.source && msg.role === 'assistant' && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      <Chip 
                        label={getSourceLabel(msg.source)} 
                        size="small" 
                        color={getSourceColor(msg.source) as any}
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}

            {loading && <CircularProgress size={20} />}

            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: 1, borderColor: 'divider', alignItems: 'flex-end' }}>
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
            />
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfUploading || loading}
              sx={{ mb: 0.5 }}
              title="Upload PDF"
            >
              {pdfUploading ? <CircularProgress size={20} /> : <PictureAsPdf />}
            </IconButton>
            <TextField
              fullWidth
              placeholder="Ask Neuro Bot or upload a PDF..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              size="small"
              disabled={loading || pdfUploading}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!message.trim() || loading || pdfUploading}
            >
              <Send />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NeuroBot;
