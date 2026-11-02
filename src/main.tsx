import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initTheme } from './theme'
import { clearInvalid, focusFormError } from './formValidation'

initTheme()

// Ao corrigir um campo marcado com erro, o aviso de erro do campo é removido.
document.addEventListener("input", (event) => {
  const target = event.target as HTMLElement | null
  if (target?.hasAttribute?.("aria-invalid")) clearInvalid(target)
})

// Quando aparece (ou muda) uma mensagem de erro de formulário, o foco vai para ela.
new MutationObserver((mutations) => {
  const isAlert = (node: Node | null) =>
    node instanceof HTMLElement &&
    (node.matches('[role="alert"]') || Boolean(node.querySelector('[role="alert"]')))
  const changed = mutations.some(
    (mutation) =>
      Array.from(mutation.addedNodes).some(isAlert) ||
      (mutation.type === "characterData" &&
        Boolean(mutation.target.parentElement?.closest('[role="alert"]'))),
  )
  if (changed) focusFormError()
}).observe(document.body, { childList: true, subtree: true, characterData: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
