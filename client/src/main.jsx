import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Import Bootstrap's JavaScript bundle (must come after CSS import if CSS is also imported here, but CSS is in App.jsx)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import './index.css' // We are using Bootstrap instead

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 