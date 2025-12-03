import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Material UI'ın gerekli parçalarını import ediyoruz
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 2. Senin oluşturduğun tema dosyasını import ediyoruz
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Uygulamayı ThemeProvider ile sarmalıyoruz */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline: CSS sıfırlama yapar ve arka plan rengini ayarlar */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);