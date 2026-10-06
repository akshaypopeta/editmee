import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

declare global {
  interface Window {
    __markEditMeeLoaded?: () => void;
    __showEditMeeFallback?: (details?: any) => void;
    __clearEditMeeCacheAndReload?: () => void;
    __editMeeStage?: string;
  }
}

function startApplication() {
  if (typeof window !== 'undefined') {
    window.__editMeeStage = 'REACT_BOOTSTRAP';
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('[EditMee] boot:error Fatal: #root container element missing.');
    if (typeof window !== 'undefined' && typeof window.__showEditMeeFallback === 'function') {
      window.__showEditMeeFallback({
        stage: 'CONTAINER_LOOKUP',
        message: '#root element not found in DOM',
      });
    }
    return;
  }

  try {
    console.info('[EditMee] boot:react');
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary isRoot fallbackTitle="EditMee">
          <App />
        </ErrorBoundary>
      </StrictMode>
    );

    // Notify startup recovery guard of successful initialization
    if (typeof window !== 'undefined' && typeof window.__markEditMeeLoaded === 'function') {
      window.__markEditMeeLoaded();
    }
  } catch (err: any) {
    console.error('[EditMee] boot:error Failed to bootstrap React application:', err);
    if (typeof window !== 'undefined' && typeof window.__showEditMeeFallback === 'function') {
      window.__showEditMeeFallback({
        stage: 'REACT_BOOTSTRAP',
        message: err?.message || 'Application bootstrap error',
        error: err,
        stack: err?.stack,
      });
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication);
} else {
  startApplication();
}

