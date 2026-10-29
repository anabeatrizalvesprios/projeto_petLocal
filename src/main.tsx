import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initTheme } from './theme'

initTheme()

// Ao corrigir um campo marcado com erro, o aviso de erro do campo é removido.
document.addEventListener("input", (event) => {
  ;(event.target as HTMLElement | null)?.removeAttribute?.("aria-invalid")
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
