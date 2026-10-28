// Tela 'Avisar o dono': quem achou um pet informa onde, quando e como ele está.
import { FormEvent, useState } from "react"
import { CityCombobox } from "../CityCombobox"
import { Icon } from "../Icons"
import { Field, SelectField } from "../components/Field"
import { BackHome } from "../components/BackHome"
import { PublicHeader } from "../components/PublicHeader"
import { speciesIcon } from "../components/SpeciesField"
import { states } from "../constants"
import { LocationRecord, makeId, Pet, store } from "../data"
import { navigate } from "../routes"
import { validateForm } from "../formValidation"

export function AvisarDono({
  pet,
  onSave,
  showHeader = true,
}: {
  pet: Pet | null
  onSave: (location: LocationRecord) => void
  showHeader?: boolean
}) {
  // De onde a pessoa veio: o botão "Voltar" leva de volta para a mesma tela.
  const origin: "found" | "wanted" =
    sessionStorage.getItem("petlocal_alert_origin_v1") === "wanted" ? "wanted" : "found"
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
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const problem = validateForm(event.currentTarget)
    if (problem) return setError(problem)
    if (!pet || !owner) return
    if (!form.city.trim()) {
      setError(
        "Escolha a cidade na lista que aparece ao digitar, para garantir que o nome esteja correto.",
      )
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
  const Page = showHeader ? "main" : "div"
  return (
    <>
      {showHeader && <PublicHeader />}
      <Page className="found-page">
        <div className="page-back-actions">
          <button className="back-link" onClick={() => navigate(origin)}>
            {origin === "wanted" ? "← Voltar para o Procura-se" : "← Voltar para a busca"}
          </button>
          <BackHome />
        </div>
        <section className="found-access-card">
          {!pet || !owner ? (
            <div className="empty-state-simple">
              <h1>Pet não selecionado</h1>
              <p>Volte e escolha o pet que você viu.</p>
              <button className="button" onClick={() => navigate(origin)}>
                {origin === "wanted" ? "Ver o Procura-se" : "Buscar pet"}
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
              <form className="form-panel public-alert-form" onSubmit={submit} noValidate>
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
      </Page>
    </>
  )
}
