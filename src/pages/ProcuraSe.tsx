// Tela 'Procura-se': lista os pets desaparecidos, com filtro por estado e cidade.
import { useState } from "react"
import { CityCombobox } from "../CityCombobox"
import { Icon } from "../Icons"
import { BackHome } from "../components/BackHome"
import { SelectField } from "../components/Field"
import { PageHeading } from "../components/PageHeading"
import { UseLocationButton } from "../components/UseLocationButton"
import { PetTypeLabel, speciesIcon } from "../components/SpeciesField"
import { states } from "../constants"
import { formatDate, Pet, store, User } from "../data"
import { ShareButton } from "../components/ShareButton"
import { toSharedPet } from "../share"
import { navigate } from "../routes"
import { whatsappLink } from "../contact"

const sameText = (a: string, b: string) =>
  a.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() ===
  b.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()

export function ProcuraSe({ onAlert, user }: { onAlert: (pet: Pet) => void; user?: User | null }) {
  const [filterState, setFilterState] = useState("")
  const [city, setCity] = useState("")
  const users = store.users()
  // Prioridade: com a pessoa logada, primeiro os pets da mesma cidade dela; dentro de cada grupo,
  // os avisos mais recentes primeiro. Sem login, só ordena pelo mais recente.
  const isNear = (pet: Pet) => {
    if (!user || !pet.missing || !user.city) return false
    const petState = pet.missing.state || users.find((item) => item.id === pet.userId)?.state || ""
    return sameText(pet.missing.city, user.city) && (!user.state || !petState || petState === user.state)
  }
  const pets = store
    .pets()
    .filter((pet) => {
      if (!pet.missing) return false
      const owner = users.find((item) => item.id === pet.userId)
      const petState = pet.missing.state || owner?.state || ""
      return (
        (!filterState || petState === filterState) &&
        (!city || pet.missing.city === city)
      )
    })
    .sort((a, b) => {
      const near = Number(isNear(b)) - Number(isNear(a))
      if (near) return near
      return new Date(b.missing!.seenAt).getTime() - new Date(a.missing!.seenAt).getTime()
    })
  return (
    <div className="page wanted-page">
      <BackHome />
      <PageHeading eyebrow="PROCURA-SE" title="Pets desaparecidos" description="Veja os animais que precisam de ajuda para voltar para casa." />
      {user?.city && (
        <p className="fieldset-help">
          Os pets de {user.city} aparecem primeiro, dos mais recentes para os mais antigos.
        </p>
      )}
      {!user && (
        <p className="fieldset-help">Os avisos mais recentes aparecem primeiro.</p>
      )}
      <UseLocationButton
        label="Filtrar pela minha localização atual"
        onLocated={({ city, state }) => { setFilterState(state); setCity(city) }}
      />
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
                  {isNear(pet) && <strong className="near-badge">Perto de você</strong>}
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
                    <time dateTime={pet.missing?.seenAt}>{pet.missing && formatDate(pet.missing.seenAt)}</time>
                    {pet.missing?.notes && <p>{pet.missing.notes}</p>}
                  </div>
                  {owner && <div className="owner-contact"><span>Dono</span><strong>{owner.name}</strong><p>{owner.phone}</p></div>}
                  <div className="result-actions">
                    <button className="button" onClick={() => onAlert(pet)} aria-label={`Vi este pet, ${pet.name}: avisar o dono`}>Vi este pet</button>
                    {toSharedPet(pet, owner) && <ShareButton pet={toSharedPet(pet, owner)!} />}
                    {owner && (
                      <a className="button secondary" href={`tel:${owner.phone.replace(/\D/g, "")}`} aria-label={`Ligar para o dono de ${pet.name}, ${owner.name}`}>Ligar para o dono</a>
                    )}
                    {owner && (
                      <a className="button secondary" href={whatsappLink(owner.phone, `Olá! Vi ${pet.name} (anúncio Procura-se no PetLocal).`)} target="_blank" rel="noopener noreferrer" aria-label={`Chamar no WhatsApp, dono de ${pet.name} (abre em nova aba)`}>Chamar no WhatsApp</a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="panel empty-state-simple" role="status"><Icon name="pets" size={36} /><h2>Nenhum pet desaparecido {city ? "nesta cidade" : filterState ? "neste estado" : "no momento"}.</h2><p>Isso é uma boa notícia. Tente outra cidade ou clique em “Limpar filtro”.</p></div>
      )}
    </div>
  )
}
