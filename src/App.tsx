import { FormEvent, useEffect, useRef, useState } from "react"
import { CityCombobox } from "./CityCombobox"
import { Icon, IconName } from "./Icons"
import {
  formatDate,
  hashPassword,
  LocationRecord,
  makeId,
  normalizeEmail,
  Pet,
  RegisterDraft,
  store,
  User,
} from "./data"

const ensureDemoData = async () =>
  (await import("./demoData")).ensureDemoData()

type Route =
  | "home"
  | "register"
  | "onboarding"
  | "login"
  | "forgot"
  | "found"
  | "alert"
  | "wanted"
  | "dashboard"
  | "pets"
  | "pet-form"
  | "location"
  | "profile"

type Notice = { type: "success" | "error" | "info"; text: string } | null

const publicRoutes: Route[] = [
  "home",
  "register",
  "onboarding",
  "login",
  "forgot",
  "found",
  "alert",
  "wanted",
]

function routeFromHash(): Route {
  const value = window.location.hash.replace("#/", "") as Route
  return [
    "home",
    "register",
    "onboarding",
    "login",
    "forgot",
    "found",
    "alert",
    "wanted",
    "dashboard",
    "pets",
    "pet-form",
    "location",
    "profile",
  ].includes(value)
    ? value
    : "home"
}

const states = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
  hint,
  autoComplete,
  minLength,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  autoComplete?: string
  minLength?: number
}) {
  const id = `field-${name}`
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        autoComplete={autoComplete}
        minLength={minLength}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  )
}

function SelectField({
  label,
  name,
  value,
  onChange,
  children,
  required = true,
}: {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <select
        id={`field-${name}`}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <button
      className="logo"
      onClick={() => navigate(store.session() ? "dashboard" : "home")}
      aria-label="PetLocal, ir para o início"
    >
      <span className="logo-mark">
        <Icon name="paw" size={compact ? 22 : 26} />
      </span>
      <span>
        Pet<span>Local</span>
      </span>
    </button>
  )
}

function navigate(route: Route) {
  window.location.hash = `/${route}`
}

function openFoundSearch(reset = false) {
  if (reset) {
    sessionStorage.removeItem("petlocal_last_search_code")
    window.dispatchEvent(new Event("petlocal:reset-search"))
  }
  navigate("found")
}

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const currentRoute = routeFromHash()
  const isCurrent = (route: Route) =>
    currentRoute === route || (route === "found" && currentRoute === "alert")
  const goTo = (route: Route) => {
    setMenuOpen(false)
    navigate(route)
  }
  const currentText = (route: Route) =>
    isCurrent(route) ? <span className="sr-only"> (página atual)</span> : null
  return (
    <header className="public-header">
      <div className="header-inner">
        <Logo />
        <nav aria-label="Navegação principal">
          <button
            className="public-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="public-extra-links"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name="menu" size={20} /> Menu
          </button>
          <div
            id="public-extra-links"
            className={menuOpen ? "public-extra-links open" : "public-extra-links"}
          >
            <button
              className={isCurrent("wanted") ? "text-button current" : "text-button"}
              onClick={() => goTo("wanted")}
              aria-current={isCurrent("wanted") ? "page" : undefined}
            >
              <Icon name="search" size={19} /> Procura-se{currentText("wanted")}
            </button>
            <button
              className={isCurrent("login") ? "text-button current" : "text-button"}
              onClick={() => goTo("login")}
              aria-current={isCurrent("login") ? "page" : undefined}
            >
              Entrar{currentText("login")}
            </button>
          </div>
          <button
            className={isCurrent("found") ? "button public-found current" : "button public-found"}
            onClick={() => {
              setMenuOpen(false)
              openFoundSearch(true)
            }}
            aria-current={isCurrent("found") ? "page" : undefined}
          >
            <Icon name="pin" size={19} /> Encontrei um pet{currentText("found")}
          </button>
          <button
            className={isCurrent("register") ? "button small current" : "button small"}
            onClick={() => goTo("register")}
            aria-current={isCurrent("register") ? "page" : undefined}
          >
            Criar conta{currentText("register")}
          </button>
        </nav>
      </div>
    </header>
  )
}

