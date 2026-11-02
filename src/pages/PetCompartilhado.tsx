// Tela aberta pelo link de compartilhamento: mostra SOMENTE o pet desaparecido que foi compartilhado.
import { Icon } from "../Icons"
import { ShareButton } from "../components/ShareButton"
import { PageHeading } from "../components/PageHeading"
import { PetTypeLabel, speciesIcon } from "../components/SpeciesField"
import { formatDate } from "../data"
import { navigate } from "../routes"
import { readSharedPet } from "../share"
import { whatsappLink } from "../contact"

export function PetCompartilhado() {
  const pet = readSharedPet()
  if (!pet)
    return (
      <div className="page wanted-page">
        <div className="panel empty-state-simple">
          <Icon name="warning" size={36} />
          <h1>Este link não está completo</h1>
          <p>Peça para quem compartilhou enviar o link novamente, ou veja todos os pets desaparecidos.</p>
          <button className="button" type="button" onClick={() => navigate("wanted")}>
            Ver o Procura-se
          </button>
        </div>
      </div>
    )
  return (
    <div className="page wanted-page shared-page">
      <PageHeading
        eyebrow="PROCURA-SE"
        title={`${pet.name} está desaparecido`}
        description="Se você viu este animal, avise o tutor. Qualquer informação ajuda."
      />
      <article className="pet-card-full">
        <div className="pet-banner banner-0">
          {pet.photo ? (
            <img src={pet.photo} alt={`Foto do pet ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`.trim()} />
          ) : (
            <span aria-hidden="true"><Icon name={speciesIcon(pet.species)} size={68} /></span>
          )}
          <strong className="missing-badge">Desaparecido</strong>
        </div>
        <div className="pet-content">
          <div className="pet-identity">
            <div><span>Nome</span><strong>{pet.name}</strong></div>
            <div><span>Tipo</span><PetTypeLabel species={pet.species} /></div>
          </div>
          <dl>
            <div><dt>Raça</dt><dd>{pet.breed || "Não informada"}</dd></div>
            <div><dt>Cor</dt><dd>{pet.color || "Não informada"}</dd></div>
            <div><dt>Sexo</dt><dd>{pet.sex || "Não informado"}</dd></div>
          </dl>
          <div className="wanted-location">
            <strong>Último local visto</strong>
            <p>{pet.city}{pet.state ? ` – ${pet.state}` : ""}{pet.reference ? ` · ${pet.reference}` : ""}</p>
            {pet.seenAt && !Number.isNaN(new Date(pet.seenAt).getTime()) && <time dateTime={pet.seenAt}>{formatDate(pet.seenAt)}</time>}
            {pet.notes && <p>{pet.notes}</p>}
          </div>
          {pet.ownerPhone && (
            <div className="owner-contact"><span>Tutor</span><strong>{pet.ownerName}</strong><p>{pet.ownerPhone}</p></div>
          )}
          <div className="result-actions">
            {pet.ownerPhone && (
              <a className="button" href={`tel:${pet.ownerPhone.replace(/\D/g, "")}`} aria-label={`Ligar para o tutor de ${pet.name}`}>
                Ligar para o tutor
              </a>
            )}
            {pet.ownerPhone && (
              <a
                className="button secondary"
                href={whatsappLink(pet.ownerPhone, `Olá! Vi o aviso de ${pet.name} no PetLocal.`)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chamar no WhatsApp o tutor de ${pet.name} (abre em nova aba)`}
              >
                Chamar no WhatsApp
              </a>
            )}
            <ShareButton pet={pet} />
          </div>
        </div>
      </article>
      <button className="back-link" type="button" onClick={() => navigate("wanted")}>
        Ver todos os pets desaparecidos
      </button>
    </div>
  )
}
