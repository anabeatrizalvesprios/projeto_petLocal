// Botão padrão "Voltar para a tela inicial" (mesmo texto e mesmo ícone em todas as telas).
import { Icon } from "../Icons"
import { store } from "../data"
import { navigate } from "../routes"

export function BackHome() {
  return (
    <button
      type="button"
      className="back-link"
      onClick={() => navigate(store.session() ? "dashboard" : "home")}
    >
      <Icon name="home" size={19} /> Voltar para a tela inicial
    </button>
  )
}
