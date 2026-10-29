// Botão "Ajuda" sempre visível: abre uma janela com dicas da tela atual e respostas rápidas.
import { useRef, useState } from "react"
import { Icon } from "../Icons"
import { Route } from "../routes"
import { useDialog } from "../useDialog"

const tips: Record<Route, string> = {
  home: "Para cadastrar seu pet, clique em “Criar conta”. Se você encontrou um animal, clique em “Encontrei um pet”: não precisa de conta.",
  register: "Preencha seus dados e clique em “Continuar”. O telefone aparece para quem encontrar o seu pet, para que possa ligar para você.",
  onboarding: "Informe onde você mora e os dados do seu pet. Se ele não tem chip, clique em “Gerar código”: o sistema cria o código e o QR code.",
  login: "Digite o e-mail e a senha que você usou no cadastro. Se não tem conta, clique em “Criar conta”.",
  forgot: "Esta é uma demonstração: nenhum e-mail é enviado de verdade.",
  found: "Digite o código que está na plaquinha do pet ou use “Ler QR code” para usar a câmera. Depois, ligue para o dono ou clique em “Avisar o dono”.",
  alert: "Informe onde você viu o pet. Estado, cidade e data são necessários. O dono recebe o aviso na tela “Avisos”.",
  wanted: "Veja os pets desaparecidos. Use os filtros de estado e cidade. Se viu algum deles, clique em “Vi este pet”.",
  dashboard: "Aqui você vê o resumo dos seus pets e os avisos novos. Use o menu para ir às outras telas.",
  pets: "Aqui você cadastra, edita ou exclui seus pets e marca um pet como desaparecido ou encontrado.",
  "pet-form": "Os campos com asterisco (*) são obrigatórios. O código de identificação não pode ser alterado depois, para o QR code da coleira continuar funcionando.",
  location: "Os avisos novos aparecem primeiro. Clique em “Marcar como visto” para tirar o aviso da lista de novos. Você pode vê-lo depois em “Vistos”.",
  profile: "Atualize seu contato. O telefone aparece para quem encontrar o seu pet.",
}

const faq: { q: string; a: string }[] = [
  { q: "Meu pet sumiu. O que faço?", a: "Entre na sua conta, abra “Meus pets” e clique em “Marcar como desaparecido”. Ele passa a aparecer na lista “Procura-se”." },
  { q: "Encontrei um pet. O que faço?", a: "Clique em “Encontrei um pet”, digite o código da plaquinha ou leia o QR code. Você verá o contato do dono para ligar, chamar no WhatsApp ou enviar um aviso." },
  { q: "Como uso o site só com o teclado?", a: "Use Tab para avançar e Shift+Tab para voltar. Enter ou Espaço aciona botões. Esc fecha janelas. As setas funcionam nas abas e na lista de cidades." },
  { q: "Tem tradução para Libras?", a: "Sim. Use o botão do VLibras, na lateral direita da tela, para ver o texto traduzido para Libras." },
  { q: "Meus dados ficam salvos onde?", a: "Neste navegador, neste aparelho. Se limpar os dados do navegador, as informações são apagadas." },
]

export function HelpButton({ route, inApp }: { route: Route; inApp: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        className={inApp ? "help-fab in-app" : "help-fab"}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Icon name="help" size={22} /> Ajuda
      </button>
      {open && <HelpDialog route={route} onClose={() => setOpen(false)} />}
    </>
  )
}

function HelpDialog({ route, onClose }: { route: Route; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useDialog(ref, onClose, closeRef)
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        className="modal help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <h2 id="help-title">Precisa de ajuda?</h2>
        <section aria-labelledby="help-here" className="help-here">
          <h3 id="help-here">Nesta tela</h3>
          <p>{tips[route]}</p>
        </section>
        <section aria-labelledby="help-faq">
          <h3 id="help-faq">Dúvidas comuns</h3>
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </section>
        <div className="form-actions">
          <button ref={closeRef} type="button" className="button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
