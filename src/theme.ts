// Tema claro/escuro: segue a preferência do aparelho até a pessoa escolher; a escolha fica salva no navegador.
import { useEffect, useState } from "react"

export type Theme = "light" | "dark"
const KEY = "petlocal_theme_v1"
const EVENT = "petlocal:theme"

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === "dark" || value === "light" ? value : null
  } catch {
    return null
  }
}
const system = (): Theme =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"

export const currentTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light"

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  window.dispatchEvent(new Event(EVENT))
}

export function initTheme() {
  applyTheme(stored() ?? system())
  // Enquanto a pessoa não escolher, acompanha a mudança do sistema.
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (!stored()) applyTheme(system())
  })
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  useEffect(() => {
    const sync = () => setTheme(currentTheme())
    window.addEventListener(EVENT, sync)
    return () => window.removeEventListener(EVENT, sync)
  }, [])
  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* sem armazenamento: a escolha vale só enquanto a página estiver aberta */
    }
    applyTheme(next)
  }
  return { theme, toggle }
}
