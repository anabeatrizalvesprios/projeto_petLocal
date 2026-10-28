// Logotipo do PetLocal.
import { Icon } from "../Icons"
import { Pet, store } from "../data"
import { navigate } from "../routes"

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <button
      className="logo"
      onClick={() => navigate(store.session() ? "dashboard" : "home")}
      aria-label="PetLocal, ir para o início"
    >
      <span className="logo-mark">
        <Icon name="paw" size={compact ? 22 : 26} />
      </span>
      <span>
        Pet<span>Local</span>
      </span>
    </button>
  )
}
