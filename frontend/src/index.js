import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './ThemeProvider'; // ✅ Import ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>           {/* ✅ Wrap App here */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
