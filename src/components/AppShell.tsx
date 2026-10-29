// Estrutura da área logada: menu lateral e área de conteúdo.
import { useEffect, useState } from "react"
import { SkipLink } from "./SkipLink"
import { Icon, IconName } from "../Icons"
import { Logo } from "./Logo"
import { User } from "../data"
import { navigate, openFoundSearch, Route } from "../routes"

export function AppShell({
  route,
  user,
  children,
  onLogout,
}: {
  route: Route
  user: User
  children: React.ReactNode
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const items: {
    route: Route
    label: string
    icon: IconName
  }[] = [
    { route: "dashboard", label: "Início", icon: "home" },
    { route: "pets", label: "Meus pets", icon: "paw" },
    { route: "location", label: "Avisos", icon: "alert-sign" },
    { route: "wanted", label: "Procura-se", icon: "search" },
    { route: "found", label: "Encontrei um pet", icon: "pin" },
    { route: "profile", label: "Meu perfil", icon: "user" },
  ]
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [open])
  return (
    <div className="app-shell">
      <SkipLink />
      <aside
        className={open ? "sidebar open" : "sidebar"}
        aria-label="Menu da conta"
      >
        <div className="sidebar-top">
          <Logo compact />
          <button
            className="icon-button close-menu"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>
        <nav>
          {items.map((item) => (
            <button
              key={item.route}
              className={route === item.route ? "nav-item active" : "nav-item"}
              onClick={() => {
                if (item.route === "found") openFoundSearch(true)
                else navigate(item.route)
                setOpen(false)
              }}
              aria-current={route === item.route ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.name.split(" ")[0]}</strong>
            <small>{user.email}</small>
          </div>
          <button
            className="icon-button"
            onClick={onLogout}
            aria-label="Sair da conta"
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <main id="conteudo" className="app-main">
        <div className="mobile-bar">
          <button
            className="icon-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            <Icon name="menu" />
          </button>
          <Logo compact />
          <span className="avatar small-avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        {children}
      </main>
    </div>
  )
}
