import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import Bootstrap's JavaScript bundle (must come after CSS import if CSS is also imported here, but CSS is in App.jsx)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import theme from './utils/theme';

// Create a style element to inject theme CSS variables
const injectThemeVariables = () => {
  const styleEl = document.createElement('style');
  styleEl.textContent = theme.cssVariables;
  document.head.appendChild(styleEl);
};

// Inject theme variables before rendering
injectThemeVariables();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 