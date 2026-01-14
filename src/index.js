import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress passive event listener violation warnings from page-flip library
// This is a third-party library issue and doesn't affect functionality
// Violations are shown in console but don't break the app
if (typeof console !== 'undefined') {
  // Suppress console.warn for passive listener warnings
  if (console.warn) {
    const originalWarn = console.warn;
    console.warn = function(...args) {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('non-passive event listener') ||
         message.includes('touchstart') ||
         message.includes('[Violation]'))
      ) {
        // Suppress warnings from page-flip library about passive listeners
        return;
      }
      originalWarn.apply(console, args);
    };
  }
  
  // Suppress console.error for passive listener violations
  if (console.error) {
    const originalError = console.error;
    console.error = function(...args) {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('non-passive event listener') ||
         message.includes('touchstart') ||
         message.includes('[Violation]'))
      ) {
        // Suppress errors from page-flip library about passive listeners
        return;
      }
      originalError.apply(console, args);
    };
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