function AppShell({
  route,
  user,
  children,
  onLogout,
}: {
  route: Route
  user: User
  children: React.ReactNode
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const items: {
    route: Route
    label: string
    icon: IconName
  }[] = [
    { route: "dashboard", label: "Início", icon: "home" },
    { route: "pets", label: "Meus pets", icon: "paw" },
    { route: "location", label: "Avisos", icon: "alert-sign" },
    { route: "wanted", label: "Procura-se", icon: "search" },
    { route: "found", label: "Encontrei um pet", icon: "pin" },
    { route: "profile", label: "Meu perfil", icon: "user" },
  ]
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <aside
        className={open ? "sidebar open" : "sidebar"}
        aria-label="Menu da conta"
      >
        <div className="sidebar-top">
          <Logo compact />
          <button
            className="icon-button close-menu"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>
        <nav>
          {items.map((item) => (
            <button
              key={item.route}
              className={route === item.route ? "nav-item active" : "nav-item"}
              onClick={() => {
                if (item.route === "found") openFoundSearch(true)
                else navigate(item.route)
                setOpen(false)
              }}
              aria-current={route === item.route ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user.name.split(" ")[0]}</strong>
            <small>{user.email}</small>
          </div>
          <button
            className="icon-button"
            onClick={onLogout}
            aria-label="Sair da conta"
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <main id="conteudo" className="app-main">
        <div className="mobile-bar">
          <button
            className="icon-button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Icon name="menu" />
          </button>
          <Logo compact />
          <span className="avatar small-avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        {children}
      </main>
    </div>
  )
}

function NoticeBar({ notice, clear }: { notice: Notice; clear: () => void }) {
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(clear, 6000)
    return () => window.clearTimeout(timer)
  }, [notice, clear])
  if (!notice) return null
  return (
    <div
      className={`notice ${notice.type}`}
      role={notice.type === "error" ? "alert" : "status"}
    >
      <Icon name={notice.type === "error" ? "warning" : "check"} />
      <span>{notice.text}</span>
      <button onClick={clear} aria-label="Fechar mensagem">
        ×
      </button>
    </div>
  )
}

type ChipChoice = "" | "yes" | "no"

const speciesOptions: Array<{ name: string; icon: IconName }> = [
  { name: "Cachorro", icon: "dog" },
  { name: "Gato", icon: "cat" },
  { name: "Passarinho", icon: "bird" },
  { name: "Coelho", icon: "rabbit" },
  { name: "Outro", icon: "paw" },
]

function speciesIcon(species: string): IconName {
  if (species === "Cachorro") return "dog"
  if (species === "Gato") return "cat"
  if (species === "Passarinho" || species === "Ave") return "bird"
  if (species === "Coelho") return "rabbit"
  return "paw"
}

function SpeciesField({
  name,
  value,
  onChange,
}: {
  name: string
  value: string
  onChange: (species: string) => void
}) {
  const labelId = `${name}-species-label`
  return (
    <fieldset className="species-field">
      <legend id={labelId}>
        Espécie <span aria-hidden="true">*</span>
      </legend>
      <div className="species-options" role="radiogroup" aria-labelledby={labelId}>
        {speciesOptions.map((option) => (
          <label
            key={option.name}
            className={value === option.name ? "selected" : undefined}
          >
            <input
              type="radio"
              name={name}
              value={option.name}
              checked={
                value === option.name ||
                (value === "Ave" && option.name === "Passarinho")
              }
              onChange={() => onChange(option.name)}
              required
            />
            <Icon name={option.icon} size={24} />
            <span>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function PetTypeLabel({ species }: { species: string }) {
  const displayName = species === "Ave" ? "Passarinho" : species || "Outro"
  return (
    <div className="pet-type-label">
      <Icon name={speciesIcon(species)} size={22} />
      <span>{displayName}</span>
    </div>
  )
}

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

function isIdentifierInUse(code: string, excludedPetId?: string) {
  const normalized = code.trim().toUpperCase()
  return store
    .pets()
    .some(
      (pet) =>
        pet.id !== excludedPetId &&
        pet.identifierCode?.trim().toUpperCase() === normalized,
    )
}

function PhotoField({
  petName,
  photo,
  onChange,
}: {
  petName: string
  photo: string
  onChange: (photo: string) => void
}) {
  const [error, setError] = useState("")
  const handleFile = (file?: File) => {
    setError("")
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Escolha um arquivo de imagem, como JPG ou PNG.")
      return
    }
    if (file.size > 1_500_000) {
      setError("A imagem deve ter no máximo 1,5 MB. Escolha uma foto menor.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(String(reader.result))
    reader.onerror = () =>
      setError("Não foi possível abrir a imagem. Escolha outra foto.")
    reader.readAsDataURL(file)
  }
  return (
    <div className="field photo-field">
      <label htmlFor="pet-photo">
        Foto do pet <span className="optional-label">(opcional)</span>
      </label>
      <input
        id="pet-photo"
        type="file"
        accept="image/*"
        onChange={(event) => handleFile(event.target.files?.[0])}
        aria-describedby={error ? "pet-photo-error" : "pet-photo-hint"}
      />
      <small id="pet-photo-hint">JPG ou PNG de até 1,5 MB.</small>
      {error && (
        <p id="pet-photo-error" className="field-error" role="alert">
          {error}
        </p>
      )}
      {photo && (
        <div className="photo-preview">
          <img
            src={photo}
            alt={`Pré-visualização da foto de ${petName || "seu pet"}`}
          />
          <button
            className="button secondary"
            type="button"
            onClick={() => onChange("")}
          >
            Remover foto
          </button>
        </div>
      )}
    </div>
  )
}

function PetIdentification({
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

function Home() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Icon name="heart" size={17} /> Cuidado que aproxima
            </span>
            <h1>
              Seu pet seguro.
              <br />
              <span>Sua família tranquila.</span>
            </h1>
            <p>
              Proteja seu pet com um QR code ou código de identificação. Se ele
              se perder, quem o encontrar poderá acessar os dados do animal e
              seus contatos de forma rápida e segura. Seus demais dados pessoais
              permanecem privados.
            </p>
          </div>
          <div className="hero-art">
            <div className="sun" aria-hidden="true" />
            <div
              className="map-pin"
              role="img"
              aria-label="Ícone de localização dos pets"
            >
              <Icon name="pin" size={54} />
            </div>
            <div
              className="pet-card dog"
              role="img"
              aria-label="Ilustração de Cacau, um cachorro cadastrado"
            >
              <span className="pet-ears" aria-hidden="true">
                ⌒
              </span>
              <Icon name="dog" size={55} />
              <strong aria-hidden="true">Cacau</strong>
              <small aria-hidden="true">Cachorro</small>
            </div>
            <div
              className="pet-card cat"
              role="img"
              aria-label="Ilustração de Luna, uma gata cadastrada"
            >
              <span className="pet-ears" aria-hidden="true">
                △
              </span>
              <Icon name="cat" size={52} />
              <strong aria-hidden="true">Luna</strong>
              <small aria-hidden="true">Gato</small>
            </div>
            <div className="found-pill">
              <span aria-hidden="true">
                <Icon name="check" size={18} />
              </span>
              <div>
                <strong>Local registrado</strong>
                <small>Há poucos minutos</small>
              </div>
            </div>
          </div>
        </section>
        <section className="feature-strip" aria-label="Benefícios do PetLocal">
          <div className="features">
            <article>
              <span className="feature-icon green">
                <Icon name="paw" />
              </span>
              <h3>Pets organizados</h3>
              <p>
                Cadastre e mantenha as informações dos seus pets atualizadas.
              </p>
            </article>
            <article>
              <span className="feature-icon blue">
                <Icon name="shield" />
              </span>
              <h3>Código ou QR de identificação</h3>
              <p>
                Identifique cada pet para facilitar o contato se ele for
                encontrado.
              </p>
            </article>
            <article>
              <span className="feature-icon yellow">
                <Icon name="mail" />
              </span>
              <h3>Dono avisado rápido</h3>
              <p>
                Quem encontrar o animal vê como falar com o tutor rapidamente.
              </p>
            </article>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-security">
          <Icon name="shield" size={20} />
          <span>A conexão com este site é segura.</span>
        </div>
        <span>PetLocal · Feito para tutores que cuidam</span>
      </footer>
    </>
  )
}

function FoundPetAccess({
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

  const acceptCode = (event: FormEvent) => {
    event.preventDefault()
    setCameraStatus("")
    lookupPet(code)
  }

  return (
    <>
      {showHeader && <PublicHeader />}
      <main className="found-page">
        <button
          className="back-link"
          onClick={() => navigate(store.session() ? "dashboard" : "home")}
        >
          ← Voltar para a tela inicial
        </button>
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
          <div className="search-options" role="tablist" aria-label="Forma de identificar o pet">
            <button
              className={mode === "code" ? "active" : ""}
              role="tab"
              aria-selected={mode === "code"}
              aria-controls="code-panel"
              onClick={chooseCode}
            >
              Digitar código
            </button>
            <button
              className={mode === "camera" ? "active" : ""}
              role="tab"
              aria-selected={mode === "camera"}
              aria-controls="camera-panel"
              onClick={() => {
                stopCamera()
                setMode("camera")
                setCameraError("")
                setCameraStatus("")
              }}
            >
              Ler QR code
            </button>
          </div>
          {mode === "code" ? (
            <div id="code-panel" role="tabpanel">
              <form className="found-code-form" onSubmit={acceptCode}>
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
            <div id="camera-panel" className="camera-panel" role="tabpanel">
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
                <h2 id="found-pet-name">{result.pet.name}</h2>
                <PetTypeLabel species={result.pet.species} />
                <dl>
                  <div><dt>Espécie</dt><dd>{result.pet.species}</dd></div>
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
                </div>
              </div>
            </article>
          )}
        </section>
      </main>
    </>
  )
}

function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <>
    <PublicHeader />
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-illustration">
          <span>
            <Icon name="heart" size={35} />
          </span>
          <Icon name="paw" size={92} />
        </div>
        <h2>
          Cuidado e segurança
          <br />
          em cada passo.
        </h2>
        <p>
          Um espaço simples para manter as informações do seu melhor amigo
          sempre por perto.
        </p>
      </div>
      <main className="auth-main">
        <button className="back-link" onClick={() => navigate("home")}>
          ← Voltar para o início
        </button>
        <div className="auth-card">
          <div className="auth-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
    </>
  )
}

function Register({ onDraft }: { onDraft: (draft: RegisterDraft) => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  })
  const [error, setError] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (form.name.trim().split(/\s+/).length < 2)
      return setError("Informe seu nome e sobrenome.")
    if (store.users().some((user) => user.email === normalizeEmail(form.email)))
      return setError(
        "Este e-mail já está cadastrado. Tente entrar na sua conta.",
      )
    if (
      form.password.length < 8 ||
      !/[A-Za-z]/.test(form.password) ||
      !/\d/.test(form.password)
    )
      return setError(
        "A senha deve ter ao menos 8 caracteres, com letras e números.",
      )
    if (form.password !== form.confirm)
      return setError("As senhas não coincidem. Digite novamente.")
    onDraft({
      name: form.name.trim(),
      email: normalizeEmail(form.email),
      phone: form.phone.trim(),
      password: form.password,
    })
    navigate("onboarding")
  }
  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Primeiro, conte um pouco sobre você."
    >
      <div className="steps" aria-label="Etapa 1 de 2">
        <span className="active">1</span>
        <i />
        <span>2</span>
        <small>Conta</small>
        <small>Você e seu pet</small>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      )}
      <form onSubmit={submit}>
        <Field
          label="Nome completo"
          name="name"
          required
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          autoComplete="name"
          placeholder="Como você quer ser chamado?"
        />
        <Field
          label="E-mail"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Telefone"
          name="phone"
          type="tel"
          required
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          autoComplete="tel"
          placeholder="(00) 00000-0000"
        />
        <div className="form-grid">
          <Field
            label="Senha"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            autoComplete="new-password"
            minLength={8}
            hint="Mínimo de 8 caracteres, com letras e números."
          />
          <Field
            label="Confirmar senha"
            name="confirm"
            type="password"
            required
            value={form.confirm}
            onChange={(confirm) => setForm({ ...form, confirm })}
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        <button className="button full" type="submit">
          Continuar <Icon name="arrow" />
        </button>
      </form>
      <p className="auth-switch">
        Já tem uma conta?{" "}
        <button onClick={() => navigate("login")}>Entrar</button>
      </p>
    </AuthLayout>
  )
}

function Onboarding({
  draft,
  onComplete,
}: {
  draft: RegisterDraft | null
  onComplete: (user: User) => void
}) {
  const [form, setForm] = useState({
    city: "",
    state: "",
    reference: "",
    petName: "",
    species: "",
    breed: "",
    age: "",
    sex: "",
    color: "",
    notes: "",
    photo: "",
    hasChip: "" as ChipChoice,
    identifierCode: "",
  })
  const [error, setError] = useState("")
  const [codeError, setCodeError] = useState("")
  const [saving, setSaving] = useState(false)
  if (!draft) {
    return (
      <AuthLayout
        title="Cadastro incompleto"
        subtitle="Seus dados não foram mantidos após a atualização da página."
      >
        <button className="button full" onClick={() => navigate("register")}>
          Voltar ao cadastro
        </button>
      </AuthLayout>
    )
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setCodeError("")
    if (
      !form.city.trim() ||
      !form.state ||
      !form.petName.trim() ||
      !form.species
    )
      return setError("Preencha os campos obrigatórios para continuar.")
    if (!form.hasChip || !form.identifierCode.trim()) {
      setCodeError(
        form.hasChip === "no"
          ? 'Clique em "Gerar código" para identificar seu pet.'
          : "Informe se o pet tem chip e preencha o código de identificação.",
      )
      return
    }
    if (isIdentifierInUse(form.identifierCode)) {
      setCodeError(
        "Este código já está cadastrado. Confira o número ou gere outro.",
      )
      return
    }
    setSaving(true)
    try {
      const { hash, salt } = await hashPassword(draft.password)
      const user: User = {
        id: makeId(),
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        passwordHash: hash,
        salt,
        city: form.city.trim(),
        state: form.state,
        reference: form.reference.trim(),
        createdAt: new Date().toISOString(),
      }
      const pet: Pet = {
        id: makeId(),
        userId: user.id,
        name: form.petName.trim(),
        species: form.species,
        breed: form.breed.trim(),
        age: form.age,
        sex: form.sex,
        color: form.color.trim(),
        notes: form.notes.trim(),
        photo: form.photo,
        hasChip: form.hasChip === "yes",
        identifierCode: form.identifierCode.trim().toUpperCase(),
        createdAt: new Date().toISOString(),
      }
      store.saveUser(user)
      store.savePet(pet)
      store.setSession(user.id)
      onComplete(user)
    } catch {
      setError(
        "Não foi possível proteger sua senha neste navegador. Tente novamente.",
      )
    } finally {
      setSaving(false)
    }
  }
  return (
    <AuthLayout
      title="Você e seu primeiro pet"
      subtitle="Essas informações podem ser alteradas depois."
    >
      <div className="steps" aria-label="Etapa 2 de 2">
        <span className="done">✓</span>
        <i className="done" />
        <span className="active">2</span>
        <small>Conta</small>
        <small>Você e seu pet</small>
      </div>
      {error && (
        <p className="inline-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      )}
      <form className="pet-onboarding-form" onSubmit={submit}>
        <fieldset>
          <legend>Onde vocês moram?</legend>
          <div className="form-grid">
            <SelectField
              label="Estado"
              name="state"
              value={form.state}
              onChange={(state) => setForm({ ...form, state, city: "" })}
            >
              <option value="">Selecione</option>
              {states.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </SelectField>
            <CityCombobox
              state={form.state}
              value={form.city}
              onChange={(city) => setForm({ ...form, city })}
              name="onboarding"
            />
          </div>
          <Field
            label="Ponto de referência (opcional)"
            name="reference"
            value={form.reference}
            onChange={(reference) => setForm({ ...form, reference })}
            placeholder="Ex.: próximo à praça central"
          />
        </fieldset>
        <fieldset>
          <legend>Dados do seu pet</legend>
          <div className="form-grid">
            <Field
              label="Nome do pet"
              name="petName"
              required
              value={form.petName}
              onChange={(petName) => setForm({ ...form, petName })}
            />
            <SpeciesField
              name="first-pet-species"
              value={form.species}
              onChange={(species) => setForm({ ...form, species })}
            />
            <Field
              label="Raça (opcional)"
              name="breed"
              value={form.breed}
              onChange={(breed) => setForm({ ...form, breed })}
              placeholder="Sem raça definida"
            />
            <Field
              label="Idade (opcional)"
              name="age"
              value={form.age}
              onChange={(age) => setForm({ ...form, age })}
              placeholder="Ex.: 3 anos"
            />
            <SelectField
              label="Sexo (opcional)"
              name="first-pet-sex"
              value={form.sex}
              onChange={(sex) => setForm({ ...form, sex })}
              required={false}
            >
              <option value="">Não informar</option>
              <option>Macho</option>
              <option>Fêmea</option>
            </SelectField>
            <Field
              label="Cor predominante (opcional)"
              name="first-pet-color"
              value={form.color}
              onChange={(color) => setForm({ ...form, color })}
              placeholder="Ex.: caramelo e branco"
            />
          </div>
          <PhotoField
            petName={form.petName}
            photo={form.photo}
            onChange={(photo) => setForm({ ...form, photo })}
          />
        </fieldset>
        <PetIdentification
          petName={form.petName}
          hasChip={form.hasChip}
          code={form.identifierCode}
          error={codeError}
          onHasChipChange={(hasChip) =>
            setForm({ ...form, hasChip, identifierCode: "" })
          }
          onCodeChange={(identifierCode) => {
            setCodeError("")
            setForm({ ...form, identifierCode })
          }}
        />
        <button className="button full" type="submit" disabled={saving}>
          {saving ? "Criando conta…" : "Concluir cadastro"}{" "}
          <Icon name="check" />
        </button>
      </form>
    </AuthLayout>
  )
}

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setBusy(true)
    await ensureDemoData()
    const user = store
      .users()
      .find((item) => item.email === normalizeEmail(email))
    if (!user) {
      setBusy(false)
      return setError(
        "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      )
    }
    const { hash } = await hashPassword(password, user.salt)
    setBusy(false)
    if (hash !== user.passwordHash)
      return setError(
        "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      )
    store.setSession(user.id)
    onLogin(user)
  }
  return (
    <AuthLayout
      title="Que bom ter você de volta"
      subtitle="Entre para acessar os dados dos seus pets."
    >
      {error && (
        <p className="inline-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      )}
      <form onSubmit={submit}>
        <Field
          label="E-mail"
          name="login-email"
          type="email"
          required
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Senha"
          name="login-password"
          type="password"
          required
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <button
          className="forgot-link"
          type="button"
          onClick={() => navigate("forgot")}
        >
          Esqueci minha senha
        </button>
        <button className="button full" type="submit" disabled={busy}>
          {busy ? "Entrando…" : "Entrar"} <Icon name="arrow" />
        </button>
      </form>
      <p className="auth-switch">
        Ainda não tem conta?{" "}
        <button onClick={() => navigate("register")}>Criar conta</button>
      </p>
    </AuthLayout>
  )
}

function Forgot() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Esta é uma demonstração: nenhum e-mail será enviado."
    >
      {sent ? (
        <div className="success-panel" role="status">
          <span>
            <Icon name="mail" size={30} />
          </span>
          <h2>Solicitação demonstrada</h2>
          <p>
            Se existisse uma conta para <strong>{email}</strong>, as instruções
            apareceriam no e-mail. Neste protótipo local, nenhum envio é
            realizado.
          </p>
          <button className="button full" onClick={() => navigate("login")}>
            Voltar para entrar
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setSent(true)
          }}
        >
          <Field
            label="E-mail cadastrado"
            name="recovery-email"
            type="email"
            required
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="voce@exemplo.com"
          />
          <p className="info-box">
            <Icon name="shield" size={20} /> Por segurança, não informamos se o
            e-mail está cadastrado.
          </p>
          <button className="button full" type="submit">
            Demonstrar recuperação <Icon name="arrow" />
          </button>
        </form>
      )}
    </AuthLayout>
  )
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}

function Dashboard({
  user,
  pets,
  locations,
}: {
  user: User
  pets: Pet[]
  locations: LocationRecord[]
}) {
  const latest = [...locations].sort((a, b) =>
    b.seenAt.localeCompare(a.seenAt),
  )[0]
  return (
    <div className="page">
      <PageHeading
        eyebrow="PAINEL PRINCIPAL"
        title={`Olá, ${user.name.split(" ")[0]}!`}
        description="Como estão seus companheiros hoje?"
        action={
          <button className="button" onClick={() => navigate("pet-form")}>
            <Icon name="plus" /> Cadastrar pet
          </button>
        }
      />
      <section className="summary-grid" aria-label="Resumo da conta">
        <article className="summary-card green-card">
          <span>
            <Icon name="pets" />
          </span>
          <div>
            <strong>{pets.length}</strong>
            <p>{pets.length === 1 ? "pet cadastrado" : "pets cadastrados"}</p>
          </div>
          <button onClick={() => navigate("pets")} aria-label="Ver meus pets">
            <Icon name="arrow" />
          </button>
        </article>
        <article className="summary-card blue-card">
          <span>
            <Icon name="alert-sign" />
          </span>
          <div>
            <strong>{locations.length}</strong>
            <p>
              {locations.length === 1
                ? "aviso recebido"
                : "avisos recebidos"}
            </p>
          </div>
          <button
            onClick={() => navigate("location")}
            aria-label="Ver avisos"
          >
            <Icon name="arrow" />
          </button>
        </article>
      </section>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <span>SEUS COMPANHEIROS</span>
              <h2>Meus pets</h2>
            </div>
            <button onClick={() => navigate("pets")}>
              Ver todos <Icon name="arrow" size={18} />
            </button>
          </div>
          {pets.length ? (
            <div className="mini-pets">
              {pets.slice(0, 3).map((pet, index) => (
                <button key={pet.id} onClick={() => navigate("pets")}>
                  <span className={`pet-avatar color-${index % 3}`}>
                    <Icon
                      name={speciesIcon(pet.species)}
                      size={29}
                    />
                  </span>
                  <div>
                    <strong>{pet.name}</strong>
                    <small>
                      {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ""}
                    </small>
                  </div>
                  <Icon name="arrow" size={18} />
                </button>
              ))}
            </div>
          ) : (
            <Empty
              icon="pets"
              title="Nenhum pet cadastrado"
              text="Cadastre seu primeiro companheiro."
              action="Cadastrar pet"
              onAction={() => navigate("pet-form")}
            />
          )}
        </section>
        <section className="panel activity-panel">
          <div className="panel-title">
            <div>
              <span>ATIVIDADE RECENTE</span>
              <h2>Último aviso</h2>
            </div>
          </div>
          {latest ? (
            <div className="latest-location">
              <span>
                <Icon name="pin" />
              </span>
              <div>
                <strong>
                  {pets.find((pet) => pet.id === latest.petId)?.name ?? "Pet"}
                </strong>
                <p>
                  {latest.city} – {latest.state}
                </p>
                <small>
                  {latest.reference || "Sem ponto de referência"} ·{" "}
                  {formatDate(latest.seenAt)}
                </small>
              </div>
            </div>
          ) : (
            <div className="dashboard-empty">
              <Icon name="alert-sign" size={34} />
              <strong>Nenhum aviso por enquanto.</strong>
            </div>
          )}
          <div className="tip">
            <Icon name="heart" />
            <p>
              <strong>Dica de cuidado</strong>Mantenha os dados do seu pet
              sempre atualizados.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Empty({
  icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: "pets" | "pin"
  title: string
  text: string
  action: string
  onAction: () => void
}) {
  return (
    <div className="empty">
      <span>
        <Icon name={icon} size={34} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
      <button className="text-link" onClick={onAction}>
        {action} <Icon name="arrow" size={17} />
      </button>
    </div>
  )
}

function PetsPage({
  pets,
  onEdit,
  onDelete,
  onUpdatePet,
}: {
  pets: Pet[]
  onEdit: (pet: Pet) => void
  onDelete: (pet: Pet) => void
  onUpdatePet: (pet: Pet) => void
}) {
  const [missingPet, setMissingPet] = useState<Pet | null>(null)
  return (
    <>
    <div className="page">
      <PageHeading
        eyebrow="MEUS PETS"
        title="Seus companheiros"
        description="Consulte, edite ou cadastre os animais da sua família."
        action={
          <button className="button" onClick={() => navigate("pet-form")}>
            <Icon name="plus" /> Novo pet
          </button>
        }
      />
      {pets.length ? (
        <div className="pet-grid">
          {pets.map((pet, index) => (
            <article className="pet-card-full" key={pet.id}>
              <div className={`pet-banner banner-${index % 3}`}>
                {pet.photo ? (
                  <img
                    src={pet.photo}
                    alt={`Foto do pet ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`.trim()}
                  />
                ) : <span>
                  <Icon
                    name={speciesIcon(pet.species)}
                    size={68}
                  />
                </span>}
                {pet.missing && <strong className="missing-badge">Desaparecido</strong>}
              </div>
              <div className="pet-content">
                <div className="pet-identity">
                  <div>
                    <span>Nome</span>
                    <strong>{pet.name}</strong>
                  </div>
                  <div>
                    <span>Tipo</span>
                    <PetTypeLabel species={pet.species} />
                  </div>
                </div>
                <p className="pet-breed">{pet.breed || "Sem raça informada"}</p>
                <dl>
                  <div>
                    <dt>Idade</dt>
                    <dd>{pet.age || "Não informada"}</dd>
                  </div>
                  <div>
                    <dt>Sexo</dt>
                    <dd>{pet.sex || "Não informado"}</dd>
                  </div>
                  <div>
                    <dt>Cor</dt>
                    <dd>{pet.color || "Não informada"}</dd>
                  </div>
                </dl>
                <div className="card-actions">
                  <button
                    className="button secondary"
                    onClick={() => onEdit(pet)}
                  >
                    <Icon name="edit" size={18} /> Editar
                  </button>
                  <button
                    className="button danger-ghost"
                    onClick={() => onDelete(pet)}
                  >
                    <Icon name="trash" size={18} /> Excluir
                  </button>
                  {pet.missing ? (
                    <button
                      className="button found-button"
                      onClick={() => onUpdatePet({ ...pet, missing: undefined })}
                    >
                      <Icon name="check" size={18} /> Marcar como encontrado
                    </button>
                  ) : (
                    <button
                      className="button warning-button"
                      onClick={() => setMissingPet(pet)}
                    >
                      <Icon name="warning" size={18} /> Marcar como desaparecido
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <Empty
            icon="pets"
            title="Sua lista está vazia"
            text="Cadastre seu primeiro pet para começar."
            action="Cadastrar pet"
            onAction={() => navigate("pet-form")}
          />
        </div>
      )}
    </div>
    {missingPet && (
      <MissingPetDialog
        pet={missingPet}
        onCancel={() => setMissingPet(null)}
        onConfirm={(missing) => {
          onUpdatePet({ ...missingPet, missing })
          setMissingPet(null)
        }}
      />
    )}
    </>
  )
}

function MissingPetDialog({
  pet,
  onCancel,
  onConfirm,
}: {
  pet: Pet
  onCancel: () => void
  onConfirm: (missing: NonNullable<Pet["missing"]>) => void
}) {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const [form, setForm] = useState({
    state: "",
    city: "",
    reference: "",
    seenAt: now.toISOString().slice(0, 16),
    notes: "",
  })
  const [error, setError] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.state || !form.city.trim() || !form.seenAt) {
      setError("Informe o estado, a cidade e a data em que o pet foi visto pela última vez.")
      return
    }
    onConfirm({
      city: form.city.trim(),
      state: form.state,
      reference: form.reference.trim(),
      seenAt: new Date(form.seenAt).toISOString(),
      notes: form.notes.trim(),
    })
  }
  return (
    <div className="modal-backdrop">
      <form
        className="modal missing-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="missing-title"
        onSubmit={submit}
      >
        <h2 id="missing-title">Criar aviso “Procura-se” para {pet.name}</h2>
        <p>Informe onde e quando ele foi visto pela última vez.</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <SelectField label="Estado" name="missing-state" value={form.state} onChange={(state) => setForm({ ...form, state, city: "" })}>
          <option value="">Selecione</option>
          {states.map((state) => <option key={state}>{state}</option>)}
        </SelectField>
        <CityCombobox state={form.state} value={form.city} onChange={(city) => setForm({ ...form, city })} name="missing" label="Cidade do último local visto" />
        <Field label="Ponto de referência (opcional)" name="missing-reference" value={form.reference} onChange={(reference) => setForm({ ...form, reference })} />
        <Field label="Data e hora" name="missing-date" type="datetime-local" required value={form.seenAt} onChange={(seenAt) => setForm({ ...form, seenAt })} />
        <div className="field">
          <label htmlFor="missing-notes">Observação (opcional)</label>
          <textarea id="missing-notes" rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onCancel}>Cancelar</button>
          <button className="button" type="submit">Confirmar Procura-se</button>
        </div>
      </form>
    </div>
  )
}

function PetForm({
  existing,
  userId,
  onSave,
  onCancel,
}: {
  existing: Pet | null
  userId: string
  onSave: (pet: Pet) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    species: existing?.species ?? "",
    breed: existing?.breed ?? "",
    age: existing?.age ?? "",
    sex: existing?.sex ?? "",
    color: existing?.color ?? "",
    notes: existing?.notes ?? "",
    photo: existing?.photo ?? "",
    hasChip:
      existing?.hasChip === true
        ? ("yes" as ChipChoice)
        : existing?.hasChip === false
          ? ("no" as ChipChoice)
          : ("" as ChipChoice),
    identifierCode: existing?.identifierCode ?? "",
  })
  const [error, setError] = useState("")
  const [codeError, setCodeError] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setCodeError("")
    if (!form.name.trim() || !form.species)
      return setError("Informe pelo menos o nome e a espécie do pet.")
    if (!form.hasChip || !form.identifierCode.trim()) {
      setCodeError(
        form.hasChip === "no"
          ? 'Clique em "Gerar código" para identificar seu pet.'
          : "Informe se o pet tem chip e preencha o código de identificação.",
      )
      return
    }
    if (isIdentifierInUse(form.identifierCode, existing?.id)) {
      setCodeError(
        "Este código já está cadastrado. Confira o número ou gere outro.",
      )
      return
    }
    onSave({
      id: existing?.id ?? makeId(),
      userId,
      ...form,
      name: form.name.trim(),
      hasChip: form.hasChip === "yes",
      identifierCode: form.identifierCode.trim().toUpperCase(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    })
  }
  return (
    <div className="page narrow-page">
      <button className="back-link" onClick={onCancel}>
        ← Voltar para meus pets
      </button>
      <PageHeading
        eyebrow={existing ? "EDITAR PET" : "NOVO PET"}
        title={existing ? `Atualizar ${existing.name}` : "Cadastrar um pet"}
        description="Campos com asterisco são obrigatórios."
      />
      <form className="panel form-panel pet-editor-form" onSubmit={submit}>
        {error && (
          <p className="inline-error" role="alert">
            <Icon name="warning" size={18} /> {error}
          </p>
        )}
        <div className="form-grid">
          <Field
            label="Nome do pet"
            name="pet-name"
            required
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
          />
          <SpeciesField
            name="pet-species"
            value={form.species}
            onChange={(species) => setForm({ ...form, species })}
          />
          <Field
            label="Raça (opcional)"
            name="pet-breed"
            value={form.breed}
            onChange={(breed) => setForm({ ...form, breed })}
            placeholder="Ex.: vira-lata"
          />
          <Field
            label="Idade (opcional)"
            name="pet-age"
            value={form.age}
            onChange={(age) => setForm({ ...form, age })}
            placeholder="Ex.: 3 anos"
          />
          <SelectField
            label="Sexo (opcional)"
            name="pet-sex"
            value={form.sex}
            onChange={(sex) => setForm({ ...form, sex })}
            required={false}
          >
            <option value="">Não informar</option>
            <option>Fêmea</option>
            <option>Macho</option>
          </SelectField>
          <Field
            label="Cor predominante (opcional)"
            name="pet-color"
            value={form.color}
            onChange={(color) => setForm({ ...form, color })}
          />
        </div>
        <div className="field">
          <label htmlFor="pet-notes">
            Observações <span className="optional-label">(opcional)</span>
          </label>
          <textarea
            id="pet-notes"
            value={form.notes}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
            placeholder="Características importantes, cuidados ou identificação"
            rows={4}
          />
        </div>
        <PhotoField
          petName={form.name}
          photo={form.photo}
          onChange={(photo) => setForm({ ...form, photo })}
        />
        <PetIdentification
          petName={form.name}
          hasChip={form.hasChip}
          code={form.identifierCode}
          error={codeError}
          locked={Boolean(existing?.identifierCode)}
          onHasChipChange={(hasChip) =>
            setForm({ ...form, hasChip, identifierCode: "" })
          }
          onCodeChange={(identifierCode) => {
            setCodeError("")
            setForm({ ...form, identifierCode })
          }}
        />
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="button" type="submit">
            <Icon name="check" /> Salvar pet
          </button>
        </div>
      </form>
    </div>
  )
}

function LocationPage({
  pets,
  locations,
  user,
  onSave,
}: {
  pets: Pet[]
  locations: LocationRecord[]
  user: User
  onSave: (location: LocationRecord) => void
}) {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const [form, setForm] = useState({
    petId: pets[0]?.id ?? "",
    city: user.city,
    state: user.state,
    reference: "",
    seenAt: now.toISOString().slice(0, 16),
    details: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  })
  const [gpsStatus, setGpsStatus] = useState("")
  const [error, setError] = useState("")
  const getGps = () => {
    setGpsStatus("Solicitando autorização do navegador…")
    if (!navigator.geolocation)
      return setGpsStatus("O GPS não está disponível neste navegador.")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGpsStatus(
          "Coordenadas obtidas. Complete cidade, estado e referência para facilitar a compreensão.",
        )
      },
      (error) =>
        setGpsStatus(
          error.code === 1
            ? "Permissão de localização não concedida. Você pode preencher o local manualmente."
            : "Não foi possível obter o GPS. Preencha o local manualmente.",
        ),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!form.petId || !form.city.trim() || !form.state || !form.seenAt)
      return setError(
        "Escolha o pet e informe cidade, estado e data do avistamento.",
      )
    onSave({
      id: makeId(),
      userId: user.id,
      ...form,
      city: form.city.trim(),
      reference: form.reference.trim(),
      seenAt: new Date(form.seenAt).toISOString(),
      createdAt: new Date().toISOString(),
    })
    setForm({
      ...form,
      reference: "",
      details: "",
      latitude: undefined,
      longitude: undefined,
      seenAt: now.toISOString().slice(0, 16),
    })
    setGpsStatus("")
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="LOCALIZAÇÃO"
        title="Avisar o dono"
        description="Salve um ponto informado por você ou use o GPS com sua autorização."
      />
      <div className="location-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="info-box important">
            <Icon name="warning" size={20} />
            <p>
              <strong>Importante:</strong> o PetLocal registra locais pontuais.
              Não realiza rastreamento em tempo real.
            </p>
          </div>
          {error && (
            <p className="inline-error" role="alert">
              <Icon name="warning" size={18} /> {error}
            </p>
          )}
          {pets.length ? (
            <>
              <SelectField
                label="Qual pet foi visto?"
                name="location-pet"
                value={form.petId}
                onChange={(petId) => setForm({ ...form, petId })}
              >
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} · {pet.species}
                  </option>
                ))}
              </SelectField>
              <div className="gps-box">
                <div>
                  <span>
                    <Icon name="gps" />
                  </span>
                  <div>
                    <strong>Usar minha localização atual</strong>
                    <p>O navegador pedirá sua permissão.</p>
                  </div>
                </div>
                <button
                  className="button secondary"
                  type="button"
                  onClick={getGps}
                >
                  Obter por GPS
                </button>
              </div>
              {gpsStatus && (
                <p className="gps-status" role="status">
                  {gpsStatus}
                </p>
              )}
              {form.latitude !== undefined && (
                <p className="coordinates">
                  Coordenadas: {form.latitude.toFixed(5)},{" "}
                  {form.longitude?.toFixed(5)}
                </p>
              )}
              <div className="divider">
                <span>LOCAL INFORMADO</span>
              </div>
              <div className="form-grid">
                <Field
                  label="Cidade"
                  name="location-city"
                  required
                  value={form.city}
                  onChange={(city) => setForm({ ...form, city })}
                />
                <SelectField
                  label="Estado"
                  name="location-state"
                  value={form.state}
                  onChange={(state) => setForm({ ...form, state })}
                >
                  <option value="">Selecione</option>
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </SelectField>
              </div>
              <Field
                label="Ponto de referência"
                name="location-reference"
                value={form.reference}
                onChange={(reference) => setForm({ ...form, reference })}
                placeholder="Ex.: em frente à padaria, portão azul"
              />
              <Field
                label="Data e hora em que foi visto"
                name="seenAt"
                type="datetime-local"
                required
                value={form.seenAt}
                onChange={(seenAt) => setForm({ ...form, seenAt })}
              />
              <div className="field">
                <label htmlFor="location-details">
                  Como o animal foi visto?
                </label>
                <textarea
                  id="location-details"
                  rows={3}
                  value={form.details}
                  onChange={(event) =>
                    setForm({ ...form, details: event.target.value })
                  }
                  placeholder="Ex.: estava com coleira, seguindo em direção à praça"
                />
              </div>
              <button className="button full" type="submit">
                <Icon name="pin" /> Enviar aviso
              </button>
            </>
          ) : (
            <Empty
              icon="pets"
              title="Cadastre um pet primeiro"
              text="É necessário escolher um animal para registrar um local."
              action="Cadastrar pet"
              onAction={() => navigate("pet-form")}
            />
          )}
        </form>
        <section className="panel history-panel">
          <div className="panel-title">
            <div>
              <span>HISTÓRICO</span>
              <h2>Locais registrados</h2>
            </div>
          </div>
          {locations.length ? (
            <ol className="timeline">
              {[...locations]
                .sort((a, b) => b.seenAt.localeCompare(a.seenAt))
                .map((location) => (
                  <li key={location.id}>
                    <span>
                      <Icon name="pin" size={19} />
                    </span>
                    <div>
                      <strong>
                        {pets.find((pet) => pet.id === location.petId)?.name ??
                          "Pet"}
                      </strong>
                      <p>
                        {location.city} – {location.state}
                      </p>
                      {location.reference && (
                        <small>{location.reference}</small>
                      )}
                      <time>{formatDate(location.seenAt)}</time>
                      {location.details && (
                        <blockquote>{location.details}</blockquote>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          ) : (
            <Empty
              icon="pin"
              title="Nenhum registro ainda"
              text="Os locais salvos aparecerão aqui."
              action="Preencher formulário"
              onAction={() =>
                document
                  .querySelector("form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />
          )}
        </section>
      </div>
    </div>
  )
}

function AlertOwnerForm({
  pet,
  onSave,
  showHeader = true,
}: {
  pet: Pet | null
  onSave: (location: LocationRecord) => void
  showHeader?: boolean
}) {
  const owner = pet ? store.users().find((item) => item.id === pet.userId) : null
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const [form, setForm] = useState({
    city: "",
    state: "",
    reference: "",
    seenAt: now.toISOString().slice(0, 16),
    details: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  })
  const [error, setError] = useState("")
  const [gpsStatus, setGpsStatus] = useState("")
  const [sent, setSent] = useState(false)
  const getGps = () => {
    setGpsStatus("Solicitando autorização do navegador…")
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setForm({
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGpsStatus("Localização obtida. Informe também a cidade e o estado.")
      },
      () =>
        setGpsStatus(
          "Não foi possível usar sua localização. Preencha o local manualmente.",
        ),
    )
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!pet || !owner || !form.city.trim() || !form.state || !form.seenAt) {
      setError("Informe cidade, estado e data para enviar o aviso.")
      return
    }
    onSave({
      id: makeId(),
      userId: owner.id,
      petId: pet.id,
      ...form,
      city: form.city.trim(),
      reference: form.reference.trim(),
      details: form.details.trim(),
      seenAt: new Date(form.seenAt).toISOString(),
      createdAt: new Date().toISOString(),
    })
    setSent(true)
  }
  return (
    <>
      {showHeader && <PublicHeader />}
      <main className="found-page">
        <div className="page-back-actions">
          <button className="back-link" onClick={() => navigate("found")}>
            ← Voltar para a busca
          </button>
          <button
            className="back-link"
            onClick={() => navigate(store.session() ? "dashboard" : "home")}
          >
            <Icon name="home" size={19} /> Voltar para a tela inicial
          </button>
        </div>
        <section className="found-access-card">
          {!pet || !owner ? (
            <div className="empty-state-simple">
              <h1>Pet não selecionado</h1>
              <p>Volte à busca e escolha o pet que você encontrou.</p>
              <button className="button" onClick={() => navigate("found")}>
                Buscar pet
              </button>
            </div>
          ) : sent ? (
            <div className="success-panel" role="status">
              <span><Icon name="check" size={30} /></span>
              <h1>Aviso enviado com sucesso</h1>
              <p>O dono de {pet.name} poderá consultar o local e as informações que você enviou.</p>
            </div>
          ) : (
            <>
              <div className="selected-pet-summary">
                {pet.photo ? (
                  <img
                    src={pet.photo}
                    alt={`Foto do pet ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`.trim()}
                  />
                ) : (
                  <span aria-hidden="true">
                    <Icon name={speciesIcon(pet.species)} size={32} />
                  </span>
                )}
                <div>
                  <span>Pet selecionado</span>
                  <strong>{pet.name}</strong>
                  <p>{pet.species}</p>
                </div>
              </div>
              <div className="found-access-heading">
                <span>AVISAR O DONO</span>
                <h1>Onde você viu {pet.name}?</h1>
                <p>Informe o local para ajudar {owner.name} a encontrar o pet.</p>
              </div>
              <form className="form-panel public-alert-form" onSubmit={submit}>
                {error && <p className="inline-error" role="alert">{error}</p>}
                <div className="form-grid">
                  <SelectField label="Estado" name="alert-state" value={form.state} onChange={(state) => setForm({ ...form, state, city: "" })}>
                    <option value="">Selecione</option>
                    {states.map((state) => <option key={state}>{state}</option>)}
                  </SelectField>
                  <CityCombobox state={form.state} value={form.city} onChange={(city) => setForm({ ...form, city })} name="alert" />
                </div>
                <Field label="Ponto de referência (opcional)" name="alert-reference" value={form.reference} onChange={(reference) => setForm({ ...form, reference })} placeholder="Ex.: em frente à padaria" />
                <button className="button secondary gps-public-button" type="button" onClick={getGps}>
                  <Icon name="gps" /> Usar minha localização
                </button>
                {gpsStatus && <p className="gps-status" role="status">{gpsStatus}</p>}
                <Field label="Data e hora" name="alert-seen-at" type="datetime-local" required value={form.seenAt} onChange={(seenAt) => setForm({ ...form, seenAt })} />
                <div className="field">
                  <label htmlFor="alert-details">Como o pet está? <span className="optional-label">(opcional)</span></label>
                  <textarea id="alert-details" rows={4} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} placeholder="Ex.: está seguro comigo e parece bem" />
                </div>
                <button className="button full" type="submit">Enviar aviso</button>
              </form>
            </>
          )}
        </section>
      </main>
    </>
  )
}

function AlertsPage({ pets, locations }: { pets: Pet[]; locations: LocationRecord[] }) {
  return (
    <div className="page">
      <PageHeading eyebrow="AVISOS" title="Avisos recebidos" description="Locais informados por pessoas que viram seus pets." />
      <section className="panel">
        {locations.length ? (
          <ol className="timeline alerts-list">
            {[...locations].sort((a, b) => b.seenAt.localeCompare(a.seenAt)).map((location) => (
              <li key={location.id} className="alert-card">
                <span><Icon name="pin" size={19} /></span>
                <div>
                  <strong className="alert-pet-name">{pets.find((pet) => pet.id === location.petId)?.name ?? "Pet"}</strong>
                  <div className="alert-detail">
                    <span>Local</span>
                    <p>{location.city} – {location.state}</p>
                  </div>
                  <div className="alert-detail">
                    <span>Ponto de referência</span>
                    <p>{location.reference || "Não informado."}</p>
                  </div>
                  <div className="alert-detail">
                    <span>Data e hora</span>
                    <time>{formatDate(location.seenAt)}</time>
                  </div>
                  <div className="alert-detail">
                    <span>Observação</span>
                    <p>{location.details || "Nenhuma observação informada."}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty-state-simple"><Icon name="pin" size={36} /><h2>Nenhum aviso por enquanto.</h2></div>
        )}
      </section>
    </div>
  )
}

function WantedPage({ onAlert }: { onAlert: (pet: Pet) => void }) {
  const [filterState, setFilterState] = useState("")
  const [city, setCity] = useState("")
  const pets = store.pets().filter((pet) => {
    if (!pet.missing) return false
    const owner = store.users().find((item) => item.id === pet.userId)
    const petState = pet.missing.state || owner?.state || ""
    return (
      (!filterState || petState === filterState) &&
      (!city || pet.missing.city === city)
    )
  })
  return (
    <div className="page wanted-page">
      <button
        className="back-link"
        onClick={() => navigate(store.session() ? "dashboard" : "home")}
      >
        <Icon name="home" size={19} /> Voltar para a tela inicial
      </button>
      <PageHeading eyebrow="PROCURA-SE" title="Pets desaparecidos" description="Veja os animais que precisam de ajuda para voltar para casa." />
      <div className="wanted-filters">
        <SelectField label="Estado" name="wanted-state" value={filterState} required={false} onChange={(state) => { setFilterState(state); setCity("") }}>
          <option value="">Todos os estados</option>
          {states.map((state) => <option key={state}>{state}</option>)}
        </SelectField>
        <CityCombobox state={filterState} value={city} onChange={setCity} name="wanted-filter" label="Cidade" required={false} />
        <button className="button secondary" type="button" onClick={() => { setFilterState(""); setCity("") }}>
          Limpar filtro
        </button>
      </div>
      {pets.length ? (
        <div className="pet-grid wanted-grid">
          {pets.map((pet, index) => {
            const owner = store.users().find((item) => item.id === pet.userId)
            return (
              <article className="pet-card-full" key={pet.id}>
                <div className={`pet-banner banner-${index % 3}`}>
                  {pet.photo ? <img src={pet.photo} alt={`Foto do pet ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`.trim()} /> : <span aria-hidden="true"><Icon name={speciesIcon(pet.species)} size={68} /></span>}
                  <strong className="missing-badge">Desaparecido</strong>
                </div>
                <div className="pet-content">
                  <div className="pet-identity">
                    <div>
                      <span>Nome</span>
                      <strong>{pet.name}</strong>
                    </div>
                    <div>
                      <span>Tipo</span>
                      <PetTypeLabel species={pet.species} />
                    </div>
                  </div>
                  <dl>
                    <div><dt>Raça</dt><dd>{pet.breed || "Não informada"}</dd></div>
                    <div><dt>Cor</dt><dd>{pet.color || "Não informada"}</dd></div>
                    <div><dt>Sexo</dt><dd>{pet.sex || "Não informado"}</dd></div>
                  </dl>
                  <div className="wanted-location">
                    <strong>Último local visto</strong>
                    <p>{pet.missing?.city} – {pet.missing?.state || owner?.state || "UF"}{pet.missing?.reference ? ` · ${pet.missing.reference}` : ""}</p>
                    <time>{pet.missing && formatDate(pet.missing.seenAt)}</time>
                    {pet.missing?.notes && <p>{pet.missing.notes}</p>}
                  </div>
                  {owner && <div className="owner-contact"><span>Dono</span><strong>{owner.name}</strong><p>{owner.phone}</p></div>}
                  <button className="button full" onClick={() => onAlert(pet)}>Vi este pet</button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="panel empty-state-simple"><Icon name="pets" size={36} /><h2>Nenhum pet desaparecido nesta cidade.</h2></div>
      )}
    </div>
  )
}

function Profile({
  user,
  onSave,
}: {
  user: User
  onSave: (user: User) => void
}) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    city: user.city,
    state: user.state,
    reference: user.reference,
  })
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave({ ...user, ...form, name: form.name.trim() })
  }
  return (
    <div className="page narrow-page">
      <PageHeading
        eyebrow="MEU PERFIL"
        title="Seus dados"
        description="Mantenha suas informações de contato e endereço atualizadas."
      />
      <div className="profile-summary">
        <div className="avatar large-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <strong>{user.name}</strong>
          <p>{user.email}</p>
          <small>
            Conta criada em{" "}
            {new Intl.DateTimeFormat("pt-BR").format(new Date(user.createdAt))}
          </small>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={submit}>
        <Field
          label="Nome completo"
          name="profile-name"
          required
          value={form.name}
          onChange={(name) => setForm({ ...form, name })}
          autoComplete="name"
        />
        <Field
          label="E-mail"
          name="profile-email"
          value={user.email}
          onChange={() => {}}
          hint="O e-mail de acesso não pode ser alterado nesta versão."
        />
        <Field
          label="Telefone"
          name="profile-phone"
          type="tel"
          required
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          autoComplete="tel"
        />
        <div className="form-grid">
          <Field
            label="Cidade"
            name="profile-city"
            required
            value={form.city}
            onChange={(city) => setForm({ ...form, city })}
          />
          <SelectField
            label="Estado"
            name="profile-state"
            value={form.state}
            onChange={(state) => setForm({ ...form, state })}
          >
            <option value="">Selecione</option>
            {states.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </SelectField>
        </div>
        <Field
          label="Ponto de referência"
          name="profile-reference"
          value={form.reference}
          onChange={(reference) => setForm({ ...form, reference })}
        />
        <div className="form-actions">
          <button className="button" type="submit">
            <Icon name="check" /> Salvar alterações
          </button>
        </div>
      </form>
      <div className="privacy-card">
        <Icon name="shield" />
        <div>
          <strong>Privacidade dos seus dados</strong>
          <p>
            Todos os dados do PetLocal ficam armazenados localmente neste
            navegador. Ao limpar os dados do navegador, suas informações serão
            removidas.
          </p>
        </div>
      </div>
    </div>
  )
}

function ConfirmDialog({
  pet,
  onConfirm,
  onCancel,
}: {
  pet: Pet
  onConfirm: () => void
  onCancel: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-text"
      >
        <span className="danger-icon">
          <Icon name="trash" />
        </span>
        <h2 id="confirm-title">Excluir {pet.name}?</h2>
        <p id="confirm-text">
          Os dados do pet e todo o histórico de localizações serão removidos
          deste dispositivo. Esta ação não pode ser desfeita.
        </p>
        <div className="form-actions">
          <button
            ref={cancelRef}
            className="button secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button className="button danger" onClick={onConfirm}>
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [user, setUser] = useState<User | null>(
    () => store.users().find((item) => item.id === store.session()) ?? null,
  )
  const [pets, setPets] = useState<Pet[]>([])
  const [locations, setLocations] = useState<LocationRecord[]>([])
  const [draft, setDraft] = useState<RegisterDraft | null>(null)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null)
  const [selectedPublicPet, setSelectedPublicPet] = useState<Pet | null>(() => {
    const selectedId = sessionStorage.getItem("petlocal_selected_pet_v1")
    return store.pets().find((pet) => pet.id === selectedId) ?? null
  })
  const [notice, setNotice] = useState<Notice>(null)
  const [, setDemoVersion] = useState(0)

  const refresh = (activeUser = user) => {
    if (!activeUser) return
    setPets(store.pets().filter((pet) => pet.userId === activeUser.id))
    setLocations(
      store.locations().filter((location) => location.userId === activeUser.id),
    )
  }
  useEffect(() => {
    ensureDemoData().then(() => {
      setDemoVersion((version) => version + 1)
      refresh()
    })
  }, [])
  useEffect(() => {
    const update = () => setRoute(routeFromHash())
    window.addEventListener("hashchange", update)
    if (!window.location.hash) navigate(user ? "dashboard" : "home")
    return () => window.removeEventListener("hashchange", update)
  }, [])
  useEffect(() => {
    refresh()
  }, [user])
  useEffect(() => {
    if (!user && !publicRoutes.includes(route)) navigate("login")
    if (
      user &&
      publicRoutes.includes(route) &&
      route !== "home" &&
      route !== "register" &&
      route !== "forgot" &&
      route !== "found" &&
      route !== "wanted" &&
      route !== "alert"
    )
      navigate("dashboard")
  }, [route, user])

  const login = (activeUser: User) => {
    setUser(activeUser)
    navigate("dashboard")
    setNotice({
      type: "success",
      text: `Bem-vindo, ${activeUser.name.split(" ")[0]}!`,
    })
  }
  const logout = () => {
    store.clearSession()
    setUser(null)
    setPets([])
    setLocations([])
    navigate("home")
  }
  const complete = (activeUser: User) => {
    setDraft(null)
    setUser(activeUser)
    navigate("dashboard")
    setNotice({
      type: "success",
      text: "Conta criada com sucesso. Seu primeiro pet já está cadastrado!",
    })
  }
  const savePet = (pet: Pet) => {
    store.savePet(pet)
    refresh()
    setEditingPet(null)
    navigate("pets")
    setNotice({
      type: "success",
      text: `${pet.name} foi ${
        pets.some((item) => item.id === pet.id) ? "atualizado" : "cadastrado"
      } com sucesso.`,
    })
  }
  const deletePet = () => {
    if (!deletingPet) return
    const name = deletingPet.name
    store.deletePet(deletingPet.id)
    setDeletingPet(null)
    refresh()
    setNotice({ type: "success", text: `${name} foi excluído com sucesso.` })
  }
  const saveLocation = (location: LocationRecord) => {
    store.saveLocation(location)
    refresh()
    setNotice({ type: "success", text: "Localização registrada com sucesso." })
  }
  const saveUser = (updated: User) => {
    store.saveUser(updated)
    setUser(updated)
    setNotice({ type: "success", text: "Perfil atualizado com sucesso." })
  }
  const openAlert = (pet: Pet) => {
    sessionStorage.setItem("petlocal_selected_pet_v1", pet.id)
    setSelectedPublicPet(pet)
    navigate("alert")
  }

  let content: React.ReactNode
  if (route === "home") content = <Home />
  else if (route === "register") content = <Register onDraft={setDraft} />
  else if (route === "onboarding")
    content = <Onboarding draft={draft} onComplete={complete} />
  else if (route === "login") content = <Login onLogin={login} />
  else if (route === "forgot") content = <Forgot />
  else if (route === "found")
    content = user ? (
      <AppShell route="found" user={user} onLogout={logout}>
        <FoundPetAccess onAlert={openAlert} showHeader={false} />
      </AppShell>
    ) : (
      <FoundPetAccess onAlert={openAlert} />
    )
  else if (route === "alert")
    content = user ? (
      <AppShell route="found" user={user} onLogout={logout}>
        <AlertOwnerForm
          pet={selectedPublicPet}
          showHeader={false}
          onSave={(location) => {
            store.saveLocation(location)
            refresh()
          }}
        />
      </AppShell>
    ) : (
      <AlertOwnerForm
        pet={selectedPublicPet}
        onSave={(location) => {
          store.saveLocation(location)
          refresh()
        }}
      />
    )
  else if (route === "wanted")
    content = user ? (
      <AppShell route="wanted" user={user} onLogout={logout}>
        <WantedPage onAlert={openAlert} />
      </AppShell>
    ) : (
      <>
        <PublicHeader />
        <main className="public-wanted-main">
          <WantedPage onAlert={openAlert} />
        </main>
      </>
    )
  else if (!user) content = null
  else if (route === "pet-form")
    content = (
      <AppShell route="pets" user={user} onLogout={logout}>
        <PetForm
          existing={editingPet}
          userId={user.id}
          onSave={savePet}
          onCancel={() => {
            setEditingPet(null)
            navigate("pets")
          }}
        />
      </AppShell>
    )
  else {
    const page =
      route === "dashboard" ? (
        <Dashboard user={user} pets={pets} locations={locations} />
      ) : route === "pets" ? (
        <PetsPage
          pets={pets}
          onEdit={(pet) => {
            setEditingPet(pet)
            navigate("pet-form")
          }}
          onDelete={setDeletingPet}
          onUpdatePet={savePet}
        />
      ) : route === "location" ? (
        <AlertsPage pets={pets} locations={locations} />
      ) : (
        <Profile user={user} onSave={saveUser} />
      )
    content = (
      <AppShell route={route} user={user} onLogout={logout}>
        {page}
      </AppShell>
    )
  }
  return (
    <>
      <NoticeBar notice={notice} clear={() => setNotice(null)} />
      {content}
      {deletingPet && (
        <ConfirmDialog
          pet={deletingPet}
          onConfirm={deletePet}
          onCancel={() => setDeletingPet(null)}
        />
      )}
    </>
  )
}
