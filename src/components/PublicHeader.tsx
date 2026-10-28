// Menu fixo do topo para quem não está logado (Procura-se, Encontrei um pet, Entrar, Criar conta).
import { useState } from "react"
import { Icon } from "../Icons"
import { Logo } from "./Logo"
import { SkipLink } from "./SkipLink"
import { navigate, openFoundSearch, Route, routeFromHash } from "../routes"

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const currentRoute = routeFromHash()
  const isCurrent = (route: Route) =>
    currentRoute === route || (route === "found" && currentRoute === "alert")
  const goTo = (route: Route) => {
    setMenuOpen(false)
    navigate(route)
  }
  const currentText = (route: Route) =>
    isCurrent(route) ? <span className="sr-only"> (página atual)</span> : null
  return (
    <header className="public-header">
      <SkipLink />
      <div className="header-inner">
        <Logo />
        <nav aria-label="Navegação principal">
          <button
            className="public-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="public-extra-links"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name="menu" size={20} /> Menu
          </button>
          <div
            id="public-extra-links"
            className={menuOpen ? "public-extra-links open" : "public-extra-links"}
          >
            <button
              className={isCurrent("wanted") ? "text-button current" : "text-button"}
              onClick={() => goTo("wanted")}
              aria-current={isCurrent("wanted") ? "page" : undefined}
            >
              <Icon name="search" size={19} /> Procura-se{currentText("wanted")}
            </button>
            <button
              className={isCurrent("login") ? "text-button current" : "text-button"}
              onClick={() => goTo("login")}
              aria-current={isCurrent("login") ? "page" : undefined}
            >
              Entrar{currentText("login")}
            </button>
          </div>
          <button
            className={isCurrent("found") ? "button public-found current" : "button public-found"}
            onClick={() => {
              setMenuOpen(false)
              openFoundSearch(true)
            }}
            aria-current={isCurrent("found") ? "page" : undefined}
          >
            <Icon name="pin" size={19} /> Encontrei um pet{currentText("found")}
          </button>
          <button
            className={isCurrent("register") ? "button small current" : "button small"}
            onClick={() => goTo("register")}
            aria-current={isCurrent("register") ? "page" : undefined}
          >
            Criar conta{currentText("register")}
          </button>
        </nav>
      </div>
    </header>
  )
}
