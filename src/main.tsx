
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary for the entire app
const renderApp = () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }
    
    const root = createRoot(rootElement);
    
    // Render the app
    root.render(<App />);
    
    console.log('App mounted successfully');
  } catch (error) {
    console.error('Failed to render the application:', error);
    
    // Show a user-friendly error message in the DOM
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <h1 style="color: #e11d48; margin-bottom: 16px;">Application Error</h1>
          <p style="max-width: 500px; margin-bottom: 24px;">
            We encountered an issue while loading the application. Please try the following:
          </p>
          <ul style="text-align: left; margin-bottom: 24px;">
            <li style="margin-bottom: 8px;">Refresh the page</li>
            <li style="margin-bottom: 8px;">Clear your browser cache</li>
            <li style="margin-bottom: 8px;">Try a different browser</li>
          </ul>
          <button 
            onclick="localStorage.clear(); window.location.reload();"
            style="
              background-color: #e11d48;
              color: white;
              border: none;
              padding: 10px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
            "
          >
            Reset Application Data
          </button>
        </div>
      `;
    }
  }
};

renderApp();
