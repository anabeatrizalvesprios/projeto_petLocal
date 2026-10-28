// Painel principal da área logada: resumo de pets e avisos.
import { Icon } from "../Icons"
import { Empty } from "../components/Empty"
import { PageHeading } from "../components/PageHeading"
import { speciesIcon } from "../components/SpeciesField"
import { formatDate, LocationRecord, Pet, User } from "../data"
import { navigate } from "../routes"

export function PainelPrincipal({
  user,
  pets,
  locations,
}: {
  user: User
  pets: Pet[]
  locations: LocationRecord[]
}) {
  // Só avisos ainda não vistos aparecem aqui; os vistos ficam na tela Avisos.
  const unseen = locations.filter((location) => !location.seen)
  const latest = [...unseen].sort((a, b) => b.seenAt.localeCompare(a.seenAt))[0]
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
            <strong>{unseen.length}</strong>
            <p>
              {unseen.length === 1 ? "aviso novo" : "avisos novos"}
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
              <h2>Último aviso novo</h2>
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
              <strong>Nenhum aviso novo por enquanto.</strong>
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
