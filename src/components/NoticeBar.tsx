// Barra de mensagens rápidas (sucesso, erro e informação).
// A mensagem fica na tela até a pessoa fechar (não some sozinha), para dar tempo de ler.
import { Icon } from "../Icons"

export type Notice = { type: "success" | "error" | "info"; text: string } | null

export function NoticeBar({ notice, clear }: { notice: Notice; clear: () => void }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {notice && (
        <div className={`notice ${notice.type}`}>
          <Icon name={notice.type === "error" ? "warning" : "check"} />
          <span>{notice.text}</span>
          <button type="button" onClick={clear} aria-label="Fechar mensagem">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
