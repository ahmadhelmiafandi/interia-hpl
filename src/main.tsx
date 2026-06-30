import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Suppress Three.js deprecations, shader compilation warnings, and Supabase fallbacks from polluting the console
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (typeof args[0] === 'string') {
    const msg = args[0];
    if (
      msg.includes('THREE.Clock') ||
      msg.includes('THREE.WebGLShadowMap') ||
      msg.includes('THREE.WebGLProgram') ||
      msg.includes('[api3d] Supabase') ||
      msg.includes('warning X4122') ||
      msg.includes('accuracy in double precision')
    ) {
      return;
    }
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string') {
    const msg = args[0];
    if (msg.includes('[api3d]') || msg.includes('Supabase')) {
      return;
    }
  }
  originalError(...args);
};



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)