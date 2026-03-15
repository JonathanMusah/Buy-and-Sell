import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root')!

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Reveal the app after React has rendered to prevent flash
requestAnimationFrame(() => {
  root.classList.add('ready')
})
