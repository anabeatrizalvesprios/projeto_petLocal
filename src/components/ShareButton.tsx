// Botão "Compartilhar": no celular (e nos computadores que permitem) abre o compartilhamento do aparelho
// com texto, link e foto do pet. Nos demais, abre uma janela com WhatsApp, e-mail, copiar e baixar a foto.
import { useEffect, useRef, useState } from "react"
import { Icon } from "../Icons"
import { photoFile, SharedPet, shareMessage, shareUrl } from "../share"
import { whatsappShareLink } from "../contact"
import { useDialog } from "../useDialog"

export function ShareButton({ pet, className = "button secondary" }: { pet: SharedPet; className?: string }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const share = async () => {
    setBusy(true)
    try {
      const url = shareUrl(pet)
      const file = pet.photo ? await photoFile(pet.photo, pet.name) : null
      const data: ShareData = { title: `Procura-se: ${pet.name}`, text: shareMessage(pet, url) }
      try {
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ ...data, files: [file] })
          return
        }
        if (!pet.photo && navigator.share) {
          await navigator.share(data)
          return
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return // a pessoa fechou o compartilhamento
      }
      setOpen(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={share}
        disabled={busy}
        aria-haspopup="dialog"
        aria-label={`Compartilhar o aviso de ${pet.name}`}
      >
        <Icon name="share" size={18} /> Compartilhar
      </button>
      {open && <ShareDialog pet={pet} onClose={() => setOpen(false)} />}
    </>
  )
}

function ShareDialog({ pet, onClose }: { pet: SharedPet; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useDialog(ref, onClose, closeRef)
  const url = shareUrl(pet)
  const message = shareMessage(pet, url)
  const [copied, setCopied] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")

  // Prepara a foto para baixar (funciona também com fotos de outros sites).
  useEffect(() => {
    let objectUrl = ""
    let active = true
    if (pet.photo)
      photoFile(pet.photo, pet.name).then((file) => {
        if (!file || !active) return
        objectUrl = URL.createObjectURL(file)
        setPhotoUrl(objectUrl)
      })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [pet.photo, pet.name])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied("Texto e link copiados. Agora é só colar na mensagem.")
    } catch {
      setCopied("Não foi possível copiar automaticamente. Selecione o texto acima e copie.")
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div ref={ref} className="modal share-modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <h2 id="share-title">Compartilhar {pet.name}</h2>
        <p>Só o aviso deste pet será compartilhado.</p>
        <textarea readOnly rows={6} value={message} aria-label="Texto do compartilhamento" onFocus={(event) => event.target.select()} />
        <div className="share-actions">
          <a className="button" href={whatsappShareLink(message)} target="_blank" rel="noopener noreferrer">
            Enviar no WhatsApp <span className="sr-only">(abre em nova aba)</span>
          </a>
          <a className="button secondary" href={`mailto:?subject=${encodeURIComponent(`Procura-se: ${pet.name}`)}&body=${encodeURIComponent(message)}`}>
            Enviar por e-mail
          </a>
          <button type="button" className="button secondary" onClick={copy}>
            Copiar texto e link
          </button>
          {pet.photo && (
            <a
              className="button secondary"
              href={photoUrl || pet.photo}
              download={`${pet.name}.jpg`}
              target={photoUrl ? undefined : "_blank"}
              rel="noopener noreferrer"
            >
              {photoUrl ? "Baixar a foto" : "Abrir a foto"}
            </a>
          )}
        </div>
        <p role="status" className="share-status">{copied}</p>
        {pet.photo && <p className="share-note">Para enviar a foto, anexe o arquivo baixado na mensagem.</p>}
        <div className="form-actions">
          <button ref={closeRef} type="button" className="button cancel" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
