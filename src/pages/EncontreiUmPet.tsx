// Tela 'Encontrei um pet': busca o pet por código digitado ou QR code e mostra o contato do dono.
import { FormEvent, useEffect, useRef, useState } from "react"
import { Icon } from "../Icons"
import { BackHome } from "../components/BackHome"
import { PublicHeader } from "../components/PublicHeader"
import { PetTypeLabel, speciesIcon } from "../components/SpeciesField"
import { Pet, store, User } from "../data"
import { validateForm } from "../formValidation"
import { whatsappLink } from "../contact"

export function EncontreiUmPet({
  onAlert,
  showHeader = true,
}: {
  onAlert: (pet: Pet) => void
  showHeader?: boolean
}) {
  const [mode, setMode] = useState<"code" | "camera">("code")
  const [code, setCode] = useState(() =>
    sessionStorage.getItem("petlocal_last_search_code") ?? "",
  )
  const [cameraError, setCameraError] = useState("")
  const [cameraStatus, setCameraStatus] = useState("")
  const [searchError, setSearchError] = useState("")
  const [result, setResult] = useState<{ pet: Pet; tutor: User } | null>(() => {
    const savedCode = sessionStorage.getItem("petlocal_last_search_code")
    if (!savedCode) return null
    const pet = store
      .pets()
      .find(
        (item) =>
          item.identifierCode?.trim().toUpperCase() ===
          savedCode?.trim().toUpperCase(),
      )
    const tutor = pet
      ? store.users().find((item) => item.id === pet.userId)
      : undefined
    return pet && tutor ? { pet, tutor } : null
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<number | null>(null)

  const stopCamera = () => {
    if (scannerRef.current) window.clearInterval(scannerRef.current)
    scannerRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => stopCamera, [])
  // Quando o pet é encontrado, leva o foco ao resultado para que seja lido pelo leitor de tela.
  useEffect(() => {
    if (result) document.getElementById("found-pet-name")?.focus()
  }, [result])
  useEffect(() => {
    const resetSearch = () => {
      stopCamera()
      setMode("code")
      setCode("")
      setResult(null)
      setSearchError("")
      setCameraError("")
      setCameraStatus("")
    }
    window.addEventListener("petlocal:reset-search", resetSearch)
    return () =>
      window.removeEventListener("petlocal:reset-search", resetSearch)
  }, [])

  const lookupPet = (value: string) => {
    const normalized = value.trim().toUpperCase()
    sessionStorage.setItem("petlocal_last_search_code", value.trim())
    const pet = store
      .pets()
      .find((item) => item.identifierCode?.trim().toUpperCase() === normalized)
    const tutor = pet
      ? store.users().find((item) => item.id === pet.userId)
      : undefined
    if (!pet || !tutor) {
      setResult(null)
      setSearchError(
        "Nenhum pet encontrado com este código. Confira e tente de novo.",
      )
      return
    }
    setSearchError("")
    setResult({ pet, tutor })
  }

  const chooseCode = () => {
    stopCamera()
    setMode("code")
    setCameraError("")
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const startCamera = async () => {
    setCameraError("")
    setCameraStatus("Solicitando permissão para usar a câmera…")
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("")
      setCameraError(
        "A câmera não está disponível neste navegador. Digite o código da identificação.",
      )
      return
    }
    try {
      const { default: readQr } = await import("jsqr")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraStatus("Aponte a câmera para o QR code da identificação.")

      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      })
      scannerRef.current = window.setInterval(() => {
        const video = videoRef.current
        if (!video || !context || !video.videoWidth || !video.videoHeight) return
        try {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const frame = context.getImageData(0, 0, canvas.width, canvas.height)
          const value = readQr(frame.data, frame.width, frame.height, {
            inversionAttempts: "attemptBoth",
          })?.data.trim()
          if (value) {
            setCode(value)
            setCameraStatus(`QR code lido: ${value}`)
            setCameraError("")
            stopCamera()
            lookupPet(value)
          }
        } catch {
          setCameraError(
            "Não foi possível ler este QR code. Tente novamente ou digite o código.",
          )
        }
      }, 500)
    } catch (error) {
      setCameraStatus("")
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError")
      setCameraError(
        denied
          ? "O acesso à câmera foi negado. Você pode continuar digitando o código."
          : "Não foi possível abrir a câmera. Você pode continuar digitando o código.",
      )
    }
  }

  const acceptCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCameraStatus("")
    const problem = validateForm(event.currentTarget)
    if (problem) {
      setResult(null)
      setSearchError("Digite o código de identificação que está na plaquinha do pet.")
      return
    }
    lookupPet(code)
  }
  const chooseCamera = () => {
    stopCamera()
    setMode("camera")
    setCameraError("")
    setCameraStatus("")
  }
  // Abas: setas esquerda/direita, Home e End trocam de aba (padrão WAI-ARIA).
  const onTabKeys = (event: React.KeyboardEvent) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"]
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const next = mode === "code" ? "camera" : "code"
    const target = event.key === "Home" ? "code" : event.key === "End" ? "camera" : next
    if (target === "code") chooseCode()
    else chooseCamera()
    window.setTimeout(() => document.getElementById(`tab-${target}`)?.focus(), 0)
  }

  // Na área logada o <main> já existe no menu lateral; aqui usamos uma <div> para não repetir.
  const Page = showHeader ? "main" : "div"
  return (
    <>
      {showHeader && <PublicHeader />}
      <Page className="found-page">
        <BackHome />
        <section className="found-access-card" aria-labelledby="found-title">
          <span className="feature-icon blue" aria-hidden="true">
            <Icon name="pin" />
          </span>
          <div className="found-access-heading">
            <span>AJUDE UM PET A VOLTAR PARA CASA</span>
            <h1 id="found-title">Encontrei um pet</h1>
            <p>
              Use o código da identificação ou leia o QR code preso à coleira.
            </p>
          </div>
          <div className="search-options" role="tablist" aria-label="Forma de identificar o pet" onKeyDown={onTabKeys}>
            <button
              id="tab-code"
              type="button"
              className={mode === "code" ? "active" : ""}
              role="tab"
              aria-selected={mode === "code"}
              aria-controls="code-panel"
              tabIndex={mode === "code" ? 0 : -1}
              onClick={chooseCode}
            >
              Digitar código
            </button>
            <button
              id="tab-camera"
              type="button"
              className={mode === "camera" ? "active" : ""}
              role="tab"
              aria-selected={mode === "camera"}
              aria-controls="camera-panel"
              tabIndex={mode === "camera" ? 0 : -1}
              onClick={chooseCamera}
            >
              Ler QR code
            </button>
          </div>
          {mode === "code" ? (
            <div id="code-panel" role="tabpanel" aria-labelledby="tab-code">
              <form className="found-code-form" onSubmit={acceptCode} noValidate>
                <div className="field">
                  <label htmlFor="found-pet-code">
                    Código de identificação <span aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    id="found-pet-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    placeholder="Ex.: PET-1A2B3C4D"
                    required
                    autoComplete="off"
                  />
                </div>
                <button className="button" type="submit">
                  Continuar com este código
                </button>
              </form>
            </div>
          ) : (
            <div id="camera-panel" className="camera-panel" role="tabpanel" aria-labelledby="tab-camera">
              <p>
                A câmera será usada somente para ler o QR code da identificação
                do pet.
              </p>
              <div className="camera-frame">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  aria-label="Imagem da câmera para leitura do QR code"
                />
                {!streamRef.current && (
                  <span aria-hidden="true">
                    <Icon name="eye" size={42} />
                  </span>
                )}
              </div>
              {!streamRef.current && (
                <button className="button" type="button" onClick={startCamera}>
                  Permitir câmera e ler QR code
                </button>
              )}
            </div>
          )}
          {cameraError && (
            <div className="camera-message error" role="alert">
              <Icon name="warning" size={20} />
              <div>
                <p>{cameraError}</p>
                <button className="text-link" type="button" onClick={chooseCode}>
                  Digitar código
                </button>
              </div>
            </div>
          )}
          {cameraStatus && (
            <p className="camera-message success" role="status">
              <Icon name="check" size={20} /> {cameraStatus}
            </p>
          )}
          {searchError && (
            <p className="camera-message error" role="alert">
              <Icon name="warning" size={20} /> {searchError}
            </p>
          )}
          {result && (
            <article className="found-pet-result" aria-labelledby="found-pet-name">
              <div className="found-pet-photo">
                {result.pet.photo ? (
                  <img
                    src={result.pet.photo}
                    alt={`Foto do pet ${result.pet.name}, ${result.pet.species.toLowerCase()} ${result.pet.color.toLowerCase()}`.trim()}
                  />
                ) : (
                  <span aria-hidden="true">
                    <Icon name={speciesIcon(result.pet.species)} size={55} />
                  </span>
                )}
              </div>
              <div className="found-pet-data">
                <span>Pet identificado</span>
                <h2 id="found-pet-name" tabIndex={-1}>{result.pet.name}</h2>
                <PetTypeLabel species={result.pet.species} />
                <dl>
                  <div><dt>Raça</dt><dd>{result.pet.breed || "Não informada"}</dd></div>
                  <div><dt>Cor</dt><dd>{result.pet.color || "Não informada"}</dd></div>
                  <div><dt>Sexo</dt><dd>{result.pet.sex || "Não informado"}</dd></div>
                </dl>
                <div className="result-observations">
                  <span>Observações</span>
                  <p>{result.pet.notes || "Nenhuma observação informada."}</p>
                </div>
                <div className="search-location">
                  <strong>Último local visto</strong>
                  <p>
                    {result.pet.missing?.city || result.tutor.city} – {result.pet.missing?.state || result.tutor.state}
                    {result.pet.missing?.reference ? ` · ${result.pet.missing.reference}` : ""}
                  </p>
                </div>
                <div className="owner-contact">
                  <span>Contato do dono</span>
                  <strong>{result.tutor.name}</strong>
                  <p>{result.tutor.phone}</p>
                </div>
                <div className="result-actions">
                  <button className="button" onClick={() => onAlert(result.pet)}>
                    Avisar o dono
                  </button>
                  <a
                    className="button secondary"
                    href={`tel:${result.tutor.phone.replace(/\D/g, "")}`}
                    aria-label={`Ligar para o dono de ${result.pet.name}, ${result.tutor.name}`}
                  >
                    Ligar para o dono
                  </a>
                  <a
                    className="button secondary"
                    href={whatsappLink(result.tutor.phone, `Olá! Encontrei ${result.pet.name} (código ${result.pet.identifierCode}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chamar no WhatsApp, dono de ${result.pet.name} (abre em nova aba)`}
                  >
                    Chamar no WhatsApp
                  </a>
                </div>
              </div>
            </article>
          )}
        </section>
      </Page>
    </>
  )
}
