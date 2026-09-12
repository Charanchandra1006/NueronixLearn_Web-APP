import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useMemo } from 'react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CustomThemeProvider, useTheme } from './context/ThemeContext';
import { createAppTheme } from './theme';

const ThemedApp = () => {
  const { mode } = useTheme();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CustomThemeProvider>
        <ThemedApp />
      </CustomThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
