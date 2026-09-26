import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

declare global {
  interface Window {
    __markEditMeeLoaded?: () => void;
  }
}

function startApplication() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Fatal: #root container element missing.');
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary isRoot fallbackTitle="Application Initialization">
          <App />
        </ErrorBoundary>
      </StrictMode>
    );

    // Notify startup recovery guard of successful initialization
    if (typeof window !== 'undefined' && typeof window.__markEditMeeLoaded === 'function') {
      window.__markEditMeeLoaded();
    }
  } catch (err: any) {
    console.error('Fatal: Failed to bootstrap React application:', err);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: system-ui, sans-serif; text-align: center;">
        <div style="max-width: 440px; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 8px; color: #fff;">EditMee Startup Protection</h2>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 20px;">
            A temporary browser initialization delay occurred. Click below to load your tools.
          </p>
          <button onclick="window.location.reload()" style="background: #dc2626; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;">
            Reload EditMee
          </button>
        </div>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}

