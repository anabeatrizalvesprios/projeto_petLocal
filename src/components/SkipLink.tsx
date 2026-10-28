// Link "Pular para o conteúdo". É um botão (e não um link com #) porque o site usa o # para as rotas.
export function SkipLink() {
  return (
    <button
      type="button"
      className="skip-link"
      onClick={() => {
        const main = document.querySelector<HTMLElement>("main")
        if (!main) return
        main.setAttribute("tabindex", "-1")
        main.focus()
        main.scrollIntoView({ block: "start" })
      }}
    >
      Pular para o conteúdo
    </button>
  )
}
