// Janela com os Termos de Uso: abre ao clicar no link, tem botão X para fechar e barra de rolagem lateral.
import { useRef } from "react"
import { useDialog } from "../useDialog"

export function TermsDialog({ onClose }: { onClose: () => void }) {
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
        className="modal terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
      >
        <div className="terms-head">
          <h2 id="terms-title">Termos de Uso</h2>
          <button
            ref={closeRef}
            type="button"
            className="terms-close"
            aria-label="Fechar termos de uso"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="terms-body" tabIndex={0} role="region" aria-label="Texto dos Termos de Uso">
          <p>Última atualização: 02/11/2026. Leia com atenção antes de criar sua conta.</p>

          <h3>1. Sobre o PetLocal</h3>
          <p>
            O PetLocal é um site para cadastrar pets com código ou QR code de identificação, ajudar
            pessoas a avisar o tutor quando encontram um pet e divulgar avisos de “Procura-se”. Esta
            versão é um projeto acadêmico de demonstração.
          </p>

          <h3>2. Aceitação dos termos</h3>
          <p>
            Ao criar uma conta, você declara que leu e concorda com estes Termos de Uso. Se não
            concordar, não conclua o cadastro.
          </p>

          <h3>3. Sua conta</h3>
          <p>
            Você deve informar dados verdadeiros (nome, e-mail, telefone e cidade) e manter sua senha
            em segredo. Você é responsável por tudo o que for feito com a sua conta.
          </p>

          <h3>4. Informações dos pets e avisos</h3>
          <p>
            Você se compromete a cadastrar apenas pets que são seus ou que você esteja autorizado a
            divulgar, e a publicar avisos “Procura-se” verdadeiros. É proibido usar o site para
            enganar, assediar ou prejudicar outras pessoas.
          </p>

          <h3>5. Dados pessoais e privacidade</h3>
          <p>
            Seu nome e telefone ficam visíveis para quem encontrar um dos seus pets (pelo código ou
            QR code) e nos avisos “Procura-se”, para que o pet possa voltar para casa. Não
            compartilhe no site dados que você não queira tornar visíveis.
          </p>
          <p>
            Nesta versão de demonstração os dados ficam salvos somente no navegador do seu aparelho.
            Se você limpar os dados do navegador, eles serão apagados. Você pode editar ou excluir
            seus pets e atualizar seu perfil a qualquer momento.
          </p>

          <h3>6. Localização</h3>
          <p>
            O uso da sua localização é opcional e só acontece quando você clica em “Usar minha
            localização atual” e autoriza o navegador. As coordenadas são enviadas ao serviço público
            OpenStreetMap apenas para descobrir sua cidade e seu estado.
          </p>

          <h3>7. Compartilhamento</h3>
          <p>
            Ao compartilhar o aviso de um pet desaparecido, o texto, a foto e o contato do tutor
            seguem para quem receber a mensagem. Compartilhe somente para ajudar a encontrar o pet.
          </p>

          <h3>8. Limitações</h3>
          <p>
            O código e o QR code identificam o animal quando alguém os lê. Eles não rastreiam o pet em
            tempo real, e o PetLocal não garante que o pet será encontrado.
          </p>

          <h3>9. Alterações e contato</h3>
          <p>
            Estes termos podem mudar; as mudanças valem a partir da publicação nesta página. Dúvidas:
            petlocal@petlocal.com.br.
          </p>
        </div>
      </div>
    </div>
  )
}
