// Janela de confirmação para ações que não podem ser desfeitas ou que mudam o estado do pet.
import { useRef } from "react"
import { Icon } from "../Icons"
import { useDialog } from "../useDialog"

export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  title: string
  text: string
  confirmLabel: string
  tone?: "danger" | "success"
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  useDialog(dialogRef, onCancel, cancelRef)
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
      >
        <span className={tone === "danger" ? "danger-icon" : "danger-icon success-icon"}>
          <Icon name={tone === "danger" ? "trash" : "check"} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-text">{text}</p>
        <div className="form-actions">
          <button ref={cancelRef} className="button secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={tone === "danger" ? "button danger" : "button found-button"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
