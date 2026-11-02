// Botão "Usar minha localização atual": pede permissão ao navegador, descobre cidade e estado
// pelas coordenadas (serviço OpenStreetMap/Nominatim) e entrega tudo pronto para preencher o formulário.
import { useState } from "react"
import { resolveCityName } from "../CityCombobox"
import { Icon } from "../Icons"

export type FoundLocation = {
  city: string
  state: string
  latitude: number
  longitude: number
}

type Status = { kind: "info" | "error"; text: string } | null

async function reverseGeocode(latitude: number, longitude: number) {
  const url =
    "https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=10" +
    `&accept-language=pt-BR&lat=${latitude}&lon=${longitude}`
  const response = await fetch(url)
  if (!response.ok) throw new Error("Serviço de endereços indisponível")
  const data = (await response.json()) as {
    address?: Record<string, string>
  }
  const address = data.address ?? {}
  const state = (address["ISO3166-2-lvl4"] ?? "").replace(/^BR-/, "")
  const city =
    address.city ?? address.town ?? address.village ?? address.municipality ?? ""
  if (!state || !city) throw new Error("Cidade não encontrada")
  return { city, state }
}

export function UseLocationButton({
  onLocated,
  label = "Usar minha localização atual",
  className = "button secondary",
}: {
  onLocated: (location: FoundLocation) => void
  label?: string
  className?: string
}) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus({
        kind: "error",
        text: "Seu navegador não permite usar a localização. Escolha o estado e a cidade manualmente.",
      })
      return
    }
    setBusy(true)
    setStatus({ kind: "info", text: "Pedindo autorização ao navegador…" })
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setStatus({ kind: "info", text: "Descobrindo sua cidade…" })
        try {
          const found = await reverseGeocode(coords.latitude, coords.longitude)
          const city = await resolveCityName(found.state, found.city)
          onLocated({
            city,
            state: found.state,
            latitude: coords.latitude,
            longitude: coords.longitude,
          })
          setStatus({ kind: "info", text: `Localização preenchida: ${city} – ${found.state}.` })
        } catch {
          setStatus({
            kind: "error",
            text: "Encontramos sua posição, mas não deu para descobrir a cidade. Escolha o estado e a cidade manualmente.",
          })
        } finally {
          setBusy(false)
        }
      },
      (failure) => {
        setBusy(false)
        setStatus({
          kind: "error",
          text:
            failure.code === failure.PERMISSION_DENIED
              ? "A permissão de localização foi negada. Libere nas configurações do navegador ou escolha o estado e a cidade manualmente."
              : "Não foi possível obter sua localização. Escolha o estado e a cidade manualmente.",
        })
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    )
  }

  return (
    <div className="locate-box">
      <button type="button" className={className} onClick={locate} disabled={busy}>
        <Icon name="gps" /> {busy ? "Buscando localização…" : label}
      </button>
      <div role="status" aria-live="polite">
        {status && (
          <p className={`gps-status ${status.kind === "error" ? "error" : ""}`}>{status.text}</p>
        )}
      </div>
    </div>
  )
}
