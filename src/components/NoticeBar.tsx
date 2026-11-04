import { useEffect, useRef } from "react"
import { Icon } from "../Icons"

export type Notice = { type: "success" | "error" | "info"; text: string } | null

export function NoticeBar({ notice, clear }: { notice: Notice; clear: () => void }) {
  const clearRef = useRef(clear)

  useEffect(() => {
    clearRef.current = clear
  }, [clear])

  useEffect(() => {
    if (!notice) return

    const timer = window.setTimeout(() => {
      clearRef.current()
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [notice])

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
