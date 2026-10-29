// Identificação do pet: pergunta do chip, código único e QR code.
import { useEffect, useState } from "react"
import { store } from "../data"

export type ChipChoice = "" | "yes" | "no"

function generateUniquePetCode() {
  let code = ""
  const usedCodes = new Set(
    store
      .pets()
      .map((pet) => pet.identifierCode?.trim().toUpperCase())
      .filter(Boolean),
  )
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(4))
    code = `PET-${Array.from(bytes, (byte) =>
      byte.toString(36).toUpperCase().padStart(2, "0"),
    )
      .join("")
      .slice(0, 8)}`
  } while (usedCodes.has(code))
  return code
}

export function isIdentifierInUse(code: string, excludedPetId?: string) {
  const normalized = code.trim().toUpperCase()
  return store
    .pets()
    .some(
      (pet) =>
        pet.id !== excludedPetId &&
        pet.identifierCode?.trim().toUpperCase() === normalized,
    )
}

export function PetIdentification({
  petName,
  hasChip,
  code,
  error,
  locked = false,
  onHasChipChange,
  onCodeChange,
}: {
  petName: string
  hasChip: ChipChoice
  code: string
  error: string
  locked?: boolean
  onHasChipChange: (value: ChipChoice) => void
  onCodeChange: (value: string) => void
}) {
  const [qrImage, setQrImage] = useState("")

  useEffect(() => {
    let active = true
    if (!code.trim()) {
      setQrImage("")
      return
    }
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(code.trim(), {
          width: 240,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#123c35", light: "#ffffff" },
        }),
      )
      .then((image) => {
        if (active) setQrImage(image)
      })
    return () => {
      active = false
    }
  }, [code])

  const printQr = () => {
    if (!qrImage) return
    const printWindow = window.open("", "_blank", "width=520,height=650")
    if (!printWindow) return
    printWindow.document.title = `Identificação de ${petName || "pet"}`
    const main = printWindow.document.createElement("main")
    main.style.cssText =
      "font-family:Arial,sans-serif;text-align:center;padding:32px;color:#123c35"
    const title = printWindow.document.createElement("h1")
    title.textContent = petName || "PetLocal"
    const image = printWindow.document.createElement("img")
    image.src = qrImage
    image.alt = `QR code do pet ${petName || "sem nome"}, código ${code}`
    image.style.cssText = "width:280px;max-width:100%"
    const text = printWindow.document.createElement("p")
    text.textContent = code
    text.style.cssText = "font-size:24px;font-weight:bold;letter-spacing:2px"
    main.append(title, image, text)
    printWindow.document.body.append(main)
    image.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  return (
    <fieldset className="identification-fieldset">
      <legend>Identificação do pet</legend>
      <p className="fieldset-help">
        O código identifica o animal quando alguém lê a plaquinha ou o QR code.
        Ele não realiza rastreamento em tempo real.
      </p>
      <div className="field">
        <span className="field-label" id="pet-has-chip-label">
          Seu pet tem chip? <span aria-hidden="true">*</span>
        </span>
        <div
          className="radio-group"
          role="radiogroup"
          aria-labelledby="pet-has-chip-label"
          aria-required="true"
        >
          <label className={hasChip === "yes" ? "selected" : undefined}>
            <input
              type="radio"
              name="pet-has-chip"
              value="yes"
              checked={hasChip === "yes"}
              disabled={locked}
              onChange={() => onHasChipChange("yes")}
            />
            Sim
          </label>
          <label className={hasChip === "no" ? "selected" : undefined}>
            <input
              type="radio"
              name="pet-has-chip"
              value="no"
              checked={hasChip === "no"}
              disabled={locked}
              onChange={() => onHasChipChange("no")}
            />
            Não
          </label>
        </div>
      </div>
      {hasChip === "yes" && (
        <div className="field">
          <label htmlFor="pet-chip-code">
            Número do chip <span aria-hidden="true">*</span>
          </label>
          <input
            id="pet-chip-code"
            value={code}
            readOnly={locked}
            onChange={(event) => onCodeChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "pet-code-error" : "pet-code-hint"}
            placeholder="Digite o número completo do chip"
            required
          />
          <small id="pet-code-hint">
            Digite exatamente como aparece no documento do chip.
          </small>
        </div>
      )}
      {hasChip === "no" && !code && !locked && (
        <button
          className="button secondary generate-code-button"
          type="button"
          onClick={() => onCodeChange(generateUniquePetCode())}
        >
          Gerar código
        </button>
      )}
      {error && (
        <p id="pet-code-error" className="field-error" role="alert">
          {error}
        </p>
      )}
      {locked && (
        <p className="locked-code-note">
          O código não pode ser alterado, para o QR code da coleira continuar
          funcionando.
        </p>
      )}
      {code && (
        <div className="qr-preview">
          <div>
            <span>Código de identificação</span>
            <strong>{code}</strong>
            {hasChip === "no" && !locked && (
              <button
                type="button"
                className="text-link"
                onClick={() => onCodeChange(generateUniquePetCode())}
              >
                Gerar outro código
              </button>
            )}
          </div>
          {qrImage && (
            <img
              src={qrImage}
              alt={`QR code do pet ${petName || "sem nome"}, código ${code}`}
            />
          )}
          <div className="qr-actions">
            <a
              className="button secondary"
              href={qrImage}
              download={`qrcode-${petName || "pet"}.png`}
              aria-label={`Baixar QR code de ${petName || "seu pet"}`}
            >
              Baixar QR code
            </a>
            <button className="button secondary" type="button" onClick={printQr}>
              Imprimir
            </button>
          </div>
        </div>
      )}
    </fieldset>
  )
}
