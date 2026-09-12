import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

const GREEN_ACCENT = '#2E7D32';
const GREEN_LIGHT = '#4CAF50';
const GREEN_DARK = '#1B5E20';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: GREEN_ACCENT,
      light: GREEN_LIGHT,
      dark: GREEN_DARK,
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: mode === 'dark' ? '#424242' : '#757575',
      light: mode === 'dark' ? '#616161' : '#9E9E9E',
      dark: mode === 'dark' ? '#212121' : '#616161'
    },
    error: { main: '#D32F2F' },
    warning: { main: '#F57C00' },
    info: { main: '#2E7D32' },
    success: { main: GREEN_ACCENT },
    ...(mode === 'dark'
      ? {
          background: { default: '#000000', paper: '#0A0A0A' },
          text: { primary: '#FFFFFF', secondary: '#B0B0B0' },
          divider: 'rgba(255, 255, 255, 0.12)'
        }
      : {
          background: { default: '#FFFFFF', paper: '#FAFAFA' },
          text: { primary: '#000000', secondary: '#5C6370' },
          divider: 'rgba(0, 0, 0, 0.12)'
        })
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    htmlFontSize: 16,
    h1: { fontWeight: 700, fontSize: '2.75rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: '1.875rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.125rem' },
    subtitle1: { fontWeight: 500, fontSize: '1.1rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.95rem' },
    body1: { fontSize: '1.05rem', lineHeight: 1.7 },
    body2: { fontSize: '0.95rem', lineHeight: 1.6 },
    button: { textTransform: 'none' as const, fontWeight: 600, fontSize: '1rem' },
    caption: { fontSize: '0.85rem' },
    overline: { fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em' }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          fontSize: '16px',
        },
        body: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: '1rem',
          scrollbarWidth: 'thin',
          scrollbarColor: `${mode === 'dark' ? '#333' : '#ccc'} ${mode === 'dark' ? '#000' : '#f0f0f0'}`,
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: mode === 'dark' ? '#0A0A0A' : '#f0f0f0' },
          '&::-webkit-scrollbar-thumb': { background: mode === 'dark' ? '#333' : '#ccc', borderRadius: '4px' },
          '@media (max-width: 768px)': {
            overflowX: 'hidden',
          }
        },
        '*': {
          '@media (max-width: 768px)': {
            overflowX: 'hidden !important'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          boxShadow: 'none',
          '&:hover': { 
            boxShadow: 'none',
            transform: 'translateY(-1px)'
          },
          '&:active': { transform: 'translateY(0)' }
        }),
        contained: ({ theme }) => ({
          backgroundColor: GREEN_ACCENT,
          color: '#fff',
          '&:hover': { 
            backgroundColor: GREEN_DARK,
            boxShadow: 'none'
          }
        }),
        outlined: ({ theme }) => ({
          borderColor: mode === 'dark' ? '#333' : '#ccc',
          color: mode === 'dark' ? '#fff' : '#000',
          '&:hover': {
            borderColor: GREEN_ACCENT,
            backgroundColor: alpha(GREEN_ACCENT, 0.05),
            boxShadow: 'none'
          }
        }),
        text: ({ theme }) => ({
          color: mode === 'dark' ? '#fff' : '#000',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.05)
          }
        })
      }
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0 2px 8px rgba(0, 0, 0, 0.5)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'none',
          background: mode === 'dark' ? '#0A0A0A' : '#FFFFFF',
          border: mode === 'dark' ? '1px solid #1a1a1a' : '1px solid #e0e0e0',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 4px 16px rgba(0, 0, 0, 0.6)'
              : '0 4px 16px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)'
          }
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          background: mode === 'dark' ? '#0A0A0A' : '#FFFFFF'
        })
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          background: mode === 'dark' ? '#000000' : '#FFFFFF',
          boxShadow: 'none',
          borderBottom: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`
        })
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '1rem',
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: mode === 'dark' ? '#333' : '#ccc',
              transition: 'all 0.2s ease'
            },
            '&:hover fieldset': { borderColor: GREEN_ACCENT },
            '&.Mui-focused fieldset': { 
              borderColor: GREEN_ACCENT, 
              borderWidth: 2,
              boxShadow: 'none'
            }
          },
          '& .MuiInputLabel-root.Mui-focused': { 
            color: GREEN_ACCENT,
            fontWeight: 600,
            fontSize: '1rem'
          }
        })
      }
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          fontWeight: 600,
          fontSize: '0.85rem',
          border: `1px solid ${mode === 'dark' ? '#333' : '#ddd'}`,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
        }),
        colorPrimary: {
          backgroundColor: alpha(GREEN_ACCENT, 0.15),
          color: GREEN_LIGHT,
          border: `1px solid ${alpha(GREEN_ACCENT, 0.3)}`
        },
        colorSuccess: ({ theme }) => ({
          backgroundColor: alpha(GREEN_ACCENT, 0.15),
          color: GREEN_ACCENT,
          border: `1px solid ${alpha(GREEN_ACCENT, 0.3)}`
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: alpha('#F57C00', 0.15),
          color: '#F57C00',
          border: `1px solid ${alpha('#F57C00', 0.3)}`
        }),
        colorError: ({ theme }) => ({
          backgroundColor: alpha('#D32F2F', 0.15),
          color: '#D32F2F',
          border: `1px solid ${alpha('#D32F2F', 0.3)}`
        })
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 16,
          border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
          background: mode === 'dark' ? '#0A0A0A' : '#FFFFFF',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        })
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          height: 8,
          backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }),
        bar: { 
          borderRadius: 4, 
          backgroundColor: GREEN_ACCENT
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 600,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          color: mode === 'dark' ? '#fff' : '#000',
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
          backgroundColor: mode === 'dark' ? '#0A0A0A' : '#F5F5F5'
        }),
        body: ({ theme }) => ({
          fontSize: '1rem',
          borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'
        })
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
          }
        })
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 10,
          border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          background: mode === 'dark' ? '#0A0A0A' : '#FFFFFF'
        })
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: '1rem',
          borderRadius: 6,
          margin: '2px 6px',
          padding: '10px 16px',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.08)
          },
          '&.Mui-selected': {
            backgroundColor: alpha(GREEN_ACCENT, 0.12),
            '&:hover': {
              backgroundColor: alpha(GREEN_ACCENT, 0.16)
            }
          }
        })
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          borderRadius: 6,
          fontSize: '0.85rem',
          fontWeight: 500,
          backgroundColor: mode === 'dark' ? '#1a1a1a' : '#333',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        })
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 48,
          '& .MuiTab-root': {
            minHeight: 48,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            color: mode === 'dark' ? '#B0B0B0' : '#5C6370',
            '&.Mui-selected': {
              color: GREEN_ACCENT
            }
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            backgroundColor: GREEN_ACCENT
          }
        })
      }
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.2s ease',
          '&:hover': {
            color: GREEN_ACCENT,
            backgroundColor: alpha(GREEN_ACCENT, 0.05)
          }
        })
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.1),
            color: GREEN_ACCENT
          }
        })
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: GREEN_ACCENT,
          color: '#fff',
          fontWeight: 600
        })
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontSize: '1rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'dark' ? '#333' : '#ccc'
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: GREEN_ACCENT
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: GREEN_ACCENT
          }
        })
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: alpha(GREEN_ACCENT, 0.08)
          },
          '&.Mui-selected': {
            backgroundColor: alpha(GREEN_ACCENT, 0.12),
            '&:hover': {
              backgroundColor: alpha(GREEN_ACCENT, 0.16)
            }
          }
        })
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRight: 'none',
          boxShadow: mode === 'dark' ? '2px 0 8px rgba(0, 0, 0, 0.5)' : '2px 0 8px rgba(0, 0, 0, 0.1)',
          background: mode === 'dark' ? '#000000' : '#FFFFFF'
        })
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '1rem'
        },
        secondary: {
          fontSize: '0.9rem'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        body1: {
          fontSize: '1.05rem'
        },
        body2: {
          fontSize: '0.95rem'
        }
      }
    }
  }
});

export const createAppTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
export default createAppTheme('dark');

export const GREEN_ACCENT_COLOR = GREEN_ACCENT;
export const GREEN_LIGHT_COLOR = GREEN_LIGHT;
export const GREEN_DARK_COLOR = GREEN_DARK;
