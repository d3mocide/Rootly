import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens.css'
import './index.css'
import './styles/plant-icon.css'
import App from './App.tsx'
import { LayoutDebugger } from './components/LayoutDebugger'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <LayoutDebugger />
  </StrictMode>,
)
