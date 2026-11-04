// Botão para fechar (e reabrir) o tradutor de Libras (VLibras). Fica em todas as telas, no canto inferior direito.
import { useEffect, useState } from "react"

const KEY = "petlocal_libras_closed_v1"

function readClosed() {
  try {
    return localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

export function LibrasControl() {
  const [closed, setClosed] = useState(readClosed)

  // A classe no <html> esconde todo o widget do VLibras (veja "libras-closed" no index.css).
  useEffect(() => {
    document.documentElement.classList.toggle("libras-closed", closed)
    try {
      localStorage.setItem(KEY, closed ? "1" : "0")
    } catch {
      // sem localStorage: a escolha vale só até recarregar a página
    }
  }, [closed])

  return (
    <button
      type="button"
      className="libras-fab"
      onClick={() => setClosed(!closed)}
      aria-label={closed ? "Abrir o tradutor de Libras" : "Fechar o tradutor de Libras"}
    >
      <span aria-hidden="true">{closed ? "👋" : "×"}</span>
      {closed ? "Abrir Libras" : "Fechar Libras"}
    </button>
  )
}
